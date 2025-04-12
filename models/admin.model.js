const { mongoose, Schema } = require("mongoose");

const adminSchema = new Schema({
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
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
