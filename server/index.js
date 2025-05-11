const mongoose = require("mongoose");
const multer = require("multer");
const express = require("express");
const cors = require("cors");
const path = require("path");
const EmployeeModel = require("./models/Employee");
const e = require("express");
const ClinicModel = require("./models/Clinic");
const PatientModel = require("./models/Patient");
const LaboratoryModel = require("./models/Laboratory");
const LaboratoryResultsModel = require("./models/LaboratoryResults");
const PhysicalTherapyModel = require("./models/PhysicalTherapy");
const PackageModel = require("./models/Package");
const MedicalHistoryModel = require("./models/MedicalHistory");
const VaccineModel = require("./models/Vaccine"); // Path to your vaccine routes
const PhysicalExamStudentModel = require("./models/PhysicalExamStudent");
const VaccineListModel = require("./models/VaccineList");
const AnnualCheckUp = require("./models/AnnualCheckUp");
const LaboratoryListModel = require("./models/LaboratoryList");

const app = express();
app.use(cors());
app.use(express.json());
const nodemailer = require("nodemailer");
require('dotenv').config();

const port = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// V A C C I N E   L I S T
app.post("/api/vaccine-list", async (req, res) => {
  try {
    const newVaccine = await VaccineListModel.create(req.body);
    res.status(201).json(newVaccine);
  } catch (error) {
    res.status(500).json({ message: "Error adding vaccine to list", error });
  }
});

app.get("/api/vaccine-list", async (req, res) => {
  try {
    const vaccines = await VaccineListModel.find();
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vaccines", error });
  }
});

app.delete("/api/vaccine-list/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedVaccine = await VaccineListModel.findByIdAndDelete(id);
    if (!deletedVaccine) {
      return res.status(404).json({ message: "Vaccine not found" });
    }
    res.json({ message: "Vaccine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vaccine", error });
  }
});

app.put("/api/vaccine-list/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const updatedVaccine = await VaccineListModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVaccine) {
      return res.status(404).json({ message: "Vaccine not found" });
    }
    res.json(updatedVaccine);
  } catch (error) {
    console.error("Error updating vaccine:", error.stack); // Full stack trace for debugging
    res.status(500).json({ message: "Error updating vaccine", error });
  }
});

// P H Y S I C A L E X A M   S T U D E N T
app.post("/api/physical-exam-student", async (req, res) => {
  try {
    const physicalExamStudent = req.body;
    const newPhysicalExamStudent = await PhysicalExamStudentModel.create(
      physicalExamStudent
    );
    res.json({
      message: "Physical Exam Student created successfully",
      newPhysicalExamStudent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating Physical Exam Student",
      error: error.message,
    });
  }
});

app.get("/api/physical-exam-student", async (req, res) => {
  try {
    const physicalExamStudents = await PhysicalExamStudentModel.find();
    res.json(physicalExamStudents);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Physical Exam Students",
      error: error.message,
    });
  }
});

// Updated backend route to fetch a physical exam by package number and patient ID
app.get(
  "/api/physical-exam-student/:packageNumber/:patientId",
  async (req, res) => {
    try {
      const { packageNumber, patientId } = req.params;
      const physicalExamData = await PhysicalExamStudentModel.findOne({
        packageNumber,
        patient: patientId, // Assuming `patient` is the field storing patient IDs
      });
      res.json(physicalExamData);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching physical exam data",
        error: error.message,
      });
    }
  }
);

//M E D I C A L   H I S T O R Y
app.post("/api/medical-history", async (req, res) => {
  try {
    // Create a new medical history document
    const newMedicalHistory = new MedicalHistoryModel(req.body);

    // Save to the database
    const savedMedicalHistory = await newMedicalHistory.save();

    // Send a success response
    res.status(201).json({
      message: "Medical history added successfully",
      data: savedMedicalHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding medical history", error: error.message });
  }
});

// GET endpoint to fetch all medical history records
app.get("/api/medical-history", async (req, res) => {
  try {
    // Fetch all medical history records
    const medicalHistory = await MedicalHistoryModel.find().populate("patient");
    res.json(medicalHistory);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching medical history records",
      error: error,
    });
  }
});

// GET endpoint to fetch a single medical history record by its ID
app.get("/api/medical-history/id/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "Invalid medical history ID format" });
  }

  try {
    const medicalHistory = await MedicalHistoryModel.findById(id).populate(
      "patient"
    );
    if (!medicalHistory) {
      return res
        .status(404)
        .json({ message: "Medical history record not found" });
    }
    res.json(medicalHistory);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching medical history record",
      error: error.message,
    });
  }
});

