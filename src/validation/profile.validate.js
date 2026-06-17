import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

const profile = Joi.object({
    id: Joi.number().integer().required(),
    email: Joi.string().email().min(3).max(100).required().trim().strict(),
    fullname: Joi.string().min(3).max(50).trim().allow(null),
    phone: Joi.string().pattern(/^0[0-9]{9}$/).trim().allow(null),
    sex: Joi.string().valid('Nam', 'Nữ').trim().allow(null),
    ngaysinh: Joi.date().max('now').iso().allow(null),
    avatar: Joi.string().min(1).max(255).trim().allow(null),
    user_id: Joi.any().strip(),
});

export const validateProfile = validateRequest(profile);