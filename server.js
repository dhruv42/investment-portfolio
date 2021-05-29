require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const routes = require('./routes');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/',routes);
require('./database')();


app.listen(PORT,() => {
    console.log(`=============== server listening on ${PORT} ===============`);
});

module.exports = app;
