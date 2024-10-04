const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstname: {type:String},
    lastname: {type:String},
    email: {type:String},
    password: {type:String},
    confirmPassword: {type:String},
    department: {type:String},
    role: {type:String},
});

const EmployeeModel = mongoose.model('employees', EmployeeSchema);

module.exports = EmployeeModel;
