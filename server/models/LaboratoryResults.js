const e = require("express");
const mongoose = require('mongoose');

const LaboratoryResultsSchema = new mongoose.Schema({
  ORNumber: String,
  labNumber: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients' },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  laboratoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory' },
  results: [
    {
      category: { type: String, required: true },
      testName: { type: String, required: true },
      result: mongoose.Schema.Types.Mixed,
      referenceRange: { type: String },
      additionalTests: [
        {
          testName: String,
          result: mongoose.Schema.Types.Mixed,
          referenceRange: String,
        }
      ]
    }
  ],
  verifiedByPathologist: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' },
  pathologistSignature: { type: String, default: "" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' },
  verificationDate: { type: Date, default: Date.now },
  isCreatedAt: { type: Date, default: Date.now },
});

const LaboratoryResultsModel = mongoose.model("LaboratoryResults", LaboratoryResultsSchema);

module.exports = LaboratoryResultsModel;
