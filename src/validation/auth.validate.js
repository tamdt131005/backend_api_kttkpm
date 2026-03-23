import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

// validate cho đăng kí
const signupSchema = Joi.object({
    username: Joi.string().required().min(3).max(50).trim().strict(),
    password: Joi.string().required().min(6).max(50).trim().strict(),
    fullname: Joi.string().optional().allow('').min(3).max(100).trim().strict(),
    email: Joi.string().email().required().min(3).max(100).trim().strict(),
});
// validate cho đăng nhập 
const signinSchema = Joi.object({
    username: Joi.string().required().min(3).max(50).trim().strict(),
    password: Joi.string().required().min(6).max(50).trim().strict(),
});

export const validateSignup = validateRequest(signupSchema);
export const validateSignin = validateRequest(signinSchema);
