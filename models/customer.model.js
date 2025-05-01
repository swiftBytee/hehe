import mongoose from "mongoose";

const { Schema } = mongoose;

const customerSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  memberCount: {
    type: Number,
    default: 1,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
