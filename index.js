import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRouter from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import cartRouter from "./src/routes/cart.route.js";
import addressRouter from "./src/routes/address.route.js";
import orderRouter from "./src/routes/order.route.js";
import profileRouter from "./src/routes/profile.route.js";
import adminRouter from "./src/routes/admin.route.js";

const app = express();
const SERVER_PORT = 3000;
const uploadImageDir = path.join(process.cwd(), "src", "upload", "img");

app.use(cors());
app.use(express.json());
app.use("/upload/img", express.static(uploadImageDir));

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/orders", orderRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);

// Kích hoạt restart nodemon
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});