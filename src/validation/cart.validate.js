import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

// Validate cho việc thêm sản phẩm vào giỏ hàng (POST /api/cart)
const addToCartSchema = Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    sanpham_id: Joi.number().integer().positive().required().messages({
        "number.base": "ID sản phẩm phải là số nguyên",
        "any.required": "Thiếu thông tin ID sản phẩm"
    }),
    bienthe_id: Joi.number().integer().positive().allow(null, "").optional().messages({
        "number.base": "ID biến thể phải là số nguyên"
    }),
    soluong: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Số lượng phải là số nguyên",
        "number.min": "Số lượng phải lớn hơn hoặc bằng 1",
        "any.required": "Thiếu số lượng sản phẩm"
    })
});

// Validate cho việc cập nhật số lượng (PUT /api/cart/:id)
const updateCartItemSchema = Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    soluong: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "Số lượng phải là số nguyên",
        "number.min": "Số lượng phải lớn hơn hoặc bằng 1",
        "any.required": "Thiếu số lượng sản phẩm"
    })
});

// Validate cho ID trong URL parameter (PUT /api/cart/:id, DELETE /api/cart/:id)
const cartIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "ID giỏ hàng trong URL phải là số nguyên",
        "any.required": "Thiếu ID giỏ hàng trong URL"
    })
});

export const validateAddToCart = validateRequest(addToCartSchema, "body");
export const validateUpdateCartItem = validateRequest(updateCartItemSchema, "body");
export const validateCartIdParam = validateRequest(cartIdParamSchema, "params");
