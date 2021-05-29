const router = require('express').Router();
const portfolio = require('./portfolio');

router.get('/',(req,res) => {
    res.json({foo:"bar"})
})

router.use('/api/v1',portfolio);

module.exports = router;