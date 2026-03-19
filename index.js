import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import userRoutes from './src/routes/user.route.js';

// Khai báo các route (API Endpoints)
app.use('/api/users', userRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 