const mongoose = require('mongoose');

const PhysicalTherapySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "clinics" },
  SOAPSummaries: [{
    summary: { type: String, required: true },
    date: { type: Date, default: Date.now },
    verifiedBy: { type:String },
  }],
  referredBy: { type: String },
  ChiefComplaints: { type: String },
  record: { type: String, default: "" },
  HistoryOfPresentIllness: { type: String },
  Diagnosis: { type: String },
  Precautions: { type: String },
  isCreatedAt: { type: Date, default: Date.now },
});

const PhysicalTherapyModel = mongoose.model('physicaltherapies', PhysicalTherapySchema);

module.exports = PhysicalTherapyModel;
