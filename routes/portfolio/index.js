const portfolioRouter = require('express').Router();
const validate = require('../../middleware/validator');
const get = require('./get');
const post = require('./post');

// Fetch calls
portfolioRouter.get('/returns',get.fetchReturns);
portfolioRouter.get('/trades',get.fetchTrades);
portfolioRouter.get('/portfolio',get.fetchPortfolio);


//Update calls
portfolioRouter.post('/trade',validate('addTradeSchema'),post.addTrade);
portfolioRouter.put('/trade/:id',validate('updateTradeSchema'),post.updateTrade);
portfolioRouter.delete('/trade/:id',post.removeTrade);


module.exports = portfolioRouter;