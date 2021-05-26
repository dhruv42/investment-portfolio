const Trade = require('../../models/trade');

const fetchInvestments = async (req,res) => {
    res.send(200).json({message:'fetching portfolios'});
}




/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Fetch all trades, filter by ticker also.
 */
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
    fetchInvestments,
    fetchTrades
}