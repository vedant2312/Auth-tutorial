import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies from incoming HTTP requests
app.use(cookieParser()); // Middleware to parse cookies from incoming HTTP requests
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello World 123");
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});