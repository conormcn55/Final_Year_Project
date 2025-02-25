const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const routes = require('./api/routes');
const path = require('path');
require('dotenv').config();
const Message = require('./models/messages');

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.io with proper CORS for Render
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://your-render-app.onrender.com",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  // These settings help with Render and other cloud platforms
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // Increase timeout for better stability
  maxHttpBufferSize: 1e8 // Increase buffer size if needed
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User Connected to Socket: ${socket.id}`);

  // Handle room joining
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User ${socket.id} joined room: ${data}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      console.log("Received message data:", data);
      
      const newMessage = new Message({
        sentBy: data.sentBy,
        room: data.room,
        message: data.message,
        time: new Date()
      });
      
      const savedMessage = await newMessage.save();
      
      console.log("Saved message:", savedMessage);
      io.to(data.room).emit("receive_message", savedMessage);
      console.log("Emitted message to room:", data.room);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", {
        room: data.room,
        error: "Failed to send message"
      });
    }
  });

  // Handle bid submissions - key fix is using io.to() instead of socket.broadcast
  socket.on("submit_bid", (data) => {
    // Use io.to() to emit to all clients in the room INCLUDING the sender
    io.to(data.room).emit("receive_bid", {
      bid: data.bid,
      room: data.room,
      userName: data.userName,
      newSaleDate: data.newSaleDate
    });
    console.log(`New bid in room ${data.room}: €${data.bid} by ${data.userName}`);
  });

  // Handle disconnections
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.id} disconnected: ${reason}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
});

// Configure CORS for Express
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Changed from 'strict' to 'none' for Render
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Database"))
  .catch(error => console.error("MongoDB connection error:", error));

// API routes
app.use('/', routes);

// For React app hosting in production (if you want to serve frontend from same server)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

server.listen(PORT, () => {
  console.log(`Server and WebSocket listening on port ${PORT}`);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});