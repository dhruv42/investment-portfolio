const mongoose = require('mongoose');

function databaseConnect(){
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    },(error,db) => {
        if(error) throw new Error(error);
        console.log("Datbase connection successfull");
    });
}

module.exports = databaseConnect;