// // GET endpoint to fetch medical history record by ID
// app.get('/api/medical-history/:id', async (req, res) => {
//   const { patientId } = req.params;

//   try {
//       // Find medical history record by ID
//       const medicalHistory = await MedicalHistoryModel.findById(patientId).populate('patient');
//       if (!medicalHistory) {
//           return res.status(404).json({ message: 'Medical history record not found' });
//       }
//       res.json(medicalHistory);
//   } catch (error) {
//       res.status(500).json({ message: 'Error fetching medical history record', error: error });
//   }
// });

// GET endpoint to fetch medical history records by patient ID
app.get("/api/medical-history/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    // Find all medical history records for the specific patient
    const medicalHistories = await MedicalHistoryModel.find({
      patient: patientId,
    }).populate("patient");

    // Return medical histories (this will be an empty array if no records found)
    res.json(medicalHistories); // No need to check for length here
  } catch (error) {
    res.status(500).json({
      message: "Error fetching medical history records",
      error: error.message,
    });
  }
});

//Put endpoint to update medical history record
app.put("/api/medical-history/:id", async (req, res) => {
  const { id } = req.params;
  const updatedMedicalHistory = req.body;

  try {
    // Update the medical history in the database
    const updatedRecord = await MedicalHistoryModel.findByIdAndUpdate(
      id,
      updatedMedicalHistory,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are applied
      }
    );

    if (!updatedRecord) {
      return res.status(404).send("Medical history not found.");
    }

    res.status(200).send(updatedRecord);
  } catch (error) {
    res.status(500).send("Error updating medical history.");
  }
});

app.post("/api/packages", async (req, res) => {
  const {
    name,
    packageFor,
    bloodChemistry,
    hematology,
    clinicalMicroscopyParasitology,
    bloodBankingSerology,
    microbiology,
    xrayType,
    xrayDescription,
    
  } = req.body;

  const newPackage = new PackageModel({
    name,
    packageFor,
    bloodChemistry,
    hematology,
    clinicalMicroscopyParasitology,
    bloodBankingSerology,
    microbiology,
    xrayType,
    xrayDescription,
  });

  try {
    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(400).json({ message: "Error creating package" });
  }
});

app.get("/api/packages", async (req, res) => {
  try {
    const packages = await PackageModel.find();
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching packages" });
  }
});

app.get("/api/packages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const package = await PackageModel.findById(id);
    res.json(package);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching package" });
  }
});

app.put("/api/packages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPackage = await PackageModel.findByIdAndUpdate(
      id,
      { isArchived: true }, // Set isArchived to true
      { new: true } // Return the updated document
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json(updatedPackage);
  } catch (error) {
    console.error("Error archiving package:", error);
    res.status(500).json({ message: "Error archiving package" });
  }
});

// P H Y S I C A L   T H E R A P Y   R E C O R D S

const storaged = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the 'uploads' folder (ensure it's created)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); // Set a unique filename for each upload
  },
});

const uploaded = multer({ storage: storaged });

app.post("/api/physicalTherapy", uploaded.single("record"), (req, res) => {
  const physicalTherapyData = req.body;

  // Log to confirm file is uploaded correctly
  console.log("File received:", req.file); // This should log the file info if the upload works

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(physicalTherapyData.patient)) {
    return res.status(400).json({
      success: false,
      message: "Invalid patient ID",
    });
  }

  // Check if the record is a file or a URL and save it accordingly
  if (req.file) {
    // If an image is uploaded, include its path in the physicalTherapyData
    const filePath = `http://localhost:3001/uploads/${req.file.filename}`; // Relative path to the file
    physicalTherapyData.record = filePath; // Save the relative file path in the database
    console.log("Saved file path:", filePath); // Log the saved file path
  } else if (physicalTherapyData.recordUrl) {
    // If a URL is provided instead of a file, save the URL
    physicalTherapyData.record = physicalTherapyData.recordUrl;
    console.log("Saved file URL:", physicalTherapyData.record); // Log the saved URL
  } else {
    console.log("No file or URL uploaded.");
  }

  // Create the physical therapy record in the database
  PhysicalTherapyModel.create(physicalTherapyData)
    .then((createdRecord) => {
      // Send the response back with the full URL to the uploaded file (if a file was uploaded)
      const fileUrl = createdRecord.record
        ? `http://localhost:3001${createdRecord.record}` // Full URL for the uploaded file
        : createdRecord.record; // If it's a URL, use the record itself
      res.json({
        success: true,
        message: "Physical Therapy request created successfully",
        physicalTherapyData: createdRecord,
        fileUrl: fileUrl, // Return the file URL or record URL
      });
    })
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Error creating Physical Therapy request",
        error: err.message,
      })
    );
});

