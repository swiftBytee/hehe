const { mongoose, Schema } = require("mongoose");

const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
