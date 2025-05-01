import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
  customer: {
    type: Object,
    required: true,
  },

  memberCount: {
    type: Number,
    default: 1,
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      categoryName: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
      calorie: {
        type: Number,
        required: true,
      },
      protein: {
        type: Number,
        required: true,
      },
      switchWith: {
        type: String,
      },
      isSelected: {
        type: Boolean,
      },
    },
  ],
  packageName: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