app.get("/api/physicalTherapy", async (req, res) => {
  try {
    const physicalTherapyRecords = await PhysicalTherapyModel.find().populate(
      "patient"
    );
    res.json(physicalTherapyRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching X-ray records", error });
  }
});

// GET endpoint to fetch Physical Therapy records for a specific patient
app.get("/api/physicalTherapy/:patientId", async (req, res) => {
  const { patientId } = req.params;

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid patient ID" });
  }

  try {
    const physicalTherapyRecords = await PhysicalTherapyModel.find({
      patient: patientId,
    }).populate("patient");
    res.json(physicalTherapyRecords);
  } catch (error) {
    console.error("Error fetching Physical Therapy records:", error);
    res
      .status(500)
      .json({ message: "Error fetching Physical Therapy records", error });
  }
});

app.put("/api/physicalTherapy/:id", async (req, res) => {
  const { id } = req.params;
  const { SOAPSummary } = req.body;

  try {
    const updatedRecord = await PhysicalTherapyModel.findByIdAndUpdate(
      id,
      { $push: { SOAPSummaries: { summary: SOAPSummary } } },
      { new: true }
    );
    if (updatedRecord) {
      res.json({
        success: true,
        message: "SOAP summary added successfully",
        updatedRecord,
      });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding SOAP summary",
      error: error.message,
    });
  }
});

app.put("/api/physicalTherapy/:id/soapSummary/:summaryId", async (req, res) => {
  const { id, summaryId } = req.params;
  const { updatedSOAPSummary } = req.body;

  try {
    const updatedRecord = await PhysicalTherapyModel.findOneAndUpdate(
      { _id: id, "SOAPSummaries._id": summaryId },
      { $set: { "SOAPSummaries.$.summary": updatedSOAPSummary } },
      { new: true }
    );

    if (updatedRecord) {
      res.json({
        success: true,
        message: "SOAP summary updated successfully",
        updatedRecord,
      });
    } else {
      res.status(404).json({ message: "Record or SOAP summary not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating SOAP summary",
      error: error.message,
    });
  }
});


app.put("/api/physicalTherapyVerification/:id/soapSummary/:summaryId", async (req, res) => {
  const { id, summaryId } = req.params;
  const { updatedSOAPSummary } = req.body; // Contains firstname and lastname

  try {
    // Update the verifiedBy field and fetch the updated record
    const updatedRecord = await PhysicalTherapyModel.findOneAndUpdate(
      { _id: id, "SOAPSummaries._id": summaryId },
      { 
        $set: { 
          "SOAPSummaries.$.verifiedBy": `${updatedSOAPSummary.firstname} ${updatedSOAPSummary.lastname}` // Save the full name
        } 
      },
      { new: true } // Return the updated document
    );

    if (updatedRecord) {
      res.json({
        success: true,
        message: "SOAP summary updated successfully",
        updatedRecord,
      });
    } else {
      res.status(404).json({ message: "Record or SOAP summary not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating SOAP summary",
      error: error.message,
    });
  }
});

const fs = require("fs");

// Define the uploads directory path
const uploadsDir = path.join(__dirname, "uploads");

// Check if the uploads directory exists, create it if it doesn't
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created at:", uploadsDir);
} else {
  console.log("Uploads directory already exists:", uploadsDir);
}

// Serve static files from 'uploads' directory
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure the 'uploads/' directory exists
  },
  filename: async (req, file, cb) => {
    try {
      const { id } = req.params;

      // Fetch employee details to get the last name
      const employee = await EmployeeModel.findById(id).select("lastname"); // Ensure 'lastname' is correct

      console.log("Fetched Employee:", employee);

      if (!employee) {
        return cb(new Error("Employee not found"), false); // Handle error if not found
      }

      // Use employee's last name as the filename, append timestamp to avoid conflicts
      const uniqueSuffix = Date.now();
      const filename = `${employee.lastname}-${uniqueSuffix}${path.extname(
        file.originalname
      )}`;

      cb(null, filename); // Set the generated filename
    } catch (error) {
      console.error("Error fetching employee for filename:", error);
      cb(error, false); // Handle error during filename generation
    }
  },
});

