const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: {
        type: String,
        required: [true],
    },
    password:{
        type: String,
        required: [true],
    },
    role: String,
    confirmPassword: String
});

const EmployeeModel = mongoose.model('employees', EmployeeSchema);

module.exports = EmployeeModel;
