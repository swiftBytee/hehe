const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load env variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadFolder = "./uploads"; // Local folder to upload

const uploadFiles = async () => {
  try {
    const files = fs.readdirSync(uploadFolder);

    for (const file of files) {
      const filePath = path.join(uploadFolder, file);

      if (fs.statSync(filePath).isFile()) {
        console.log(`Uploading: ${file}...`);
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "uploads", // Cloudinary folder name
        });
        console.log(`Uploaded: ${file} → ${result.secure_url}`);
      }
    }

    console.log("✅ All files uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading files:", error);
  }
};

uploadFiles();
