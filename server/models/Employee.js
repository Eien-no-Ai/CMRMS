const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstname:String,
    lastname: String,
    email: String,
    password: String,
    role: String,
    confirmPassword: String
    
}) 

const EmployeeModel = mongoose.model('employees', EmployeeSchema)

module.exports = EmployeeModel