const { mongoose, Schema } = require("mongoose");

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

module.exports = Customer;
