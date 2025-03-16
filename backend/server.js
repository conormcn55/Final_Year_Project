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

// Set server port from environment variables with fallback to 3001
const PORT = process.env.PORT || 3001;

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'], // Support both WebSocket and HTTP long-polling
  pingTimeout: 60000, // Connection timeout in milliseconds
  maxHttpBufferSize: 1e8 // Maximum size of HTTP messages (100MB)
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`User Connected to Socket: ${socket.id}`);

  // Handle room joining
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User ${socket.id} joined room: ${data}`);
  });

  // Handle message sending
  socket.on("send_message", async (data) => {
    try {
      console.log("Received message data:", data);
      // Create new message document
      const newMessage = new Message({
        sentBy: data.sentBy,
        room: data.room,
        message: data.message,
        time: new Date()
      });
      // Save message to database
      const savedMessage = await newMessage.save();
      console.log("Saved message:", savedMessage);
      // Broadcast message to everyone in the room
      io.to(data.room).emit("receive_message", savedMessage);
      console.log("Emitted message to room:", data.room);
    } catch (error) {
      console.error("Error sending message:", error);
      // Send error back to sender
      socket.emit("message_error", {
        room: data.room,
        error: "Failed to send message"
      });
    }
  });

  // Handle bid submissions for auctions
  socket.on("submit_bid", (data) => {
    // Broadcast new bid to everyone in the room
    io.to(data.room).emit("receive_bid", {
      bid: data.bid,
      room: data.room,
      userName: data.userName,
      newSaleDate: data.newSaleDate
    });
    console.log(`New bid in room ${data.room}: €${data.bid} by ${data.userName}`);
  });

  // Handle client disconnection
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.id} disconnected: ${reason}`);
  });

  // Handle socket errors
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
});

// Configure CORS middleware for Express
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure request body parsers
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Trust the first proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Check if running in localhost environment
const isLocalhost = process.env.CLIENT_URL.includes('localhost');

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // Store sessions in MongoDB
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  // Configure cookies based on environment
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false, // Use secure cookies in production
    sameSite: isLocalhost ? 'lax' : 'none' // Allow cross-site cookies in production
  }
}));

// Initialize Passport authentication
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Database"))
  .catch(error => console.error("MongoDB connection error:", error));

// Set up API routes
app.use('/', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve React frontend static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  // For any unknown routes, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server and WebSocket listening on port ${PORT}`);
  // Log environment variables for debugging
  console.log('Google Client ID:', process.env.GOOGLECLIENTID);
  console.log('Google URL:', process.env.GOOGLEURL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});