const express = require('express');
const propertyRoutes=require('./routes/property')
const userRoutes= require('./routes/user')
const bidsRoutes= require('./routes/bids')
const requestRoutes= require('./routes/request')
const roomRoutes= require('./routes/room')
const messageRoutes=require('./routes/messages')
const favouriteRoutes=require('./routes/favourites')

const router = express.Router();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.use('/api/property', propertyRoutes);
router.use('/api/user', userRoutes);
router.use('/api/bids', bidsRoutes);
router.use('/api/request',requestRoutes);
router.use('/api/room',roomRoutes);
router.use('/api/messages',messageRoutes);
router.use('/api/favourites',favouriteRoutes);
router.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.id}`);
});

module.exports = router;