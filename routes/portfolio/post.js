const Trade = require('../../models/trade');
const Portfolio = require('../../models/portfolio');
const {messages,statusCode} = require('../../constants.json');
const {doAverage,calculateTotalPrice} = require('../../common/common');

const companyNames = {
    'REL':'Reliance Industries',
    'WIPRO':'Wipro pvt ltd',
    'ITC':'Itc pvt ltd'
}

const addTrade = async (req,res) => {
    const {price,quantity,type,userId,ticker} = req.body;
    let portfolio;
    const userPortfolio = await Portfolio.find({userId});

    if(userPortfolio.length === 0) {
        if(type === "sell"){
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
        let securityObj = portfolio.securities.find((s) => s.ticker === ticker);

        //if one does not own share of the company.
        if(type==="sell" && !securityObj) {
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.CAN_NOT_SELL_FIRST
            });
        }
        const tradePrice = calculateTotalPrice(price,quantity);

        if(type==="buy") {
            s.quantity+=quantity;
            s.totalPrice += calculateTotalPrice(price,quantity);
            s.avgPrice = doAverage(s.totalPrice, s.quantity);
            portfolio.totalInvestment = portfolio.totalInvestment + tradePrice;
        } else if(type==="sell") {
            if(quantity > s.quantity) {
                return res.status(statusCode.INTERNAL_SERVER).json({
                    success:false,
                    error:true,
                    message:messages.INVALID_QUANTITY
                });
            }
            s.quantity-=quantity;
            s.totalPrice -= calculateTotalPrice(price,quantity);
            s.avgPrice = doAverage(s.totalPrice, s.quantity);
            portfolio.totalInvestment = portfolio.totalInvestment - tradePrice;
        } else {
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.INVALID_TRADE_TYPE
            });
        }
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