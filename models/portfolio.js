const mongoose = require('mongoose');

const portfolio = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    totalInvestment:{
        type:Number,
        default:0
    },
    returnValue:{
        type:Number,
        default:0
    },
    returnPercentage:{
        type:Number
    },
    securities:{
        type:Array,
        default:[]
    }
},{
    versionKey:false
});

module.exports = mongoose.model('Portfolio',portfolio);