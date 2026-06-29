import Joi from "joi";
import { validateRequest } from "../middlewares/validate.middleware.js";

// Quy tắc kiểm tra dữ liệu đầu vào cho đăng ký (Signup Schema)
const signupSchema = Joi.object({
    // username: Kiểu chuỗi, bắt buộc nhập, tối thiểu 3 ký tự, tối đa 50 ký tự, loại bỏ khoảng trắng thừa
    username: Joi.string().required().min(3).max(50).trim().strict(),
    
    // password: Kiểu chuỗi, bắt buộc nhập, tối thiểu 6 ký tự, tối đa 50 ký tự
    password: Joi.string().required().min(6).max(50).trim().strict(),
    
    // fullname: Kiểu chuỗi, không bắt buộc, cho phép để trống, tối thiểu 3 ký tự, tối đa 100 ký tự
    fullname: Joi.string().optional().allow('').min(3).max(100).trim().strict(),
    
    // email: Kiểu chuỗi, đúng định dạng email, bắt buộc nhập, tối thiểu 3 ký tự, tối đa 100 ký tự
    email: Joi.string().email().required().min(3).max(100).trim().strict(),
});

// Quy tắc kiểm tra dữ liệu đầu vào cho đăng nhập (Signin Schema)
const signinSchema = Joi.object({
    // username: Bắt buộc nhập khi đăng nhập, tối thiểu từ 3 ký tự
    username: Joi.string().required().min(3).max(50).trim().strict(),
    
    // password: Bắt buộc nhập khi đăng nhập, tối thiểu từ 6 ký tự
    password: Joi.string().required().min(6).max(50).trim().strict(),
});

// Xuất các middleware xác thực dữ liệu để gán trực tiếp vào router
export const validateSignup = validateRequest(signupSchema);
export const validateSignin = validateRequest(signinSchema);
