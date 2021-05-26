const router = require('express').Router();
const portfolio = require('./portfolio');


router.use('/api/v1',portfolio);

module.exports = router;