import jwt from "jsonwebtoken";

/**
 * Middleware xác thực JSON Web Token (JWT) từ client gửi lên.
 * Sau khi xác thực thành công:
 * 1. Lưu thông tin user đã giải mã vào `req.user`.
 * 2. Tự động gán `req.body.user_id` và `req.query.user_id` để tương thích ngược 
 *    với các Controller và Joi Validation hiện tại.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Không tìm thấy token xác thực hoặc định dạng token không đúng (Bearer token)"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET || "kttkpm_api_backend_shop_jwt_secret_key_2026_xyz";
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;

        // Cơ chế Auto-inject: Tự động gán user_id vào body và query để tương thích
        // với các logic Controller/Service và Schema Joi Validation cũ.
        req.body = req.body || {};
        req.body.user_id = decoded.id;
        
        // Định nghĩa lại req.query để vượt qua getter động của Express
        const currentQuery = req.query || {};
        const newQuery = { ...currentQuery, user_id: decoded.id };
        Object.defineProperty(req, "query", {
            value: newQuery,
            writable: true,
            configurable: true
        });

        next();
    } catch (error) {
        console.error("Lỗi xác thực JWT:", error);
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn!"
        });
    }
};

/**
 * Middleware phân quyền Admin.
 * Yêu cầu phải chạy qua `verifyToken` trước để có thông tin `req.user`.
 */
export const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Chưa xác thực thông tin tài khoản"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Quyền truy cập bị từ chối! Bạn không phải là Admin."
        });
    }

    next();
};
