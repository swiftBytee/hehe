const express = require("express");
const Product = require("../models/product.model");
const { default: Package } = require("../models/package.model");
const Cart = require("../models/cart.model");
const Category = require("../models/category.model");
const router = express.Router();

router.get("/view-products", async (req, res) => {
  const products = await Product.find();

  res.status(201).json(products);
});

router.get("/view-package", async (req, res) => {
  const packages = await Package.find();

  res.status(201).json(packages);
});

module.exports = router;
