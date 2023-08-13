const CustomError = require("../utils/customErrorClass");

module.exports = (asyncFunction) => {
    return (req, res, next) => {
        asyncFunction(req, res, next).catch((err) => {
            const error = new CustomError(err.message, err.statusCode);
            next(error);
        });
    };
};
