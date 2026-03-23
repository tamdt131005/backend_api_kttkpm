import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./src/routes/auth.route.js"; // Import Auth Route
import productRouter from "./src/routes/product.route.js"; // Import Product Route

dotenv.config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//public route
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);


//private route

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 