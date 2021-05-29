const mongoose = require('mongoose');

const portfolio = mongoose.Schema({
    totalInvestment:{
        type:Number,
        default:0
    },
    securities:{
        type:Array,
        default:[]
    }
},{
    versionKey:false
});

module.exports = mongoose.model('Portfolio',portfolio);