const express = require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const routes = require('./api/routes');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();


app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/FinalProject")
    .then(()=>console.log("Connected to Database"))
    .catch(console.error);

    app.use('/', routes);
app.listen(PORT, () => console.log("Server started on port 3001"));

