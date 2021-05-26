const Trade = require('../../models/trade');
const Portfolio = require('../../models/portfolio');
const {messages,statusCode} = require('../../messages.json');
const {doAverage,calculateTotalPrice} = require('../../common/common');
const {BUY,SELL} = require('../../constants');

const companyNames = {
    'REL':'Reliance Industries',
    'WIP':'Wipro pvt ltd',
    'ITC':'Itc pvt ltd'
}

const addTrade = async (req,res) => {
    let portfolio;
    const {price,quantity,type,userId,ticker} = req.body;
    const tradeSign = type === BUY ? 1 : -1;
    const userPortfolio = await Portfolio.find({userId});

    if(userPortfolio.length === 0) {
        if(type === SELL){
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.CAN_NOT_SELL_FIRST
            });
        }

        portfolio =  await Portfolio.create({
            userId,
            totalInvestment:calculateTotalPrice(req.body.price,req.body.quantity),
            returnValue:0,
            returnPercentage:0,
            securities:[{
                label:companyNames[ticker],
                ticker,
                quantity,
                avgPrice:price,
                totalPrice:calculateTotalPrice(price,quantity)
            }]
        });

    } else {
        portfolio = userPortfolio[0];
        let securityObj = portfolio.securities.find((s) => s.ticker === ticker) || {};

        //if no security found
        if(Object.keys(securityObj).length === 0) {
            if(type === SELL){ //can not sell before sell
                return res.status(statusCode.INTERNAL_SERVER).json({
                    success:false,
                    error:true,
                    message:messages.CAN_NOT_SELL_FIRST
                });
            }
            portfolio.securities.push(securityObj); //buying for the first time
        }

        if(type === SELL) {
            if(quantity > securityObj.quantity) {
                return res.status(statusCode.INTERNAL_SERVER).json({
                    success:false,
                    error:true,
                    message:messages.INVALID_QUANTITY
                });
            }
        }

        const tradePrice = calculateTotalPrice(price,quantity);
        securityObj.label = companyNames[ticker];
        securityObj.ticker = ticker;
        securityObj.quantity = (securityObj.quantity || 0) + (tradeSign)*quantity ;
        securityObj.totalPrice = (securityObj.totalPrice || 0) + (tradeSign)*calculateTotalPrice(price,quantity);
        securityObj.avgPrice = doAverage(securityObj.totalPrice, securityObj.quantity);
        portfolio.totalInvestment += (tradeSign)*tradePrice;
        await Portfolio.updateOne({userId},portfolio);
    }

    await Trade.create({
        portfolioId:portfolio._id,
        ...req.body
    });

    res.status(200).json({message:'Transaction successfull'});
}

const updateTrade = async (req,res) => {

}

const removeTrade = async (req,res) => {

}


module.exports = {
    addTrade
}