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

    ['params', 'query', 'body'].forEach((key) => {
        if (value[key]) {
            if (req[key] && typeof req[key] === 'object') {
                Object.assign(req[key], value[key]);
            } else {
                try {
                    req[key] = value[key];
                } catch (e) {
                    // Fallback to defineProperty for restricted properties
                    Object.defineProperty(req, key, {
                        value: value[key],
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    });
                }
            }
        }
    });

    // Also handle any other keys in value that aren't params/query/body
    Object.keys(value).forEach((key) => {
        if (!['params', 'query', 'body'].includes(key)) {
            req[key] = value[key];
        }
    });

    return next();
};

export default validate;