const upload = multer({ storage });

// API endpoint to upload signature
app.post(
  "/api/upload-signature/user/:id",
  upload.single("signature"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const { id } = req.params;

      // Find the employee by id and update the signature field with the new filename
      const employee = await EmployeeModel.findByIdAndUpdate(
        id,
        { signature: req.file.filename }, // Store the generated filename based on the last name
        { new: true } // Return the updated employee
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.json({
        message: "Signature uploaded successfully",
        signature: req.file.filename, // Return the updated signature filename
      });
    } catch (error) {
      console.error("Error during signature upload:", error);
      return res
        .status(500)
        .json({ message: "Server error while uploading signature" });
    }
  }
);

// API endpoint to fetch the signature
app.get("/api/signature/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await EmployeeModel.findById(id).select("signature"); // Select only the signature field

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Create the URL for the signature file
    const signatureUrl = `http://localhost:3001/${employee.signature}`;

    return res.json({ signature: signatureUrl }); // Return the full URL
  } catch (error) {
    console.error("Error fetching signature:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching signature" });
  }
});

// Express route example to fetch employee details
app.get("/api/employees/:employeeId", async (req, res) => {
  const employeeId = req.params.employeeId;
  try {
    const employee = await EmployeeModel.findById(employeeId); // Replace with your DB query logic
    if (employee) {
      res.status(200).json(employee);
    } else {
      res.status(404).send("Employee not found.");
    }
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).send("Error fetching employee.");
  }
});

app.post("/api/laboratory-results", async (req, res) => {
  const {
    ORNumber,
    labNumber,
    patient,
    clinicId,
    laboratoryId,
    results, // ✅ This is now used instead of fixed fields like bloodChemistry, etc.
  } = req.body;

  try {
    const labResults = await LaboratoryResultsModel.create({
      ORNumber,
      labNumber,
      patient,
      clinicId,
      laboratoryId,
      results, // ✅ Save structured results array
    });

    console.log("✅ Laboratory results saved to database:", labResults._id); // Inform the console

    res.json({
      message: "Laboratory results saved successfully",
      labResults,
    });
  } catch (error) {
    console.error("❌ Error saving laboratory results:", error);
    res.status(500).json({ message: "Error saving laboratory results", error });
  }
});


// Endpoint to get lab results by ID
app.get("/api/laboratory-results/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const labResult = await LaboratoryResultsModel.findById(id);
    if (!labResult) {
      return res.status(404).json({ message: "Laboratory result not found" });
    }
    res.json(labResult);
  } catch (error) {
    console.error("Error fetching laboratory result:", error);
    res
      .status(500)
      .json({ message: "Error fetching laboratory result", error });
  }
});

app.get("/api/laboratory-results/by-request/:laboratoryId", async (req, res) => {
  const { laboratoryId } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(laboratoryId)) {
    return res.status(400).json({ message: "Invalid laboratory request ID format" });
  }

  try {
    console.log("🔍 Looking for lab result with laboratoryId:", laboratoryId);

    // Fetch lab result and populate the patient reference
    const labResult = await LaboratoryResultsModel.findOne({
      laboratoryId: new mongoose.Types.ObjectId(laboratoryId),
    }).populate("patient");

    if (!labResult) {
      return res.status(404).json({ message: "No laboratory result found for the given request ID" });
    }

    console.log("👤 Patient info:", labResult.patient);
    console.log("🧪 Lab results array:", labResult.results);

    // Respond with raw results + patient info
    res.status(200).json({
      _id: labResult._id,
      laboratoryId: labResult.laboratoryId,
      ORNumber: labResult.ORNumber || null,
      labNumber: labResult.labNumber || null,
      isCreatedAt: labResult.isCreatedAt,
      patient: labResult.patient || null,
      results: labResult.results || [], // Use the exact schema field name
    });
  } catch (error) {
    console.error("❌ Error fetching lab result:", error);
    res.status(500).json({ message: "Error fetching laboratory result", error });
  }
});

