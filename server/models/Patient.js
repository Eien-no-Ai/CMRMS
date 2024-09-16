const mongoose = require('mongoose');

// Define the Patient schema
const PatientSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    middlename: { type: String },
    lastname: { type: String, required: true },
    birthdate: { type: Date, required: true },
    idnumber: { type: String, required: true, unique: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalcode: { type: String },
    phonenumber: { type: String },
    email: { type: String, required: true, unique: true },
    course: { type: String },
    sex: { type: String, required: true }
});

const PatientModel = mongoose.model('patients', PatientSchema);

module.exports = PatientModel;


