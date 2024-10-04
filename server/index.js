const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const e = require("express");
const ClinicModel = require("./models/Clinic");
const PatientModel = require("./models/Patient");
const LaboratoryModel = require("./models/Laboratory");
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://cmrms:cmrmspass@cmrms.p4nkyua.mongodb.net/employee"
);

// account registration
app.post("/register", (req, res) => {
  const { firstname, lastname, email, password, confirmPassword, role, department } = req.body;

  const assignedRole = role === "admin" ? "admin" : "user";

  EmployeeModel.create({
    firstname,
    lastname,
    email,
    password,
    confirmPassword,
    role: assignedRole,
    department, // Save the department
  })
    .then((employee) => res.json(employee))
    .catch((err) =>
      res.status(500).json({ error: "Error registering user", details: err })
    );
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  EmployeeModel.findOne({ email: email, password: password })
    .then((user) => {
      if (user) {
        if (user.password === password) {
          res.json({
            message: "Login Successful",
            role: user.role, // Include user role in the response
            userId: user._id, // Return user ID
          });
        } else {
          res.json({ message: "Password Incorrect" });
        }
      } else {
        res.json({ message: "User not registered" });
      }
    })
    .catch((err) => res.json(err));
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  EmployeeModel.findById(id)
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error fetching user data", error: err })
    );
});