app.put("/api/laboratory-results/update/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedLabResult = await LaboratoryResultsModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLabResult) {
      return res.status(404).json({ message: "Laboratory result not found." });
    }

    res.status(200).json(updatedLabResult);
  } catch (error) {
    console.error("Error updating laboratory result:", error);
    res.status(500).json({ message: "Error updating laboratory result." });
  }
});

// // POST endpoint to save a lab request
// app.post("/api/laboratory-results", async (req, res) => {
//   const labData = req.body; // Expecting the form data in the request body
//   LaboratoryResultsModel.create(labData)
//     .then((labResult) =>
//       res.json({
//         message: "Laboratory request created successfully",
//         labResult,
//       })
//     )
//     .catch((err) =>
//       res
//         .status(500)
//         .json({ message: "Error creating laboratory request", error: err })
//     );
// });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: "clinicub01@gmail.com",
    pass: "ydif agki wbne yggg",
  },
});

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Store generated OTPs (in-memory storage, for simplicity)
const otpStore = new Map();

// Endpoint to send OTP to the user's email
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the user collection
  const user = await EmployeeModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "Email not found" });
  }

  // If email is valid, generate an OTP and send it
  const otp = generateOTP();
  otpStore.set(email, otp); // Store OTP in memory

  const mailOptions = {
    from: "clinicub01@gmail.com",
    to: email,
    subject: "Forgot Password OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to verify the entered OTP and change the password
app.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if the entered OTP matches the stored OTP
  if (otpStore.has(email) && otpStore.get(email) == otp) {
    // OTP is valid
    otpStore.delete(email); // Remove the used OTP

    try {
      // Update the user's password in MongoDB without hashing
      await EmployeeModel.updateOne({ email }, { password: newPassword });

      console.log("Password updated successfully");
      res.json({
        message: "Password updated successfully! Redirecting you to Login...",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

// account registration
app.post("/register", (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    signature,
    confirmPassword,
    role,
    department,
  } = req.body;

  const assignedRole = role === "admin" ? "admin" : "user";

  EmployeeModel.create({
    firstname,
    lastname,
    email,
    password,
    signature,
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

// app.put("/user/:id/update-password", (req, res) => {
//   const { id } = req.params;
//   const { password } = req.body;

//   // Update the user's password
//   EmployeeModel.findByIdAndUpdate(id, { password }, { new: true })
//     .then((user) => {
//       if (user) {
//         res.json({ message: "Password updated successfully" });
//       } else {
//         res.status(404).json({ message: "User not found" });
//       }
//     })
//     .catch((err) =>
//       res.status(500).json({ message: "Error updating password", error: err })
//     );
// });

app.put("/user/:id/update-profile", (req, res) => {
  const { id } = req.params;
  const updatedProfile = req.body; // This will contain the entire profile data

  // Update the user's profile with the data from the request body
  EmployeeModel.findByIdAndUpdate(id, updatedProfile, { new: true })
    .then((user) => {
      if (user) {
        res.json({ message: "Profile updated successfully", user });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: "Error updating profile", error: err })
    );
});


// Endpoint to get pathologist's signature
app.get("/api/pathologist-signature", async (req, res) => {
  try {
    // Find an employee with the role of "pathologist"
    const pathologist = await EmployeeModel.findOne({
      role: "pathologist",
    }).select("signature");

    // Check if a pathologist with a signature was found
    if (!pathologist || !pathologist.signature) {
      return res
        .status(404)
        .json({ message: "Pathologist or signature not found" });
    }

    // Construct the URL for the signature file
    const signatureUrl = `http://localhost:3001/uploads/${pathologist.signature}`;
    return res.json({ signature: signatureUrl });
  } catch (error) {
    console.error("Error fetching pathologist signature:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching signature" });
  }
});

app.get("/api/pathologist-signature/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    const pathologist = await EmployeeModel.findOne({
      _id: userId,
      role: "pathologist", // Ensure only pathologists are considered
    }).select("signature");

    if (!pathologist || !pathologist.signature) {
      return res
        .status(404)
        .json({ message: "Pathologist or signature not found" });
    }

    const signatureUrl = `http://localhost:3001/uploads/${pathologist.signature}`;
    return res.json({ signature: signatureUrl });
  } catch (error) {
    console.error("Error fetching pathologist signature:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching signature" });
  }
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
  EmployeeModel.create({
    firstname,
    lastname,
    email,
    role,
    password,
    department,
  })
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
app.post("/add-patient", async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      birthdate,
      idnumber,
      address,
      city,
      state,
      postalcode,
      phonenumber,
      email,
      course,
      year,
      sex,
      patientType,
      emergencyContact,
      position,
      bloodType,
    } = req.body;

    let generatedIdNumber = idnumber || null;

    // Generate idnumber for OPD if it's not provided
    if (patientType === "OPD" && !idnumber) {
      let isUnique = false;
      let counter = 1;

      while (!isUnique) {
        const potentialId = `OPD${counter}`;
        const existingPatient = await PatientModel.findOne({
          idnumber: potentialId,
        });

        if (!existingPatient) {
          generatedIdNumber = potentialId;
          isUnique = true;
        } else {
          counter++;
        }
      }
    }

    // Validate that required fields are present
    if (
      !firstname ||
      !lastname ||
      !birthdate ||
      !phonenumber ||
      !email ||
      !generatedIdNumber
    ) {
      throw new Error("Missing required fields");
    }

    const newPatient = new PatientModel({
      firstname,
      middlename,
      lastname,
      birthdate,
      idnumber: generatedIdNumber,
      address,
      city,
      state,
      postalcode,
      phonenumber,
      email,
      course,
      year,
      sex,
      patientType,
      emergencyContact,
      position,
      bloodType,
    });

    const savedPatient = await newPatient.save();
    res
      .status(201)
      .json({ message: "Patient added successfully", patient: savedPatient });
  } catch (error) {
    console.error("Error adding patient:", error);
    res
      .status(500)
      .json({ message: "Error adding patient", error: error.message });
  }
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
  try {
    const labData = req.body; // Expecting the form data in the request body

    const labRequest = await LaboratoryModel.create(labData);
    res.json({
      message: "Laboratory request created successfully",
      labRequest,
    });
  } catch (err) {
    console.error("Error creating laboratory request:", err); // Log the error
    res.status(500).json({
      message: "Error creating laboratory request",
      error: err.message, // Include error message in the response
    });
  }
});

// GET endpoint to fetch lab records
app.get("/api/laboratory", async (req, res) => {
  const { clinicId } = req.query;

  try {
    let query = {};
    if (clinicId) {
      query.clinicId = clinicId; // Filter lab records by clinicId
    }

    const labRecords = await LaboratoryModel.find(query).populate("patient");
    res.json(labRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching laboratory records", error });
  }
});

// GET endpoint to fetch lab records for a specific patient with package details
app.get("/api/laboratory/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const labRecords = await LaboratoryModel.find({
      patient: patientId,
    })
      .populate("patient")
      .populate("packageId");

    res.json(labRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching laboratory records", error });
  }
});

