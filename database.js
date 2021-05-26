const mongoose = require('mongoose');
const config = require('./config/');

function databaseConnect(){
    mongoose.connect(config.dbUrl,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    },(error,db) => {
        if(error) throw new Error(error);
        console.log("Datbase connection successfull");
    });
}

module.exports = databaseConnect;