const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config(); // Load env variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "pdf"], // Add other file formats if needed
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Unique filename
  },
});

const upload = multer({ storage });

module.exports = upload;