// PUT endpoint to update labResult in Laboratory
app.put("/api/laboratory/:id", async (req, res) => {
  const { id } = req.params;
  const { labResult } = req.body;

  try {
    const updatedLab = await LaboratoryModel.findByIdAndUpdate(
      id,
      { labResult },
      { new: true }
    );

    if (updatedLab) {
      res.json({
        message: "Laboratory status updated successfully",
        updatedLab,
      });
    } else {
      res.status(404).json({ message: "Laboratory not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating laboratory status", error });
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

app.put("/api/clinicalRecords/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedRecord = await ClinicModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (updatedRecord) {
      res.json({
        success: true,
        message: "Record updated successfully",
        updatedRecord,
      });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating record",
      error: error.message,
    });
  }
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
    const clinicalRecords = await ClinicModel.find({
      patient: patientId,
    }).populate("createdBy"); // Populate employee details
    res.json(clinicalRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clinical records", error });
  }
});

// X R A Y  R E C O R D S
const XrayModel = require("./models/Xray");
const VaccineList = require("./models/VaccineList");

app.post("/api/xrayResults", async (req, res) => {
  const xrayResults = req.body;

  // Validate if the provided patient ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(xrayResults.patient)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid patient ID" });
  }

  const newXrayRecord = {
    ORNumber: xrayResults.ORNumber, // Include ORNumber here
    ...xrayResults,
  };

  XrayModel.create(newXrayRecord)
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
  const { clinicId } = req.query;
  try {
    const query = clinicId ? { clinicId } : {}; // Filter by clinicId if provided
    const xrayRecords = await XrayModel.find(query).populate("patient");
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

const router = express.Router();
// Ensure the folder exists or create it
const xrayResultUploadPath = path.join(__dirname, "./xrayResultUpload");
if (!fs.existsSync(xrayResultUploadPath)) {
  fs.mkdirSync(xrayResultUploadPath, { recursive: true }); // Create the folder if it doesn't exist
}

// Multer storage setup
const storagee = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./xrayResultUpload/"); // Folder where files will be uploaded
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop(); // Extract the file extension
    // const filename = ${req.body.XrayNo}_${Date.now()}.${extension};
    // cb(null, filename);
    const filename = `${req.body.XrayNo}_${Date.now()}.${extension}`;
    cb(null, filename);
  },
});