app.put("/user/:id/update-password", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  // Update the user's password
  EmployeeModel.findByIdAndUpdate(id, { password }, { new: true })
    .then((user) => {
      if (user) {
        res.json({ message: "Password updated successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error updating password", error: err })
    );
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

// admin functions

app.post("/role", (req, res) => {
  const { email, role } = req.body;
  EmployeeModel.findOneAndUpdate(
    { email: email },
    { role: role },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.json({ message: "Role Updated", updatedRole: user.role });
      } else {
        res.json({ message: "User not registered" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error updating role", error: err })
    );
});

app.post("/reset-password", (req, res) => {
  const { email, lastname } = req.body;
  // Update the password to be the user's last name
  EmployeeModel.findOneAndUpdate(
    { email: email },
    { password: lastname },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.json({ message: "Password Reset Successfully" });
      } else {
        res.json({ message: "User not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error resetting password", error: err })
    );
});

app.post("/add-account", (req, res) => {
  const { firstname, lastname, email, role, department } = req.body; // Include department
  // Set the default password to the user's last name
  const password = lastname;
  
  // Create a new employee with the department included
  EmployeeModel.create({ firstname, lastname, email, role, password, department })
    .then((newAccount) =>
      res.json({ message: "Account Created Successfully", account: newAccount })
    )
    .catch((err) =>
      res.status(500).json({ message: "Error creating account", error: err })
    );
});

app.post("/delete-account", (req, res) => {
  const { email } = req.body;

  // Find the employee by email and delete it
  EmployeeModel.findOneAndDelete({ email: email })
    .then((deletedEmployee) => {
      if (deletedEmployee) {
        res.json({ message: "Account Deleted Successfully" });
      } else {
        res.status(404).json({ message: "Account not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error deleting account", error: err })
    );
});

app.get("/accounts", (req, res) => {
  EmployeeModel.find()
    .then((employees) => res.json(employees))
    .catch((err) => res.json(err));
});

app.get("/search", (req, res) => {
  const { query } = req.query;

  // Use a regular expression for a case-insensitive search
  const searchQuery = new RegExp(query, "i");

  EmployeeModel.find({
    $or: [
      { firstname: { $regex: searchQuery } },
      { lastname: { $regex: searchQuery } },
      { email: { $regex: searchQuery } },
      { role: { $regex: searchQuery } },
    ],
  })
    .then((employees) => res.json(employees))
    .catch((err) =>
      res.status(500).json({ message: "Error searching accounts", error: err })
    );
});

// P A T I E N T

app.post("/add-patient", (req, res) => {
  const {
    firstname,
    middlename,
    lastname,
    birthdate,
    birthplace,
    idnumber,
    address,
    city,
    state,
    postalcode,
    phonenumber,
    email,
    course,
    sex,
  } = req.body;

  const newPatient = new PatientModel({
    firstname,
    middlename,
    lastname,
    birthdate,
    birthplace,
    idnumber,
    address,
    city,
    state,
    postalcode,
    phonenumber,
    email,
    course,
    sex,
  });

  newPatient
    .save()
    .then((patient) =>
      res.json({ message: "Patient added successfully", patient })
    )
    .catch((err) =>
      res.status(500).json({ message: "Error adding patient", error: err })
    );
});

app.get("/patients", (req, res) => {
  PatientModel.find()
    .then((patients) => res.json(patients))
    .catch((err) =>
      res.status(500).json({ message: "Error retrieving patients", error: err })
    );
});

app.delete("/patients/:id", (req, res) => {
  const { id } = req.params;
  PatientModel.findByIdAndDelete(id)
    .then((patient) => {
      if (patient) {
        res.json({ message: "Patient deleted successfully" });
      } else {
        res.status(404).json({ message: "Patient not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error deleting patient", error: err })
    );
});

app.get("/patients/:id", (req, res) => {
  const { id } = req.params;
  PatientModel.findById(id)
    .then((patient) => {
      if (patient) {
        res.json(patient);
      } else {
        res.status(404).json({ message: "Patient not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error retrieving patient", error: err })
    );
});

app.put("/patients/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  PatientModel.findByIdAndUpdate(id, updatedData, { new: true })
    .then((patient) => {
      if (patient) {
        res.json({ message: "Patient updated successfully", patient });
      } else {
        res.status(404).json({ message: "Patient not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error updating patient", error: err })
    );
});

// POST endpoint to save a lab request
app.post("/api/laboratory", async (req, res) => {
  const labData = req.body; // Expecting the form data in the request body
  LaboratoryModel.create(labData)
    .then((labRequest) =>
      res.json({
        message: "Laboratory request created successfully",
        labRequest,
      })
    )
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Error creating laboratory request", error: err })
    );
});

// GET endpoint to fetch lab records
app.get("/api/laboratory", async (req, res) => {
  try {
    const labRecords = await LaboratoryModel.find().populate("patient");
    res.json(labRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching laboratory records", error });
  }
});

// GET endpoint to fetch lab records for a specific patient
app.get("/api/laboratory/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const labRecords = await LaboratoryModel.find({
      patient: patientId,
    }).populate("patient");
    res.json(labRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching laboratory records", error });
  }
});

// C L I N I C A L   R E C O R D S

app.post("/api/clinicalRecords", async (req, res) => {
  const clinicalRecords = req.body;

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(clinicalRecords.patient)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid patient ID" });
  }

  ClinicModel.create(clinicalRecords)
    .then((clinicRequest) =>
      res.json({
        success: true,
        message: "Clinic request created successfully",
        clinicRequest,
      })
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Error creating clinic request",
        error: err.message,
      })
    );
});

// GET endpoint to fetch all clinical records
app.get("/api/clinicalRecords", async (req, res) => {
  try {
    const clinicalRecords = await ClinicModel.find().populate("patient"); // Populating the patient data
    res.json(clinicalRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clinical records", error });
  }
});

// GET endpoint to fetch clinical records for a specific patient
app.get("/api/clinicalRecords/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const clinicalRecords = await ClinicModel.find({ patient: patientId });
    res.json(clinicalRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clinical records", error });
  }
});

// X R A Y  R E C O R D S
const XrayModel = require("./models/Xray");

app.post("/api/xrayResults", async (req, res) => {
  const xrayResults = req.body;

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(xrayResults.patient)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid patient ID" });
  }

  XrayModel.create(xrayResults)
    .then((xrayRequest) =>
      res.json({
        success: true,
        message: "X-Ray request created successfully",
        xrayRequest,
      })
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Error creating X-Ray request",
        error: err.message,
      })
    );
});

// GET endpoint to fetch all X-ray records
app.get("/api/xrayResults", async (req, res) => {
  try {
    const xrayRecords = await XrayModel.find().populate("patient"); // Populating patient data
    res.json(xrayRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching X-ray records", error });
  }
});

// GET endpoint to fetch X-ray records for a specific patient
app.get("/api/xrayResults/:patientId", async (req, res) => {
  const { patientId } = req.params;

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid patient ID" });
  }

  try {
    const xrayRecords = await XrayModel.find({ patient: patientId }).populate(
      "patient"
    );
    res.json(xrayRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching X-ray records", error });
  }
});

//console log
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
