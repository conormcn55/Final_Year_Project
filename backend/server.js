const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const routes = require('./api/routes');
const path = require('path');
require('dotenv').config();

const app = express();
const http = require("http");
const {Server}= require("socket.io");
const PORT = process.env.PORT || 3001;

const server = http.createServer(app)
const io = new Server(server, {
  cors:{
    origin: "http://localhost:3000",
    methods:['GET', 'POST', 'PUT', 'DELETE']
  }
})

io.on("connection",(socket) => {
console.log(`User Connected to Socket:${socket.id}`);

socket.on("join_room", (data) => {
  socket.join(data);
});

socket.on("submit_bid", (data) => {
  socket.broadcast.emit("receive_bid", {
    bid: data.bid,
    room: data.room,
    userName: data.userName,
    newSaleDate: data.newSaleDate
  });
  console.log(data);
});
});
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/FinalProject',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/FinalProject")
  .then(() => console.log("Connected to Database"))
  .catch(console.error);


app.use('/', routes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
server.listen(3002, ()=>{//web socket 
  console.log("Web Socket is Listening");
}
);