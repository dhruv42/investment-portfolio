const Trade = require('../../models/trade');
const Portfolio = require('../../models/portfolio');
const {statusCode,messages} = require('../../messages.json');
const {CURRENT_PRICE} = require('../../constants');

const fetchPortfolio = async(req,res) => {
    try {
        const portfolio = await Portfolio.findOne();

        if(!portfolio) {
            return res.status(statusCode.OK).json({
                success:false,
                error:true,
                messages:messages.NO_HOLDINGS
            });
        }
        portfolio.securities = portfolio.securities.filter((s) => s.quantity > 0);
        if(!portfolio.securities.length) {
            return res.status(statusCode.OK).json({
                success:true,
                error:false,
                messages:messages.NO_HOLDINGS
            });
        }
        return res.status(statusCode.OK).json({
            success:true,
            error:false,
            data:portfolio
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
                messages:`portfolio ${messages.NOT_FOUND}`
            });
        }
        let returns = 0;
        response.securities.map((s) => {
            returns+= (CURRENT_PRICE-s.avgPrice)*s.quantity
        })

        return res.status(statusCode.OK).json({
            success:true,
            error:false,
            data:parseFloat(returns.toFixed(3))
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER).json({
            success:false,
            error:true,
            data:`portfolio ${messages.NOT_FOUND}`
        });
    }
}

const fetchTrades = async (req,res) => {
    try {
        const portfolio = await Portfolio.findOne();
        if(!portfolio || portfolio.securities.length === 0) {
            return res.status(statusCode.OK).json({
                success:true,
                error:false,
                messages:messages.NO_HOLDINGS
            });
        }
        const allSecurities = [];
        portfolio.securities.map((s) => {
            if(s.quantity > 0) allSecurities.push(s.ticker);
        });

        // only fetch those trades which are present in portfolio with quantity greater than 0.
        const resp = await Trade.aggregate([
            {$match:{ticker:{$in:allSecurities}}},
            {$sort:{createdAt:-1}},
            {
               $group:{
                   _id:'$ticker',
                   trades:{'$push':"$$ROOT"},   
                }
            },
           {
               $project:{
                   'trades._id':1,
                   'trades.quantity':1,
                   'trades.price':1,
                   'trades.createdAt':1,
                   'trades.type':1
                }
            }
        ]);
        return res.status(statusCode.OK).json({
            success:true,
            error:false,
            data:resp
        });
    } catch (error) {
        throw new Error(error);
    }
}



module.exports = {
    fetchReturns,
    fetchTrades,
    fetchPortfolio
}