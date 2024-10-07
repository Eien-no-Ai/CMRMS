// models/Package.js
const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  labTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "LaboratoryModel" }], 
  xrayType: { type: mongoose.Schema.Types.ObjectId, ref: "XrayModel" }, 
  isCreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Package", PackageSchema);
