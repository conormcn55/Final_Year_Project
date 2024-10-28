const express = require('express');
const propertyRoutes=require('./routes/property')
const userRoutes= require('./routes/user')
const router = express.Router();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.use('/api/property', propertyRoutes);
router.use('/api/user', userRoutes);
router.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.id}`);
});

module.exports = router;