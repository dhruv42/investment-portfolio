const mongoose = require('mongoose');

const trade = mongoose.Schema({
    type: {
        type:String,
        required:true
    },
    ticker:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    portfolioId:{
        type:String,
        required:true
    }
},{
    versionKey:false
});

module.exports = mongoose.model('Trade',trade);