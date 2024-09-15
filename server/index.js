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
    const { email, role } = req.body;
    EmployeeModel.findOneAndUpdate({ email: email }, { role: role }, { new: true })
    .then(user => {
        if (user) {
            res.json({ message: 'Role Updated', updatedRole: user.role });
        } else {
            res.json({ message: 'User not registered' });
        }
    })
    .catch(err => res.status(500).json({ message: 'Error updating role', error: err }));
});

app.post('/reset-password', (req, res) => {
    const { email, lastname } = req.body;
    // Update the password to be the user's last name
    EmployeeModel.findOneAndUpdate({ email: email }, { password: lastname }, { new: true })
    .then(user => {
        if (user) {
            res.json({ message: 'Password Reset Successfully' });
        } else {
            res.json({ message: 'User not found' });
        }
    })
    .catch(err => res.status(500).json({ message: 'Error resetting password', error: err }));
});

app.post('/add-account', (req, res) => {
    const { firstname, lastname, email, role } = req.body;
    // Set the default password to the user's last name
    const password = lastname;
    EmployeeModel.create({ firstname, lastname, email, role, password })
      .then(newAccount => res.json({ message: 'Account Created Successfully', account: newAccount }))
      .catch(err => res.status(500).json({ message: 'Error creating account', error: err }));
  });
  

app.post('/delete-account', (req, res) => {
    const { email } = req.body;

    // Find the employee by email and delete it
    EmployeeModel.findOneAndDelete({ email: email })
    .then((deletedEmployee) => {
        if (deletedEmployee) {
            res.json({ message: 'Account Deleted Successfully' });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    })
    .catch(err => res.status(500).json({ message: 'Error deleting account', error: err }));
});

app.get('/accounts', (req, res) => {
    EmployeeModel.find()
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
}
)

app.get('/search', (req, res) => {
    const { query } = req.query;
    
    // Use a regular expression for a case-insensitive search
    const searchQuery = new RegExp(query, 'i');
    
    EmployeeModel.find({
        $or: [
            { firstname: { $regex: searchQuery } },
            { lastname: { $regex: searchQuery } },
            { email: { $regex: searchQuery } },
            { role: { $regex: searchQuery } }
        ]
    })
    .then(employees => res.json(employees))
    .catch(err => res.status(500).json({ message: 'Error searching accounts', error: err }));
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
    });