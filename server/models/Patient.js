const mongoose = require("mongoose");

// Define the Patient schema
const PatientSchema = new mongoose.Schema({
  medicalHistory: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalHistory", },
  firstname: { type: String, required: true },
  middlename: { type: String },
  lastname: { type: String, required: true },
  birthdate: { type: Date, required: true },
  idnumber: { type: String, unique: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  postalcode: { type: String },
  phonenumber: { type: String },
  email: { type: String, required: true, unique: true },
  course: { type: String },
  year: { type: String },
  sex: { type: String, required: true },
  patientType: { type: String, required: true },
  emergencyContact: { type: String },
  position: { type: String },
  bloodType: { type: String},
  createdAt: { type: Date, default: Date.now },
});

const PatientModel = mongoose.model("patients", PatientSchema);

module.exports = PatientModel;
