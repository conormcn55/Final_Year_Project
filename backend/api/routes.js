const express = require('express');
const propertyRoutes=require('./routes/property')
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Conor API');
});

router.use('/api/property', propertyRoutes);


module.exports = router;