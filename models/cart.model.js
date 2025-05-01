import mongoose from "mongoose";

const { Schema } = mongoose;

const cartSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
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
  memberCount: {
    type: Number,
    defaultL: 1,
  },
  packageName: {
    type: String,
    required: true,
  },
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
