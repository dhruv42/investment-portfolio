const Joi = require('joi');
const {messages,statusCode} = require('../constants.json');

const allSchemas = {
    addTradeSchema : Joi.object().keys({
        type:Joi.string().trim().required().valid('buy','sell'),
        ticker:Joi.string().trim().required(),
        quantity:Joi.number().required().greater(0),
        price:Joi.number().required().greater(0),
        userId:Joi.string().trim().required()
    })
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