app.use(
  "/xrayResultUpload",
  express.static(path.join(__dirname, "xrayResultUpload"))
);
const uploadd = multer({ storage: storagee });

// API endpoint to handle PUT request for updating X-ray results
app.put(
  "/api/xrayResults/:id",
  uploadd.single("imageFile"),
  async (req, res) => {
    const { patientId, clinicId, ORNumber, XrayNo, diagnosis, xrayFindings } =
      req.body;
    const imageFile = req.file ? req.file.filename : ""; // Check if a new file was uploaded

    try {
      // Find the existing record by ID
      const existingRecord = await XrayModel.findById(req.params.id);
      if (!existingRecord) {
        return res.status(400).json({
          success: false,
          message: "No matching record found for the given patient and clinic.",
        });
      }

      // Update fields
      existingRecord.ORNumber = ORNumber; // Update ORNumber here
      existingRecord.XrayNo = XrayNo;
      existingRecord.diagnosis = diagnosis || "";
      existingRecord.xrayFindings = xrayFindings || "";
      // Only update imageFile if a new image is uploaded
      if (imageFile) {
        const imageUrl = `http://localhost:3001/xrayResultUpload/${imageFile}`;
        existingRecord.imageFile = imageUrl;
      }

      // Set xrayResult to 'done'
      existingRecord.xrayResult = "done";

      // Save the updated record
      const updatedXray = await existingRecord.save();
      console.log("Updated X-ray record:", updatedXray); // Log the updated record

      // Return success and include the imageFile for preview
      return res.json({
        success: true,
        updatedRecord: updatedXray,
        imageFile: existingRecord.imageFile, // Return the existing or new image URL for preview
      });
    } catch (error) {
      console.error("Error updating X-ray record:", error);
      res.status(500).json({ message: "Error updating X-ray record", error });
    }
  }
);

// Endpoint to get X-ray result by ID
app.get("/api/xrayResults/id/:id", async (req, res) => {
  const { id } = req.params;

  // Validate if the provided ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid X-ray ID format" });
  }

  try {
    // Find the X-ray record by ID
    const xrayResult = await XrayModel.findById(id).populate("patient");
    if (!xrayResult) {
      return res.status(404).json({ message: "X-ray result not found" });
    }
    res.json(xrayResult);
  } catch (error) {
    console.error("Error fetching X-ray result:", error);
    res.status(500).json({ message: "Error fetching X-ray result", error });
  }
});

// POST /api/vaccines - Add a new vaccine
app.post("/api/vaccines", async (req, res) => {
  const { patient, name, dateAdministered, administeredBy, nextDose } =
    req.body;

  // Basic validation
  if (!patient || !name || !administeredBy) {
    return res.status(400).json({
      message: "Patient ID, vaccine name, and administeredBy are required.",
    });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(400).json({ message: "Invalid patient ID format." });
  }
  if (!mongoose.Types.ObjectId.isValid(administeredBy)) {
    return res
      .status(400)
      .json({ message: "Invalid administeredBy ID format." });
  }

  try {
    const newVaccine = new VaccineModel({
      patient,
      name,
      dateAdministered: dateAdministered || Date.now(),
      administeredBy,
      nextDose,
    });

    const savedVaccine = await newVaccine.save();
    res
      .status(201)
      .json({ message: "Vaccine added successfully", data: savedVaccine });
  } catch (error) {
    console.error("Error adding vaccine:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// GET /api/vaccines - Fetch all vaccines
app.get("/api/vaccines", async (req, res) => {
  try {
    const vaccines = await VaccineModel.find()
      .populate("patient")
      .populate("administeredBy");
    res.json(vaccines);
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// GET /api/vaccines/:id - Fetch vaccine by ID
app.get("/api/vaccines/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid vaccine ID format" });
  }

  try {
    const vaccine = await VaccineModel.findById(id)
      .populate("patient")
      .populate("administeredBy");
    if (!vaccine) {
      return res.status(404).json({ message: "Vaccine not found" });
    }
    res.json(vaccine);
  } catch (error) {
    console.error("Error fetching vaccine:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.get("/api/vaccines/patient/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid patient ID format" });
  }

  try {
    const vaccines = await VaccineModel.find({ patient: id }).populate(
      "administeredBy"
    );

    // Return an empty array instead of 404 if no records are found
    res.json(vaccines); // This will be an empty array if no records found
  } catch (error) {
    console.error("Error fetching vaccine records:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Delete laboratory record
app.delete("/api/laboratory/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid laboratory ID format." });
  }
  try {
    const labRecord = await LaboratoryModel.findByIdAndDelete(id);
    if (!labRecord) {
      return res.status(404).json({ message: "Lab record not found." });
    }
    res.json({ message: "Lab record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lab record.", error });
  }
});

// Delete X-ray record
app.delete("/api/xrayResults/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid X-ray ID format." });
  }
  try {
    const xrayRecord = await XrayModel.findByIdAndDelete(id);
    if (!xrayRecord) {
      return res.status(404).json({ message: "X-ray record not found." });
    }
    res.json({ message: "X-ray record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting X-ray record.", error });
  }
});

