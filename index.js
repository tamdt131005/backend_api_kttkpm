import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./src/routes/auth.route.js"; // Import Auth Route
import productRouter from "./src/routes/product.route.js"; // Import Product Route
import cartRouter from "./src/routes/cart.route.js"; // Import Cart Route
import addressRouter from "./src/routes/address.route.js"; // Import Address Route
import orderRouter from "./src/routes/order.route.js"; // Import Order Route

dotenv.config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//public route
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);

// route cần đăng nhập (kiểm tra user_id từ localStorage phía frontend)
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/orders", orderRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 