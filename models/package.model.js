import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    priceForOne: { type: Number, required: true, min: 1 },
    priceForTwo: { type: Number, required: true, min: 1 },
    priceForThree: { type: Number, required: true, min: 1 },
    bgColor: { type: String, default: "#ffffff" },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

// Pre-save hook to convert bgColor to lowercase
packageSchema.pre("save", function (next) {
  if (this.bgColor) {
    this.bgColor = this.bgColor.toLowerCase();
  }
  next();
});

const Package = mongoose.model("Package", packageSchema);

export default Package;
