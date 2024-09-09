const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');
const e = require('express');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://cmrms:cmrmspass@cmrms.p4nkyua.mongodb.net/employee');

app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
    .then(employee => res.json(employee))
    .catch(err => res.json(err))
})  

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    EmployeeModel.findOne({email: email, password: password})
    .then(user => {
        if(user){
            if(user.password === password){
                res.json({message: 'Login Successful'})
            }
            else{
                res.json({message: 'Password Incorrect'})
            }
        }else{
            res.json({message: 'User not registered'})
        }
    })
})

app.listen(3001, () => {
    console.log('Server is running on port 3001');
    });