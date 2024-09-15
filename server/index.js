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
                res.json({
                    message: 'Login Successful',
                    role: user.role // Include user role in the response
                });
            } else {
                res.json({message: 'Password Incorrect'});
            }
        } else {
            res.json({message: 'User not registered'});
        }
    })
    .catch(err => res.json(err));
});



// app.post('/role', (req, res) => {
//     const {email,firstName,role} = req.body;
//     EmployeeModel.findOne
//     ({email: email}),
//     ({firstName: firstName}),
//     ({role: role})
//     .then(user => {
//         if(user){
//             res.json({role: user.role})
//         }else{
//             res.json({message: 'User not registered'})
//         }
//     })
// }
// )

app.post('/role', (req, res) => {
    const {email, role} = req.body;
    EmployeeModel.findOneAndUpdate({email: email}, {role: role})
    .then(user => {
        if(user){
            res.json({message: 'Role Updated'})
        }else{
            res.json({message: 'User not registered'})
        }
    })
}
)

app.get('/accounts', (req, res) => {
    EmployeeModel.find()
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
}
)


app.listen(3001, () => {
    console.log('Server is running on port 3001');
    });