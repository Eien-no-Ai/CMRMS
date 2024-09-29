const mongoose = require("mongoose");

const XraySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true },
  xrayType: { type: String, default: ""  },
  xrayResult: { type: String, default: "" },
  isCreatedAt: { type: Date, default: Date.now },
});

const XrayModel = mongoose.model("xrays", XraySchema);

module.exports = XrayModel;
