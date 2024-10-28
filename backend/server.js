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
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({ limit: '100mb' })); // Adjust the limit as needed
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
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// 4. Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/FinalProject")
  .then(() => console.log("Connected to Database"))
  .catch(console.error);

// Routes
app.use('/', routes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));