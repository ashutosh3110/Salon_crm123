import Joi from 'joi';
import httpStatus from 'http-status-codes';

const validate = (schema) => (req, res, next) => {
    const validSchema = {};
    const { params, query, body } = req;

    // Extract keys from schema that are valid for pick
    ['params', 'query', 'body'].forEach((key) => {
        if (schema[key]) {
            validSchema[key] = schema[key];
        }
    });

    const object = {};
    ['params', 'query', 'body'].forEach((key) => {
        if (validSchema[key]) {
            object[key] = req[key];
        }
    });

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        const customError = new Error(errorMessage);
        customError.statusCode = httpStatus.BAD_REQUEST;
        return next(customError);
    }

    Object.assign(req, value);
    return next();
};

export default validate;
