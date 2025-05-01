import express from "express";
import Product from "../models/product.model.js";
import Package from "../models/package.model.js";

const router = express.Router();

router.get("/view-products", async (req, res) => {
  const products = await Product.find();

  res.status(201).json(products);
});

router.get("/view-package", async (req, res) => {
  const packages = await Package.find();

  res.status(201).json(packages);
});

export default router;
