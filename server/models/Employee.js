const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    role: String,
    signature: String,
    confirmPassword: String,
    department: String,
    licenseNo: String,
  });
  
const EmployeeModel = mongoose.model('employees', EmployeeSchema);

module.exports = EmployeeModel;
