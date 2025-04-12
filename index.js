const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./Config/dbConnect");
const adminRouter = require("./router/adminRoutes");
const homeRouter = require("./router/homeRoutes");
const customerRouter = require("./router/customerRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
