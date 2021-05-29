const Portfolio = require('../models/portfolio');
const Trade = require('../models/trade');

function calculateTotalPrice(price,quantity) {
    return parseFloat((price*quantity).toFixed(3));
}

function calculateTotalInvestment(portfolio) {
    portfolio.totalInvestment = 0;
    portfolio.securities.map((s) => portfolio.totalInvestment+=s.totalPrice);
}

function doAverage(total,quantity) {
    return parseFloat((total/quantity).toFixed(3));
}

// when we update or remove the trade, we go back to previous state in the portfolio
function revertTrade(security,modifyingTrade,revertSign){
    security.quantity += (revertSign) * modifyingTrade.quantity;
    switch(revertSign){
        case -1:
            // reverting buy
            security.totalPrice += (revertSign)*calculateTotalPrice(modifyingTrade.price,modifyingTrade.quantity);
            security.avgPrice = doAverage(security.totalPrice,security.quantity);
            break;
        case 1:
            // reverting sell
            security.totalPrice = (revertSign)*calculateTotalPrice(security.avgPrice,security.quantity);
            break;
        default:
            break;
    }
}


// remove securities from portfolio having 0 quantity and calculate total investment of the portfolio
function settlePortfolio(portfolio){
    portfolio.securities = portfolio.securities.filter((s) => s.quantity > 0);
    calculateTotalInvestment(portfolio);
}

async function checkIfTheLatestTrade(trade){
    try {
        const latest = await Trade.find({ticker:trade.ticker},{},{limit:1}).sort({_id:-1}).lean();
        return latest[0]._id.toString() === trade._id.toString();
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    calculateTotalPrice,
    doAverage,
    revertTrade,
    checkIfTheLatestTrade,
    settlePortfolio,
    calculateTotalInvestment
}