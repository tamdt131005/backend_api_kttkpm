import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

const paramIdSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const paramCategoryIdSchema = Joi.object({
    category_id: Joi.number().integer().positive().required(),
});

export const validateProductId = validateRequest(paramIdSchema, 'params');
export const validateCategoryId = validateRequest(paramCategoryIdSchema, 'params');
