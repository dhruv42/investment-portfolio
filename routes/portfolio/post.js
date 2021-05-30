const Trade = require('../../models/trade');
const Portfolio = require('../../models/portfolio');
const {messages,statusCode} = require('../../messages.json');
const {
    doAverage,calculateTotalPrice,
    checkIfTheLatestTrade,revertTrade,settlePortfolio,
    calculateTotalInvestment,settleSecurity
} = require('../../common/common');
const {BUY,SELL} = require('../../constants');

const addTrade = async (req,res) => {
    let portfolio;
    const {price,quantity,type,ticker} = req.body;
    const tradeSign = type === BUY ? 1 : -1;
    const userPortfolio = await Portfolio.find();

    if(userPortfolio.length === 0) {
        if(type === SELL){
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.CAN_NOT_SELL_FIRST
            });
        }

        portfolio =  await Portfolio.create({
            totalInvestment:calculateTotalPrice(req.body.price,req.body.quantity),
            returnValue:0,
            returnPercentage:0,
            securities:[{
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
            if(type === SELL){ //can not sell before buying
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
        securityObj.ticker = ticker;
        securityObj.quantity = (securityObj.quantity || 0) + (tradeSign)*quantity;
        if(type === BUY){
            securityObj.totalPrice = (securityObj.totalPrice || 0) + (tradeSign)*tradePrice;
            securityObj.avgPrice = doAverage(securityObj.totalPrice, securityObj.quantity);
        } else {
            securityObj.totalPrice = calculateTotalPrice(securityObj.avgPrice,securityObj.quantity);
        }
        settlePortfolio(portfolio);
        calculateTotalInvestment(portfolio);
        await Portfolio.updateOne({_id:portfolio._id},portfolio);
    }

    const trade = await Trade.create({
        portfolioId:portfolio._id,
        ...req.body
    });
    
    return res.status(statusCode.OK).json({
        success:true,
        error:false,
        data:trade
    });
}

const updateTrade = async (req,res) => {
    
    const id = req.params.id;
    let tradeToUpdate = await Trade.findById(id).lean();
    if(!tradeToUpdate) {
        return res.status(statusCode.NOT_FOUND).json({
            success:false,
            error:true,
            message:messages.INVALID_TRADE
        });
    }
    const finalObject = {...tradeToUpdate}; //creating a new trade object so we do not lose old one.

    const {price,quantity,ticker,type} = req.body;
    const latest = await checkIfTheLatestTrade(tradeToUpdate);

    if(!latest){
        return res.status(statusCode.FORBIDDEN).json({
            success:false,
            error:true,
            message:messages.MODIFY_LAST_TRADE
        }); 
    }


    const portfolio = await Portfolio.findById(tradeToUpdate.portfolioId).lean();
    const index = portfolio.securities.findIndex((s) => s.ticker === tradeToUpdate.ticker);

    // if we do not find the security in portfolio, we return from here.
    if(index<0){
        return res.status(statusCode.NOT_FOUND).json({
            success:false,
            error:true,
            message:messages.SECURITY_NOT_FOUND
        });
    }

    const securityObj = portfolio.securities[index];
    let updateSecurity = {...securityObj}; //creating a new secutiy object so we don't lose original security object in case of failure

    let anotherSecurity = {};
    let otherTickerIndex;

    //if we change the ticker of the last trade, we have to transfer securities from one company to another.
    if(ticker && ticker !== tradeToUpdate.ticker){
        otherTickerIndex = portfolio.securities.findIndex((s) => s.ticker === ticker);

        // if that another ticker is not present in the portfolio
        if(otherTickerIndex < 0) {
            // if a security is not present in portfolio, but one is trying to sell.
            if((type && type === SELL) || (!type && tradeToUpdate.type === SELL)) {
                return res.status(statusCode.FORBIDDEN).json({
                    success:false,
                    error:true,
                    message:messages.INVALID_TRADE
                });
            } else { // if one tries to buy then it should be first time buying, we assign all the initial values
                anotherSecurity.ticker = ticker;
                anotherSecurity.quantity = 0;
                anotherSecurity.totalPrice = 0;
                otherTickerIndex = portfolio.securities.length;
            }
        } else {
            anotherSecurity = portfolio.securities[otherTickerIndex];
        }
    }
    finalObject.ticker = ticker || tradeToUpdate.ticker;
    finalObject.type = type || tradeToUpdate.type;
    finalObject.quantity = quantity || tradeToUpdate.quantity;
    finalObject.price = price || tradeToUpdate.price;

    const tradeSign = finalObject.type === BUY ? 1 : -1;

    // if our trade type was 'buy', we have to remove from the portfolio, if sell then add trade in portfolio
    const revertSign =  tradeToUpdate.type === BUY ? -1 : 1;
    // revert trade in portfolio
    revertTrade(updateSecurity,tradeToUpdate,revertSign);
    
    // apply updated transaction
    if(Object.keys(anotherSecurity).length){
        anotherSecurity.quantity += (tradeSign)*finalObject.quantity;
        if(anotherSecurity.quantity < 0) {
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.INVALID_QUANTITY
            });
        }

        settleSecurity(anotherSecurity,finalObject,tradeSign);
        portfolio.securities[otherTickerIndex] = anotherSecurity;
    } else {
        updateSecurity.quantity += (tradeSign)*finalObject.quantity;
        if(updateSecurity.quantity < 0) {
            return res.status(statusCode.INTERNAL_SERVER).json({
                success:false,
                error:true,
                message:messages.INVALID_QUANTITY
            });
        }
        settleSecurity(updateSecurity,finalObject,tradeSign);
    }
    portfolio.securities[index] = updateSecurity;
    settlePortfolio(portfolio);

    await Promise.all([
        Trade.updateOne({_id:id},finalObject),
        Portfolio.updateOne({_id:tradeToUpdate.portfolioId},portfolio)
    ]);

    return res.status(statusCode.MODIFIED).json()
}

const removeTrade = async (req,res) => {
    try {    
        const id = req.params.id;
        const tradeToRemove = await Trade.findById(id).lean();
        const revertSign =  tradeToRemove.type === BUY ? -1 : 1;
        if(!tradeToRemove) {
            return res.status(statusCode.NOT_FOUND).json({
                success:false,
                error:true,
                message:messages.INVALID_TRADE
            });
        }
        const latest = await checkIfTheLatestTrade(tradeToRemove);
        if(!latest){
            return res.status(statusCode.FORBIDDEN).json({
                success:false,
                error:true,
                message:messages.MODIFY_LAST_TRADE
            }); 
        }
        const portfolio = await Portfolio.findById(tradeToRemove.portfolioId).lean();
        const index = portfolio.securities.findIndex((s) => s.ticker === tradeToRemove.ticker);

        if(index<0){
            return res.status(statusCode.NOT_FOUND).json({
                success:false,
                error:true,
                message:messages.SECURITY_NOT_FOUND
            });
        }

        const securityObj = portfolio.securities[index];
        revertTrade(securityObj,tradeToRemove,revertSign);
        settlePortfolio(portfolio);

        await Promise.all([
            Trade.deleteOne({_id:id}),
            Portfolio.updateOne({_id:portfolio._id},portfolio)
        ]);

        return res.status(statusCode.MODIFIED).json();

    } catch (error) {
        throw new Error(error.message);
    }
    
}


module.exports = {
    addTrade,updateTrade,removeTrade
}