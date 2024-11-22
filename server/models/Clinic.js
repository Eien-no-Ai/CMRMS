const mongoose = require("mongoose");

const ClinicSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    complaints: String,
    treatments: String,
    emergencyTreatment: String,
    diagnosis: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
    isCreatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ClinicModel = mongoose.model("clinics", ClinicSchema);

module.exports = ClinicModel;