// A N N U A L C H E C K U P - E M P L O Y E E
app.post("/api/annual-check-up", async (req, res) => {
  try {
    const annualCheckUpData = req.body;

    // Ensure required fields are present in the request
    if (!annualCheckUpData.patient || !annualCheckUpData.packageId || !annualCheckUpData.packageNumber) {
      return res.status(400).json({
        message: "Missing required fields: patient, packageId, or packageNumber",
      });
    }

    // Create the new annual check-up entry in the database
    const newAnnualCheckUp = await AnnualCheckUp.create(annualCheckUpData);

    res.status(201).json({
      message: "Annual Check-Up created successfully",
      newAnnualCheckUp,
    });
  } catch (error) {
    console.error("Error creating Annual Check-Up:", error.message);
    res.status(500).json({
      message: "Error creating Annual Check-Up",
      error: error.message,
    });
  }
});

// Fetch annual check-up data by package number and patient ID
app.get("/api/annual-check-up/:packageNumber/:patientId", async (req, res) => {
  try {
    const { packageNumber, patientId } = req.params;

    // Find the annual check-up data by package number and patient ID
    const annualCheckUpData = await AnnualCheckUp.findOne({
      packageNumber,
      patient: patientId,  // Assuming 'patient' field stores the patient ID
    });

    if (!annualCheckUpData) {
      return res.status(404).json({ message: "Annual Check-Up data not found" });
    }

    res.json(annualCheckUpData);
  } catch (error) {
    console.error("Error fetching annual check-up data:", error.message);
    res.status(500).json({
      message: "Error fetching annual check-up data",
      error: error.message,
    });
  }
});

// L A B O R A T O R Y   T E S T   L I S T
app.post("/api/laboratorytest-list", async (req, res) => {
  try {
    const newLaboratoryTest = await LaboratoryListModel.create(req.body);
    res.status(201).json(newLaboratoryTest);
  } catch (error) {
    res.status(500).json({ message: "Error adding laboratory test to list", error });
  }
});

app.get("/api/laboratorytest-list", async (req, res) => {
  try {
    const laboratorytests = await LaboratoryListModel.find();
    res.json(laboratorytests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching laboratory test", error });
  }
});

app.delete("/api/laboratorytest-list/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLaboratoryTest = await LaboratoryListModel.findByIdAndDelete(id);
    if (!deletedLaboratoryTest) {
      return res.status(404).json({ message: "Laboratory Test not found" });
    }
    res.json({ message: "Laboratory test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting laboratory test", error });
  }
});

app.put("/api/laboratorytest-list/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const updatedLaboratoryTest = await LaboratoryListModel.findByIdAndUpdate(
      id,
      req.body,  // Body contains the updated data
      { new: true, runValidators: true } // Return the updated test object
    );
    if (!updatedLaboratoryTest) {
      return res.status(404).json({ message: "Laboratory Test not found" });
    }
    res.json(updatedLaboratoryTest); // Return the updated test
  } catch (error) {
    console.error("Error updating laboratory test:", error.stack);
    res.status(500).json({ message: "Error updating laboratory test", error });
  }
});


//console log
app.listen(port, () => {
  console.log("Server is running on port 3001");
});
