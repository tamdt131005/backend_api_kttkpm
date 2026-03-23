
import Joi from "joi";

export const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });

        if (error) {

            const errorMessages = error.details.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Dữ liệu đầu vào không hợp lệ",
                errors: errorMessages
            });
        }
        next();
    };
};
