const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Category = require("../models/category.model");
const { uploadSingle } = require("../middleware/multerMiddleware");
const Product = require("../models/product.model");
const upload = require("../middleware/multerMiddleware");
const { default: Package } = require("../models/package.model");
const Order = require("../models/order.model");

const hashKey = 8;

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { fullName, mobile, email, password } = req.body;
    console.log(fullName, mobile, email, password);

    // Validate input
    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the patient already exists
    const existedAdmin = await Admin.findOne({ email });

    if (existedAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, hashKey);

    const newAdmin = new Admin({
      fullName,
      mobile,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//   Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the patient exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a token
    const token = jwt.sign({ id: admin._id }, process.env.JWTSECRETKEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    res
      .status(200)
      .cookie("adminToken", token, {
        secure: process.env.NODE_ENV === "Production", // Ensure this is set when using SameSite=None
        sameSite: "Lax",
        maxAge: 3600000, // 1 hour
        path: "/", // Available to all routes
        maxAge: 1000 * 60 * 60,
      })
      .json({ message: "Login successful", token });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Category

router.post("/add-category", async (req, res) => {
  const { categoryName, orderNumber } = req.body;
  const adminToken = req.cookies;

  try {
    const existedCat = await Category.findOne({ categoryName });

    if (existedCat) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const newCategory = new Category({
      categoryName,
      orderNumber,
    });

    await newCategory.save();
    res
      .status(201)
      .json({ message: "Category added successfully", newCategory });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/view-categories", async (req, res) => {
  const adminToken = req.cookies;

  if (!adminToken) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, Login First." });
  }

  const cats = await Category.find();

  res.status(201).json(cats);
});

router.post("/add-product", upload.single("photo"), async (req, res) => {
  if (req.file) {
    console.log("Uploaded file path:", req.file.path);
  } else {
    console.log("No file uploaded");
  }

  try {
    const { name, price, weight, categoryName, calorie, protein, switchWith } =
      req.body;
    // console.log(switchWith);

    // Validate fields
    if (!name || !price || !weight || !categoryName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get the photo path if uploaded
    const photoPath = req.file ? `${req.file.path}` : null;
    console.log(photoPath);

    // console.log(name, price, weight, categoryName, photoPath);

    const newProduct = await Product({
      name,
      price,
      weight,
      categoryName,
      calorie,
      protein,
      switchWith,
      photo: photoPath,
    });
    await newProduct.save();

    // Respond with success
    res.status(201).json({
      message: "Product successfully submitted",
      product: {
        name,
        price,
        weight,
        categoryName,
        calorie,
        protein,
        photo: photoPath,
      },
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while submitting the product" });
  }
});

router.get("/view-products", async (req, res) => {
  const adminToken = req.cookies;
  // console.log(adminToken);

  if (!adminToken) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, Login First." });
  }
  const products = await Product.find();
  res.status(201).json(products);
});

router.post("/add-package", upload.single("image"), async (req, res) => {
  if (req.file) {
    console.log("Uploaded file path:", req.file.path);
  } else {
    console.log("No file uploaded");
  }

  try {
    const { adminToken } = req.cookies;
    // console.log(adminToken);

    if (!adminToken) {
      return res
        .status(401)
        .json({ message: "Unauthorised access, Login First." });
    }
    const {
      name,
      description,
      price,
      priceForOne,
      priceForTwo,
      priceForThree,
      bgColor,
    } = req.body;

    // Validate fields
    if (
      !name ||
      !description ||
      !price ||
      !priceForOne ||
      !priceForTwo ||
      !priceForThree ||
      !bgColor
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get the photo path if uploaded
    const photoPath = req.file ? `${req.file.path}` : null;

    // console.log(name, price, weight, categoryName, photoPath);

    const newPackage = await Package({
      name,
      description,
      price,
      priceForOne,
      priceForTwo,
      priceForThree,
      bgColor,
      image: photoPath,
    });
    await newPackage.save();

    // Respond with success
    res.status(201).json({
      message: "Package successfully submitted",
      package: {
        name,
        description,
        price,
        priceForOne,
        priceForTwo,
        priceForThree,
        bgColor,
        image: photoPath,
      },
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while submitting the package" });
  }
});

router.get("/view-package", async (req, res) => {
  try {
    const { adminToken } = req.cookies;
    // console.log(adminToken);

    if (!adminToken) {
      return res
        .status(401)
        .json({ message: "Unauthorised access, Login First." });
    }
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
});

router.put("/product/:id", async (req, res) => {
  console.log("Put request received");

  try {
    const { isSelected, product } = req.body;
    const { id } = req.params;

    console.log(product);

    // const updatedProduct = await Product.findByIdAndUpdate(
    //   id,
    //   {
    //     isSelected: isSelected,
    //   },
    //   { new: true }
    // );

    // if (!updatedProduct) {
    //   return res.status(404).json({ message: "Product not found" });
    // }
    res.status(200).json({ message: "Product Updated", updatedProduct });
    console.log("updated");
  } catch (error) {
    return res.status(500).json({ message: "Error while updating", error });
  }
});

router.delete("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting", error });
  }
});

router.get("/orders", async (req, res) => {
  const adminToken = req.cookies;

  if (!adminToken) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, Login First." });
  }
  try {
    const orders = Order.find();
    res.status(201).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
