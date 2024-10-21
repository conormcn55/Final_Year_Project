const express = require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const routes = require('./api/routes');
const app = express();
const passport = require('passport');
const session = require('express-session');
const PORT = process.env.PORT || 3001;

require('dotenv').config();


app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET, // stored securely in an env variable
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://127.0.0.1:27017/FinalProject")
    .then(()=>console.log("Connected to Database"))
    .catch(console.error);

    app.use('/', routes);
app.listen(PORT, () => console.log("Server started on port 3001"));

