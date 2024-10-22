const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true }, // Reference to the patient
  name: { type: String, required: true }, // Vaccine name (e.g., Hepa B, Flu Vaccine)
  dateAdministered: { type: Date, default: Date.now }, // Date the vaccine was given
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true }, // Who administered the vaccine
  nextDose: { type: Date }, // Optional: When the next dose is due
});

const VaccineModel = mongoose.model('vaccines', VaccineSchema);

module.exports = VaccineModel;
