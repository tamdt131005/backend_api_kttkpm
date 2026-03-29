import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

const addressCreateSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    tennguoinhan: Joi.string().min(1).max(100).required().trim().strict(),
    sodienthoai: Joi.string().pattern(/^0[0-9]{9}$/).required().trim().strict(),
    diachichitiet: Joi.string().min(1).max(255).required().trim().strict(),
    phuong: Joi.string().min(1).max(100).required().trim().strict(),
    quan: Joi.string().min(1).max(100).required().trim().strict(),
    tinh: Joi.string().min(1).max(100).required().trim().strict(),
    macdinh: Joi.number().valid(0, 1).required()
});

const addressUpdateSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    tennguoinhan: Joi.string().min(1).max(100).required().trim().strict(),
    sodienthoai: Joi.string().pattern(/^0[0-9]{9}$/).required().trim().strict(),
    diachichitiet: Joi.string().min(1).max(255).required().trim().strict(),
    phuong: Joi.string().min(1).max(100).required().trim().strict(),
    quan: Joi.string().min(1).max(100).required().trim().strict(),
    tinh: Joi.string().min(1).max(100).required().trim().strict(),
    macdinh: Joi.number().valid(0, 1).required()
});

const addressDefaultSchema = Joi.object({
    id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
});

export const validateAddressCreate = validateRequest(addressCreateSchema);
export const validateAddressUpdate = validateRequest(addressUpdateSchema);
export const validateAddressSetDefault = validateRequest(addressDefaultSchema);
