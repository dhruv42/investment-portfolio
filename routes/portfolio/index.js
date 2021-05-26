const portfolioRouter = require('express').Router();
const validate = require('../../middleware/validator');
const get = require('./get');
const post = require('./post');

// Fetch calls
portfolioRouter.get('/investments',get.fetchInvestments);
portfolioRouter.get('/trades',get.fetchTrades);


//Update calls
portfolioRouter.post('/trade',validate('addTradeSchema'),post.addTrade);


module.exports = portfolioRouter;