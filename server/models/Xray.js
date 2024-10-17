const mongoose = require("mongoose");

const XraySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "patients",
    required: true,
  },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "clinics" },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages" },
  packageNumber: { type: Number },
  ORNumber: { type: String, default: "" },
  XrayNo: { type: String, default: "" },
  xrayType: { type: String, default: "" },
  xrayDescription: { type: String, default: "" },
  xrayResult: { type: String, default: "" },
  isCreatedAt: { type: Date, default: Date.now },
  diagnosis: { type: String, default: "" },
  imageFile: { type: String, default: "" },
});

const XrayModel = mongoose.model("xrays", XraySchema);

module.exports = XrayModel;
