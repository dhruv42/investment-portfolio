const Trade = require('../../models/trade');
const Portfolio = require('../../models/portfolio');
const {statusCode,messages} = require('../../messages.json');
const {CURRENT_PRICE} = require('../../constants');

const fetchPortfolio = async(req,res) => {
    try {
        const response = await Portfolio.findOne();
        if(!response) {
            return res.status(statusCode.NOT_FOUND).json({
                success:false,
                error:true,
                messages:`portfolio ${messages.NOT_FOUND}`
            })
        }
        return res.status(statusCode.OK).json({
            success:true,
            error:false,
            data:response
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER).json({
            success:false,
            error:true,
            data:`portfolio ${messages.NOT_FOUND}`
        });
    }
}

const fetchReturns = async (req,res) => {
    try {
        const response = await Portfolio.findOne();
        if(!response) {
            return res.status(statusCode.NOT_FOUND).json({
                success:false,
                error:true,
                messages:`id ${messages.NOT_FOUND}`
            });
        }
        let returns = 0;
        response.securities.map((s) => {
            returns+= CURRENT_PRICE*s.quantity - s.totalPrice
        })

        return res.status(statusCode.OK).json({
            success:true,
            error:false,
            data:returns
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER).json({
            success:false,
            error:true,
            data:`id ${messages.NOT_FOUND}`
        });
    }
}

const fetchTrades = async (req,res) => {
    try {
        const ticker = req.query.ticker ? req.query.ticker.toUpperCase() : "";
        const filter = {};
        if(ticker){
            filter.ticker=ticker
        }
        const allTrades = await Trade.find(filter);
        console.log(allTrades);
        res.status(200).json(allTrades);    
    } catch (error) {
        throw new Error(error);
    }
}



module.exports = {
    fetchReturns,
    fetchTrades,
    fetchPortfolio
}