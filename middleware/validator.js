const Joi = require('joi');
const {messages,statusCode} = require('../messages.json');
const {TRADE_TYPES} = require('../constants');

const allSchemas = {
    addTradeSchema : Joi.object().keys({
        type:Joi.string().trim().required().valid(...TRADE_TYPES),
        ticker:Joi.string().trim().required(),
        quantity:Joi.number().integer().required().greater(0),
        price:Joi.number().required().greater(0)
    }).strict(),
    updateTradeSchema : Joi.object().keys({
        type:Joi.string().trim().valid(...TRADE_TYPES),
        ticker:Joi.string().trim(),
        quantity:Joi.number().integer().greater(0),
        price:Joi.number().greater(0)
    }).strict()
}

module.exports = function inputValidator(schemaName){
    return function (req, res, next) {
    const validationResult = allSchemas[schemaName].validate(req.body);
        if (validationResult && validationResult.error) {
            console.log(validationResult);
            return res.status(statusCode.VALIDATION).json({
                success:false,
                error:true,
                message:messages.VALIDATION_ERROR,
                details:validationResult.error.details[0].message.replace(/"/g, '')
            })
        }
        next();
    };
}