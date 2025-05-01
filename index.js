import express from "express";
import mongoose from "mongoose";
import connectDB from "./Config/dbConnect.js";
import adminRouter from "./router/adminRoutes.js";
import homeRouter from "./router/homeRoutes.js";
import customerRouter from "./router/customerRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Use this to get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/uploads", express.static(join(__dirname, "uploads")));

app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URI,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ Allow cookies/auth
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

connectDB();

app.use("/api/v1", adminRouter);
app.use("/home", homeRouter);
app.use("/customer", customerRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
