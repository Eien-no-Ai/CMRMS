const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true },
    complaints: String,
    treatments: String,
    diagnosis: String,
    isCreatedAt: { type: Date, default: Date.now },
});

const ClinicModel = mongoose.model('clinics', ClinicSchema);

module.exports = ClinicModel;
