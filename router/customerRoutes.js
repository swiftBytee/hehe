import express from "express";
import Customer from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

const router = express.Router();
const hashKey = 8;

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });
    if (existingCustomer) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = new Customer({
      fullName,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find customer with case-insensitive email
    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // Prevent user enumeration (generic error message)
    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: customer._id }, process.env.JWTSECRETKEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // Set cookie with secure settings
    res
      .status(200)
      .cookie("customerToken", token, {
        httpOnly: true, // Prevents access via JavaScript
        secure: process.env.NODE_ENV === "production", // Enable only in production
        sameSite: "Lax",
        maxAge: 1000 * 60 * 60, // 1 hour
        path: "/",
      })
      .json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/check-auth", (req, res) => {
  const token = req.cookies.customerToken;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    jwt.verify(token, process.env.JWTSECRETKEY);
    res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.post("/member-count", async (req, res) => {
  const customerToken = req.cookies.customerToken; // Ensure you're getting the token string

  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }

  try {
    const customer = jwt.verify(customerToken, process.env.JWTSECRETKEY);
    // console.log("Verified Customer:", customer.id);
    const { selectedMembers, selectedPackage } = req.body;
    const updateCustomer = await Customer.findByIdAndUpdate(customer.id, {
      memberCount: selectedMembers,
    });

    const products = await Product.find();

    const CustomerCart = await Cart.findOneAndUpdate(
      { customerId: customer.id },
      {
        products: products,
        memberCount: selectedMembers,
        packageName: selectedPackage.name,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).json(CustomerCart);
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

router.get("/cart", async (req, res) => {
  const customerToken = req.cookies.customerToken;

  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }

  try {
    const customer = jwt.verify(customerToken, process.env.JWTSECRETKEY);
    const getCustomer = await Customer.findById(customer.id);

    const cart = await Cart.findOne({ customerId: customer.id });

    res.status(200).json(cart);
  } catch (e) {}
});

router.get("/cart-member-count", async (req, res) => {
  const customerToken = req.cookies.customerToken; // Ensure you're getting the token string

  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }

  try {
    const customer = jwt.verify(customerToken, process.env.JWTSECRETKEY);
    const getCustomer = await Customer.findById(customer.id);
    const cart = await Cart.findOne({ customerId: customer.id });
    const member = getCustomer.memberCount;
    const products = cart.products;

    res.status(201).json({ member, products });
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

router.post("/update-choice", async (req, res) => {
  const { productsToSwitch, switchLogic } = req.body;
  const customerToken = req.cookies.customerToken;

  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }
  try {
    const customer = jwt.verify(customerToken, process.env.JWTSECRETKEY);
    const getCustomer = await await Customer.findById(customer.id);

    const cart = await Cart.findOne({ customerId: customer.id });
    cart.products = cart.products.map((product) => {
      if (product.switchWith === switchLogic) {
        return { ...product, isSelected: !product.isSelected };
      }
      return product;
    });

    await cart.save();
    res.status(201).json({ message: "Choice updated successfully" });
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

router.post("/order", async (req, res) => {
  const customerToken = req.cookies.customerToken; // Ensure you're getting the token string

  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }

  try {
    const customer = await jwt.verify(customerToken, process.env.JWTSECRETKEY);
    const getCustomer = await Customer.findById(customer.id);

    const {
      selectedMembers,
      productsToBuy,
      paymentMethod,
      selectedPackage,
      amount,
    } = req.body;
    if (
      !selectedMembers ||
      !productsToBuy ||
      !paymentMethod ||
      !selectedPackage ||
      !amount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let paymentId = 0;
    if (paymentMethod !== "cod") {
      paymentId = Date.now();
    }

    const { password, ...customerData } = getCustomer.toObject();

    const newOrder = new Order({
      customer: customerData,
      memberCount: selectedMembers,
      products: productsToBuy,
      packageName: selectedPackage.name,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      amount: amount,
    });
    // console.log(customer.id);
    await newOrder.save();

    const customerCart = await Cart.findOneAndDelete({
      customerId: customer.id,
    });
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

router.get("/order", async (req, res) => {
  const customerToken = req.cookies.customerToken; // Ensure you're getting the token string
  if (!customerToken) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }
  try {
    const customer = await jwt.verify(customerToken, process.env.JWTSECRETKEY);
    const customerId = customer.id;
    console.log(customerId);
    const order = await Order.findOne({
      "customer._id": new mongoose.Types.ObjectId(customerId),
    });

    // console.log(order);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
