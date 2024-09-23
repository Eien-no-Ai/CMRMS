const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
    date: String,
    complaints: String,
    treatments: String,
    diagnosis: String,
    isCreatedAt: { type: Date, default: Date.now },
});

const ClinicModel = mongoose.model('clinics', ClinicSchema);

module.exports = ClinicModel;
