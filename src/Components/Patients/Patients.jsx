import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import MedicalClinicCensus from '../certificatesReports/MedicalClinicCensus.jsx'


function Patients() {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 4;
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [patientToEdit, setPatientToEdit] = useState(null);

  const [patientType, setPatientType] = useState("");
  const [firstname, setFirstName] = useState("");
  const [middlename, setMiddleName] = useState("");
  const [lastname, setLastName] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [idnumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [sex, setSex] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [position, setPosition] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [patientInfo, setPatientInfo] = useState(null);

  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownIndex !== null &&
        dropdownRefs.current[dropdownIndex] &&
        !dropdownRefs.current[dropdownIndex].contains(event.target)
      ) {
        setDropdownIndex(null);
      }
    };

    if (dropdownIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownIndex]);

  const fetchPatients = () => {
    axios
      .get("https://cmrms-full.onrender.com/patients",{
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      })
      .then((response) => {
        const sortedPatients = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPatients(sortedPatients);
      })
      .catch((error) => {
        console.error("There was an error fetching the patients!", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const patientData = {
      firstname,
      middlename,
      lastname,
      birthdate,
      idnumber,
      address,
      phonenumber,
      email,
      course,
      year,
      sex,
      patientType,
      emergencyContact,
      position,
      bloodType,
    };

    if (patientToEdit) {
      // Update existing patient (Edit)
      axios
        .put(`https://cmrms-full.onrender.com/patients/${patientToEdit._id}`, patientData,{
          headers: {
            "x-api-key":process.env.API_KEY,
          },
        })
        .then((result) => {
          console.log("Patient updated:", result);
          fetchPatients(); // Refresh the patient list after update
          handleModalClose(); // Close the modal after successful update
          setMessage("Patient updated successfully!");
          setTimeout(() => setMessage(""), 3000); // Clear the message after a timeout
        })
        .catch((err) => {
          console.log("Error updating patient:", err);
          setMessage("Error updating patient.");
          setTimeout(() => setMessage(""), 3000); // Clear error message after a timeout
        });
    } else {
      // Add new patient
      axios
        .post("https://cmrms-full.onrender.com/add-patient", patientData,{
          headers: {
            "x-api-key":process.env.API_KEY,
          },
        })
        .then((result) => {
          console.log("Patient added:", result);
          fetchPatients(); // Refresh the patient list after adding a new patient
          handleModalClose(); // Close the modal after successful addition
          resetForm(); // Clear the form fields after submission (only for new patient)
          setMessage("Patient added successfully!");
          setTimeout(() => setMessage(""), 3000); // Clear success message after a timeout
        })
        .catch((err) => {
          console.log("Error adding patient:", err);
          setMessage("Error adding patient.");
          setTimeout(() => setMessage(""), 3000); // Clear error message after a timeout
        });
    }
  };

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBirthDate("");
    setIdNumber("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");
    setCourse("");
    setYear("");
    setSex("");
    setEmergencyContact("");
    setPosition("");
    setPatientType("");
    setBloodType("");
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;

  // Extract unique course names
  const courses = [
    ...new Set(
      patients.map((patient) => patient.course).filter((course) => course)
    ),
  ];
  // Extract unique year levels
  const years = [
    ...new Set(patients.map((patient) => patient.year).filter((year) => year)),
  ];
  // Extract unique positions
  const positions = [
    ...new Set(
      patients.map((patient) => patient.position).filter((position) => position)
    ),
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.idnumber.toLowerCase().includes(searchQuery.toLowerCase());

    // Conditional filtering based on the role type
    if (selectedPosition) {
      // Filter only by position if a position is selected
      return patient.position === selectedPosition && matchesSearch;
    } else {
      // Filter by course and year if no position is selected
      const matchesCourse = selectedCourse
        ? patient.course === selectedCourse
        : true;
      const matchesYear = selectedYear ? patient.year === selectedYear : true;
      return matchesSearch && matchesCourse && matchesYear;
    }
  });

  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginateNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginatePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleListVisibility = () => {
    setShowFullList(!showFullList);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
    setPatientToEdit(null); // Clear the editing state
  };

  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleEditPatient = (patientId) => {
    const patient = patients.find((p) => p._id === patientId); // Find the correct patient by ID

    if (patient) {
      // Preload the form with the patient's data
      setPatientToEdit(patient);
      setPatientType(patient.patientType);
      setFirstName(patient.firstname);
      setMiddleName(patient.middlename);
      setLastName(patient.lastname);
      setBirthDate(new Date(patient.birthdate).toISOString().split("T")[0]);
      setIdNumber(patient.idnumber);
      setAddress(patient.address);
      setPhoneNumber(patient.phonenumber);
      setEmail(patient.email);
      setCourse(patient.course);
      setYear(patient.year);
      setSex(patient.sex);
      setEmergencyContact(patient.emergencyContact);
      setPosition(patient.position);
      setBloodType(patient.bloodType);
      setIsModalOpen(true);
    }
  };

  const handleDeletePatient = async () => {
    try {
      const patientId = accountToDelete; // Use the stored patient ID
      console.log("Deleting patient with ID:", patientId);
      const result = await axios.delete(
        `https://cmrms-full.onrender.com/patients/${patientId}`
      ,{
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      });
      console.log(result);
      fetchPatients();
      setIsConfirmModalOpen(false);
      setMessage("Patient deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setMessage("Error deleting patient.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteClick = (patientId) => {
    setAccountToDelete(patientId); // Set patient ID to delete
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const [role, setRole] = useState(null); // Store the user role

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole); // Store the role in state
    }
  }, []);

  const [sortOption, setSortOption] = useState(""); // New state for sorting

  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const sortedPatients = filteredPatients
    .filter((patient) => {
      // Optional: Add search filtering here
      return (
        patient.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.firstname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((patient) => {
      // Sorting based on the selected option
      if (sortOption === "Student") return patient.patientType === "Student";
      if (sortOption === "Employee") return patient.patientType === "Employee";
      if (sortOption === "OPD") return patient.patientType === "OPD";
      return true; // Show all if no sorting option selected
    });

  // Initial state for medical history
  const initialMedicalHistoryState = {
    conditions: {
      noseThroatDisorders: false,
      earTrouble: false,
      asthma: false,
      tuberculosis: false,
      lungDiseases: false,
      highBloodPressure: false,
      heartDiseases: false,
      rheumaticFever: false,
      diabetesMellitus: false,
      endocrineDisorder: false,
      cancerTumor: false,
      mentalDisorder: false,
      headNeckInjury: false,
      hernia: false,
      rheumatismJointPain: false,
      eyeDisorders: false,
      stomachPainUlcer: false,
      abdominalDisorders: false,
      kidneyBladderDiseases: false,
      std: false,
      familialDisorder: false,
      tropicalDiseases: false,
      chronicCough: false,
      faintingSeizures: false,
      frequentHeadache: false,
      dizziness: false,
    },
    malaria: {
      hasMalaria: null,
      lastAttackDate: "",
    },
    operations: {
      undergoneOperation: null,
      listOperations: "",
    },
    signature: {
      fileName: null,
      fileType: null,
    },
    familyHistory: {
      diseases: {
        heartDisease: false,
        tuberculosis: false,
        kidneyDisease: false,
        asthma: false,
        hypertension: false,
        diabetes: false,
        cancer: false,
      },
      allergies: {
        hasAllergies: null,
        allergyList: "",
      },
    },
    personalHistory: {
      tobaccoUse: {
        usesTobacco: null,
        sticksPerDay: "",
        quitSmoking: null,
        quitWhen: "",
      },
      alcoholUse: {
        drinksAlcohol: null,
        drinksPerDay: "",
        quitDrinking: null,
        quitWhen: "",
      },
      forWomen: {
        pregnant: null,
        months: "",
        lastMenstrualPeriod: "",
        abortionOrMiscarriage: null,
        dysmenorrhea: null,
      },
    },
  };

  const [medicalHistory, setMedicalHistory] = useState(
    initialMedicalHistoryState
  );

  // FAMILY HISTORY FUNCTIONS
  const handleCheckboxFamChange = (section, field, disease) => {
    setMedicalHistory((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: {
          ...prevState[section][field],
          [disease]: !prevState[section][field][disease], // Toggle the value
        },
      },
    }));
  };

  const handleHistoryFamRadioChange = (section, field, subfield, e) => {
    const value = e.target.value; // Get the value directly
    setMedicalHistory((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: {
          ...prevState[section][field], // Spread the existing subfield object
          [subfield]: value, // Update the specific subfield
        },
      },
    }));
  };

  const handleHistoryFamInputChange = (section, field, subfield, value) => {
    setMedicalHistory((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: {
          ...prevState[section][field], // Ensure the subfield object is retained
          [subfield]: value, // Update only the specified subfield
        },
      },
    }));
  };

  // MEDICAL HISTORY FUNCTIONS
  const handleCheckboxChange = (section, field) => {
    setMedicalHistory((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: !prevData[section][field],
      },
    }));
  };

  const handleHistoryRadioChange = (section, field, e) => {
    const value = e.target.value; // Get the value directly
    setMedicalHistory((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value, // Directly set the value based on the selected radio button
      },
    }));
  };

  const handleHistoryInputChange = (section, field, value) => {
    setMedicalHistory((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  // PERSONAL HISTORY FUNCTIONS
  const handleTobaccoChange = (field, value) => {
    setMedicalHistory((prev) => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        tobaccoUse: {
          ...prev.personalHistory.tobaccoUse,
          [field]: value,
        },
      },
    }));
  };

  const handleAlcoholChange = (field, value) => {
    setMedicalHistory((prev) => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        alcoholUse: {
          ...prev.personalHistory.alcoholUse,
          [field]: value,
        },
      },
    }));
  };

  const handleWomenHealthChange = (field, value) => {
    setMedicalHistory((prev) => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        forWomen: {
          ...prev.personalHistory.forWomen,
          [field]: value,
        },
      },
    }));
  };

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  const handleMedicalOpen = () => {
    const patientData = {
      firstname,
      middlename,
      lastname,
      birthdate,
      idnumber,
      address,
      phonenumber,
      email,
      course,
      year,
      sex,
      patientType,
      emergencyContact,
      position,
      bloodType,
    };

    setPatientInfo(patientData);
    setIsModalOpen(false); // Close the patient info modal
    setIsMedicalModalOpen(true); // Open the medical history modal
  };

  const handleMedicalClose = () => {
    setIsMedicalModalOpen(false);
    setMedicalHistory(initialMedicalHistoryState); // Reset the medical history form
    resetForm();
  };

  const [showHistoryOptions, setShowHistoryOptions] = useState(false);
  const historyDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showHistoryOptions &&
        historyDropdownRef.current &&
        !historyDropdownRef.current.contains(event.target)
      ) {
        setShowHistoryOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistoryOptions]);

  const medicalHistoryId = medicalRecords[0]?._id; // Get the medical history ID
  // Fetch the user data when the component is mounted
  useEffect(() => {
    if (medicalHistoryId) {
      axios
        .get(`https://cmrms-full.onrender.com/api/medical-history/id/${medicalHistoryId}`,
        {
          headers: {
            "x-api-key":process.env.API_KEY,
          },
        }
        )
        .then((response) => {
          setMedicalHistory(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // Optionally, display a user-friendly message
        });
    }
  }, [medicalHistoryId]);

  const handleAddPatient = async () => {
    try {
      // Step 1: Add the patient
      const patientResponse = await axios.post(
        "https://cmrms-full.onrender.com/add-patient",
        patientInfo,
        {
          headers: {
            "x-api-key":process.env.API_KEY,
          },
        }
      );
      const patientId = patientResponse.data.patient._id;

      // Step 2: Add medical history
      const historyData = {
        patient: patientId,
        ...medicalHistory,
      };

      await axios.post(
        "https://cmrms-full.onrender.com/api/medical-history",
        historyData,
        {
          headers: {
            "x-api-key":process.env.API_KEY,
          },
        }
      );

      // Close modals and reset form
      setIsMedicalModalOpen(false);
      resetForm();
      setMedicalHistory(initialMedicalHistoryState); // Reset the medical history form
      setMessage("Patient and history added successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Refresh the patient list
      fetchPatients();
    } catch (error) {
      console.error("Error adding patient and history:", error);
      setMessage("Error adding patient and history.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMonthDateModalOpen, setIsMonthDateModalOpen] = useState(false);

  const handleOpenReportModal = () => {
    setIsMonthDateModalOpen(true);
    handleCloseReportModal();  
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setIsMonthDateModalOpen(true);

  };

  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [peStudent, setPEStudent] = useState([]);
  const [vaccine, setVaccine] = useState([]);
  const [labRecords, setLabRecords] = useState([]);
  const [fromMonthYear, setFromMonthYear] = useState("");
  const [toMonthYear, setToMonthYear] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    fetchLabRecords();
    fetchClinicalRecords();
    fetchPhysicalExamStudent();
    fetchVaccine();
  }, []);

  const fetchClinicalRecords = () => {
    axios
      .get("https://cmrms-full.onrender.com/api/clinicalRecords",
      {
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      }
      )
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => {
            // Ensure required fields are not empty
            const isCompleted = record.complaints && record.treatments && record.diagnosis &&
              record.patient && record.createdBy;
            
            return isCompleted;
          })
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)); // Sort by most recent creation
  
        setClinicalRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the clinical records!", error);
      });
  };
  

  const fetchLabRecords = () => {
    axios
      .get("https://cmrms-full.onrender.com/api/laboratory",
      {
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      }
      )
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => record.labResult === "verified")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

  const fetchPhysicalExamStudent = () => {
    axios
      .get("https://cmrms-full.onrender.com/api/physical-exam-student",
      {
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      }
      )
      .then((response) => {
        const completeRecords = response.data
          // .filter((record) => {
          //   // Check if required fields are not empty
          //   const isCompleted = record.temperature || record.bloodPressure || record.pulseRate ||
          //     record.respirationRate || record.height || record.weight || record.bodyBuilt ||
          //     record.visualAcuity || record.abnormalFindings || Object.values(record.abnormalFindings).every(
          //       finding => finding.hasOwnProperty('remarks') || finding.hasOwnProperty('skin')
          //     );
  
          //   // You could also check that `LMP` is not null
          //   return isCompleted || record.LMP;
          // })
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
  
        setPEStudent(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the physical exam student records!", error);
      });
  };
  

  const fetchVaccine = () => {
    const date = new Date();
    axios
      .get("https://cmrms-full.onrender.com/api/vaccines",
      {
        headers: {
          "x-api-key":process.env.API_KEY,
        },
      }
      )
      .then((response) => {
        const completeRecords = response.data
          // .filter((record) => {
          //   // Ensure dateAdministered exists and is a valid date, and match by date (ignoring time)
          //   const recordDate = new Date(record.dateAdministered);
          //   const filterDate = new Date(date);
  
          //   // Normalize both dates to midnight (ignoring time)
          //   recordDate.setHours(0, 0, 0, 0);
          //   filterDate.setHours(0, 0, 0, 0);
  
          //   return recordDate.getTime() === filterDate.getTime();
          // })
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
  
          setVaccine(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the vaccine records!", error);
      });
  };
  

  useEffect(() => {
    const getUniqueMonths = (records, dateField) => {
      return [...new Set(records.map(record => {
        const date = new Date(record[dateField]);
        return date.toLocaleString("default", { month: "long", year: "numeric" });
      }))];
    };
  
    let allMonths = [];
  
    // Extract unique months from labRecords if available
    if (labRecords.length > 0) {
      const labMonths = getUniqueMonths(labRecords, 'isCreatedAt');
      allMonths = [...allMonths, ...labMonths];
    }
  
    // Extract unique months from clinicalRecords if available
    if (clinicalRecords.length > 0) {
      const clinicalMonths = getUniqueMonths(clinicalRecords, 'isCreatedAt');
      allMonths = [...allMonths, ...clinicalMonths];
    }
  
    // Extract unique months from peStudent if available
    if (peStudent.length > 0) {
      const peMonths = getUniqueMonths(peStudent, 'isCreatedAt');
      allMonths = [...allMonths, ...peMonths];
    }
  
    // Extract unique months from vaccine if available
    if (vaccine.length > 0) {
      const vaccineMonths = getUniqueMonths(vaccine, 'dateAdministered');
      allMonths = [...allMonths, ...vaccineMonths];
    }
  
    // Remove duplicate months
    const uniqueMonths = [...new Set(allMonths)];
  
    // Set the available months state
    setAvailableMonths(uniqueMonths);
  }, [labRecords, clinicalRecords, peStudent, vaccine]); // Add all dependencies
  

  const handleCloseDateSelectionModal = () => {
    setFromMonthYear("");
    setToMonthYear("");
    setIsReportModalOpen(false); 
    setIsMonthDateModalOpen(false);
  };

  const handleGenerate = () => {
    setIsMonthDateModalOpen(false);
  };

  const [isMedicalClinicCensusOpen, setIsMedicalClinicCensus] = useState(false);

  const handleOpenMedicalClinicCensus = (patient) => {
    setIsMedicalClinicCensus(true);
  };

  const handleCloseMedicalClinicCensus = () => {
    setIsMedicalClinicCensus(false); // Close the modal
    setFromMonthYear("");
    setToMonthYear("");
    handleCloseDateSelectionModal();

  };


  return (
    <div>
      <Navbar />

      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        {message && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
            {message}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredPatients.length}
            </span>{" "}
            patients
          </p>

          <div className="flex items-center space-x-4">
            {/* Course Dropdown */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-2 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none"
            >
              <option value="">All Department</option>
              <option value="UB-ELEM">UB-ELEM</option>
              <option value="SHS">SHS</option>
              <option value="SOD">SOD</option>
              <option value="SNS">SNS</option>
              <option value="SIHTM">SIHTM</option>
              <option value="SCJPS">SCJPS</option>
              <option value="SEA">SEA</option>
              <option value="STELA">STELA</option>
              <option value="SOL">SOL</option>
              <option value="SIT">SIT</option>
              <option value="SBAA">SBAA</option>
              <option value="SON">SON</option>
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none"
            >
              <option value="">All Years</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>

            {/* Position Dropdown */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-2 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none"
              >
              <option value="">All Positions</option>
              {positions.map((position, index) => (
                <option key={index} value={position}>
                  {position}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none w-72"
              />
              <BiSearch
                className="absolute right-2 top-2 text-gray-400"
                size={24}
              />
            </div>
            {role === "nurse" ? (
                <button
                  onClick={handleModalOpen}
                  className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
                >
                  Add Patient
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <button
                    onClick={handleOpenReportModal}
                    className="text-gray-600 font-medium flex items-center space-x-2 focus:outline-none"
                  >
                    <span>Generate Report</span>
                  </button>
                </div>
              )
            }

          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/4">Basic Info</th>
                    <th className="py-3 w-1/4">Birthday</th>
                    <th className="py-3 w-1/4">ID Number</th>
                    <th className="py-3 w-1/4">Department/ Position</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient, index) => (
                      <tr
                        key={patient._id}
                        className="border-b cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/patientslist/${patient._id}`)
                        }
                      >
                        <td className="py-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold">
                                {patient.lastname}, {patient.firstname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {new Date(patient.birthdate).toLocaleDateString()}
                        </td>
                        <td className="py-4">{patient.idnumber}</td>
                        <td className="py-4">
                          {patient.patientType === "Employee"
                            ? patient.position
                            : `${patient.course} - ${patient.year}`}
                        </td>
                        <td className="py-4">
                          <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current[index] = el)}
                          >
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the row click event from firing
                                toggleDropdown(index);
                              }}
                            >
                              <BsThreeDots size={20} />
                            </button>
                            {dropdownIndex === index && (
                              <div className="absolute right-0 w-40 bg-white rounded-md shadow-lg border z-10">
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleEditPatient(patient._id); // Pass the patient ID to the edit handler
                                  }}
                                >
                                  <AiOutlineEdit className="mr-2" /> Edit
                                  Patient
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleDeleteClick(patient._id);
                                  }}
                                >
                                  <AiOutlineDelete className="mr-2" /> Delete
                                  Patient
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                Page <span className="text-custom-red">{currentPage}</span> of{" "}
                {totalPages}
              </div>
              <div>
                <button
                  onClick={paginatePrev}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 mr-2 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-300"
                      : "bg-custom-red text-white hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={paginateNext}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-gray-300"
                      : "bg-custom-red text-white hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex justify-center">
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">&#9432;</span> Whole patient list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Patients
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this account?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding a new patient */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 px-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-semibold mb-4">
              {patientToEdit ? "Edit Patient" : "Add Patient"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Patient Type Dropdown */}
              <div className="col-span-3">
                <label className="block mb-2">Patient Type</label>
                <select
                  value={patientType}
                  onChange={(e) => setPatientType(e.target.value)}
                  className="px-4 py-2 border rounded w-full"
                  required
                >
                  <option value="">Select Patient Type</option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="OPD">Outpatient (OPD)</option>
                </select>
              </div>

              {patientType === "Student" && (
                <div className="grid grid-cols-3 gap-4">
                  {/* Full Name Fields - Display only for Student */}
                  <div className="col-span-3">
                    <label className="block mb-2">Full Name</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                      <input
                        type="text"
                        value={middlename}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="col-span-2">
                    <label className="block mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block mb-2">Sex</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* ID Number and Course/Year Side by Side */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* ID Number */}
                    <div>
                      <label className="block mb-2">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number"
                        value={idnumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    {/* Course and Year */}
                    <div>
                      <label className="block mb-2">Course and Year</label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Course Dropdown */}
                        <select
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="px-4 py-2 border rounded w-full"
                        >
                          <option value="" disabled>
                            Select Course
                          </option>
                          <option value="UB-ELEM">UB-ELEM</option>
                          <option value="SHS">SHS</option>
                          <option value="SOD">SOD</option>
                          <option value="SNS">SNS</option>
                          <option value="SIHTM">SIHTM</option>
                          <option value="SCJPS">SCJPS</option>
                          <option value="SEA">SEA</option>
                          <option value="STELA">STELA</option>
                          <option value="SOL">SOL</option>
                          <option value="SIT">SIT</option>
                          <option value="SBAA">SBAA</option>
                          <option value="SON">SON</option>
                        </select>

                        {/* Year Dropdown */}
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="px-4 py-2 border rounded w-full"
                        >
                          <option value="" disabled>
                            Select Year Level
                          </option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                          {/* Add more year levels if needed */}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* Address */}
                    <div>
                      <label className="block mb-2">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    {/* Blood Type */}
                    <div>
                      <label className="block mb-2">Blood Type</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      >
                        <option value="" disabled>
                          Select Blood Type
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number, Email, and Emergency Contact */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phonenumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">E-mail Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {patientType === "Employee" && (
                <div className="grid grid-cols-3 gap-4">
                  {/* Full Name Fields - Display only for Student */}
                  <div className="col-span-3">
                    <label className="block mb-2">Full Name</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                      <input
                        type="text"
                        value={middlename}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="col-span-2">
                    <label className="block mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block mb-2">Sex</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* ID Number and Course/Year Side by Side */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* ID Number */}
                    <div>
                      <label className="block mb-2">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number"
                        value={idnumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    {/* Position/ Department */}
                    <div>
                      <label className="block mb-2">Position Department</label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Enter Position/ Department"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* Address */}
                    <div>
                      <label className="block mb-2">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    {/* Blood Type */}
                    <div>
                      <label className="block mb-2">Blood Type</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      >
                        <option value="" disabled>
                          Select Blood Type
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number, Email, and Emergency Contact */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phonenumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2">E-mail Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              {patientType === "OPD" && (
                <div className="grid grid-cols-3 gap-4">
                  {/* Full Name Fields - Display only for Student */}
                  <div className="col-span-3">
                    <label className="block mb-2">Full Name</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                      <input
                        type="text"
                        value={middlename}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="col-span-2">
                    <label className="block mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block mb-2">Sex</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="px-4 py-2 border rounded w-full"
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* Address */}
                    <div>
                      <label className="block mb-2">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    {/* Blood Type */}
                    <div>
                      <label className="block mb-2">Blood Type</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      >
                        <option value="" disabled>
                          Select Blood Type
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number and Email */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phonenumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">E-mail Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit/Cancel Buttons */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleModalClose}
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
                >
                  Cancel
                </button>
                {patientToEdit ? (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-custom-red text-white rounded-lg"
                  >
                    Update Patient
                  </button>
                ) : (
                  <button
                    onClick={handleMedicalOpen}
                    className="px-4 py-2 bg-custom-red text-white rounded-lg"
                  >
                    Add History
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isMedicalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
            <h1 className="text-2xl font-semibold text-center mb-6">
              Medical History Form
            </h1>

            {/* Conditions Section */}
            <div className="mt-6">
              <label className="block text-sm font-semibold">
                Has any of the applicant suffered from, or been told he had any
                of the following conditions:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.noseThroatDisorders}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "conditions",
                        "noseThroatDisorders",
                        e
                      )
                    }
                  />
                  1. Nose or throat disorders
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.hernia}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "hernia", e)
                    }
                  />{" "}
                  14. Hernia
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.earTrouble}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "earTrouble", e)
                    }
                  />{" "}
                  2. Ear trouble / deafness
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.rheumatismJointPain}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "conditions",
                        "rheumatismJointPain",
                        e
                      )
                    }
                  />{" "}
                  15. Rheumatism, joint or back pain
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.asthma}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "asthma", e)
                    }
                  />{" "}
                  3. Asthma
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.eyeDisorders}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "eyeDisorders", e)
                    }
                  />{" "}
                  16. Eye disorders
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.tuberculosis}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "tuberculosis", e)
                    }
                  />{" "}
                  4. Tuberculosis
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.stomachPainUlcer}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "stomachPainUlcer", e)
                    }
                  />{" "}
                  17. Stomach pain / ulcer
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.lungDiseases}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "lungDiseases", e)
                    }
                  />{" "}
                  5. Other lung diseases
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.abdominalDisorders}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "conditions",
                        "abdominalDisorders",
                        e
                      )
                    }
                  />{" "}
                  18. Other abdominal disorders
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.highBloodPressure}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "highBloodPressure", e)
                    }
                  />{" "}
                  6. High Blood Pressure
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.kidneyBladderDiseases}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "conditions",
                        "kidneyBladderDiseases",
                        e
                      )
                    }
                  />{" "}
                  19. Kidney or bladder diseases
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.heartDiseases}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "heartDiseases", e)
                    }
                  />{" "}
                  7. Heart diseases
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.std}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "std", e)
                    }
                  />{" "}
                  20. Sexually Transmitted Disease
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.rheumaticFever}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "rheumaticFever", e)
                    }
                  />{" "}
                  8. Rheumatic Fever
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.familialDisorder}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "familialDisorder", e)
                    }
                  />{" "}
                  21. Genetic or Familial disorder
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.diabetesMellitus}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "diabetesMellitus", e)
                    }
                  />{" "}
                  9. Diabetes Mellitus
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.tropicalDiseases}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "tropicalDiseases", e)
                    }
                  />{" "}
                  22. Tropical Diseases
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.endocrineDisorder}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "endocrineDisorder", e)
                    }
                  />{" "}
                  10. Endocrine Disorder
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.chronicCough}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "chronicCough", e)
                    }
                  />{" "}
                  23. Chronic cough
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.cancerTumor}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "cancerTumor", e)
                    }
                  />{" "}
                  11. Cancer / Tumor
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.faintingSeizures}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "faintingSeizures", e)
                    }
                  />{" "}
                  24. Fainting spells, fits or seizures
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.mentalDisorder}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "mentalDisorder", e)
                    }
                  />{" "}
                  12. Mental Disorder / Depression
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.frequentHeadache}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "frequentHeadache", e)
                    }
                  />{" "}
                  25. Frequent headache
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.headNeckInjury}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "headNeckInjury", e)
                    }
                  />{" "}
                  13. Head or neck injury
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.conditions.dizziness}
                    onChange={(e) =>
                      handleCheckboxChange("conditions", "dizziness", e)
                    }
                  />{" "}
                  26. Dizziness
                </label>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">Do you have Malaria?</p>
                <div className="flex space-x-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      name="hasMalaria"
                      className="mr-2"
                      value="Yes" // Set the value to "Yes"
                      checked={medicalHistory.malaria.hasMalaria === "Yes"} // Check if the value is "Yes"
                      onChange={(e) =>
                        handleHistoryRadioChange("malaria", "hasMalaria", e)
                      } // Pass the entire event object
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="hasMalaria"
                      className="mr-2"
                      value="No" // Set the value to "No"
                      checked={medicalHistory.malaria.hasMalaria === "No"} // Check if the value is "No"
                      onChange={(e) =>
                        handleHistoryRadioChange("malaria", "hasMalaria", e)
                      } // Pass the entire event object
                    />
                    No
                  </label>
                </div>
                <textarea
                  placeholder="Please date the last attack."
                  className="textarea mt-2 border rounded-md p-2 w-full col-span-3"
                  value={medicalHistory.malaria.lastAttackDate}
                  onChange={(e) =>
                    handleHistoryInputChange(
                      "malaria",
                      "lastAttackDate",
                      e.target.value
                    )
                  }
                ></textarea>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">
                  Have you undergo any operations?
                </p>
                <div className="flex space-x-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      name="undergoneOperation"
                      className="mr-2"
                      value="Yes" // Set the value to "Yes"
                      checked={
                        medicalHistory.operations.undergoneOperation === "Yes"
                      }
                      onChange={(e) =>
                        handleHistoryRadioChange(
                          "operations",
                          "undergoneOperation",
                          e
                        )
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="undergoneOperation"
                      className="mr-2"
                      value="No" // Set the value to "Yes"
                      checked={
                        medicalHistory.operations.undergoneOperation === "No"
                      }
                      onChange={(e) =>
                        handleHistoryRadioChange(
                          "operations",
                          "undergoneOperation",
                          e
                        )
                      }
                    />
                    No
                  </label>
                </div>
                <textarea
                  placeholder="Please list them."
                  className="textarea mt-2 border rounded-md p-2 w-full col-span-3"
                  value={medicalHistory.operations.listOperations}
                  onChange={(e) =>
                    handleHistoryInputChange(
                      "operations",
                      "listOperations",
                      e.target.value
                    )
                  }
                ></textarea>
              </div>

              
            </div>
            {/* Conditions Section */}
            <div className="mt-6">
              <h2 className="font-semibold">I. Family History</h2>
              <label className="block text-sm font-semibold">
                Has any of the applicant's family members (maternal and
                paternal) had any of the following diseases:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.heartDisease} // Ensure it's never undefined
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "heartDisease",
                        e
                      )
                    }
                  />
                  1. Heart Disease
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.hypertension}
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "hypertension",
                        e
                      )
                    }
                  />{" "}
                  5. Hypertension
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.tuberculosis}
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "tuberculosis",
                        e
                      )
                    }
                  />{" "}
                  2. Tuberculosis
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.diabetes}
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "diabetes",
                        e
                      )
                    }
                  />{" "}
                  6. Diabetes
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={
                      medicalHistory.familyHistory.diseases.kidneyDisease
                    }
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "kidneyDisease",
                        e
                      )
                    }
                  />{" "}
                  3. Kidney Disease (UTI, Etc.)
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.cancer}
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "cancer",
                        e
                      )
                    }
                  />{" "}
                  7. Cancer
                </label>
                <label>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={medicalHistory.familyHistory.diseases.asthma}
                    onChange={(e) =>
                      handleCheckboxFamChange(
                        "familyHistory",
                        "diseases",
                        "asthma",
                        e
                      )
                    }
                  />{" "}
                  4. Asthma
                </label>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">
                  Do you have any medication allergies?
                </p>
                <div className="flex space-x-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      name="allergies"
                      className="mr-2"
                      value="Yes" // Set the value to "Yes"
                      checked={
                        medicalHistory.familyHistory.allergies.hasAllergies ===
                        "Yes"
                      } // Check if the value is "Yes"
                      onChange={(e) =>
                        handleHistoryFamRadioChange(
                          "familyHistory",
                          "allergies",
                          "hasAllergies",
                          e
                        )
                      } // Pass the entire event object
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allergies"
                      className="mr-2"
                      value="No" // Set the value to "No"
                      checked={
                        medicalHistory.familyHistory.allergies.hasAllergies ===
                        "No"
                      } // Check if the value is "No"
                      onChange={(e) =>
                        handleHistoryFamRadioChange(
                          "familyHistory",
                          "allergies",
                          "hasAllergies",
                          e
                        )
                      } // Pass the entire event object
                    />
                    No
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="allergies"
                      className="mr-2"
                      value="Not Sure" // Set the value to "Not Sure"
                      checked={
                        medicalHistory.familyHistory.allergies.hasAllergies ===
                        "Not Sure"
                      } // Check if the value is "Not Sure"
                      onChange={(e) =>
                        handleHistoryFamRadioChange(
                          "familyHistory",
                          "allergies",
                          "hasAllergies",
                          e
                        )
                      } // Pass the entire event object
                    />
                    Not Sure
                  </label>
                </div>
                <textarea
                  placeholder="Please list them."
                  className="textarea mt-2 border rounded-md p-2 w-full col-span-3"
                  value={medicalHistory.familyHistory.allergies.allergyList}
                  onChange={(e) =>
                    handleHistoryFamInputChange(
                      "familyHistory",
                      "allergies",
                      "allergyList",
                      e.target.value
                    )
                  }
                ></textarea>
              </div>
            </div>

            {/* Tobacco Usage Section */}
            <div className="mt-6">
              <h2 className="font-semibold">II. Personal History</h2>
              <div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-semibold text-gray-700 w-1/2">
                    Do you use any kind of tobacco or have you ever used them?
                  </label>

                  <select
                    className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                    value={
                      medicalHistory.personalHistory.tobaccoUse.usesTobacco ||
                      ""
                    } // Preload value
                    onChange={(e) =>
                      handleTobaccoChange("usesTobacco", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      A. Sticks per day:
                    </label>
                    <input
                      type="number"
                      placeholder="Enter number"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.tobaccoUse
                          .sticksPerDay || ""
                      } // Preload value
                      onChange={(e) =>
                        handleTobaccoChange("sticksPerDay", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      B. Quit smoking?
                    </label>
                    <select
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.tobaccoUse.quitSmoking ||
                        ""
                      } // Preload value
                      onChange={(e) =>
                        handleTobaccoChange("quitSmoking", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      C. When?
                    </label>
                    <input
                      type="date"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.tobaccoUse.quitWhen || ""
                      } // Preload value
                      onChange={(e) =>
                        handleTobaccoChange("quitWhen", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-4 mt-6">
                  <label className="text-sm font-semibold text-gray-700 w-1/2">
                    Do you drink alcoholic beverages?
                  </label>

                  <select
                    className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                    value={
                      medicalHistory.personalHistory.alcoholUse.drinksAlcohol ||
                      ""
                    } // Preload value
                    onChange={(e) =>
                      handleAlcoholChange("drinksAlcohol", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      A. Amount per day?
                    </label>
                    <input
                      type="text"
                      placeholder="Enter amount"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.alcoholUse
                          .drinksPerDay || ""
                      } // Preload value
                      onChange={(e) =>
                        handleAlcoholChange("drinksPerDay", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      B. Quit drinking?
                    </label>
                    <select
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.alcoholUse
                          .quitDrinking || ""
                      } // Preload value
                      onChange={(e) =>
                        handleAlcoholChange("quitDrinking", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      C. When?
                    </label>
                    <input
                      type="date"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.alcoholUse.quitWhen || ""
                      } // Preload value
                      onChange={(e) =>
                        handleAlcoholChange("quitWhen", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-4 mt-6">
                  <label className="text-sm font-semibold text-gray-700 w-1/2">
                    For Women
                  </label>

                  <label className="w-1/2"></label>
                </div>
                <div className="flex items-center space-x-4 mt-6">
                  <label className="text-sm font-medium text-gray-700 w-1/2">
                    A. Pregnant?
                  </label>

                  <select
                    className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                    value={
                      medicalHistory.personalHistory.forWomen.pregnant || ""
                    } // Preload data
                    onChange={(e) =>
                      handleWomenHealthChange("pregnant", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      B. Month
                    </label>
                    <input
                      type="date"
                      placeholder="Enter amount"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.forWomen.months || ""
                      } // Preload data
                      onChange={(e) =>
                        handleWomenHealthChange("months", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      C. Last Menstrual Period
                    </label>
                    <input
                      type="date"
                      placeholder="Enter amount"
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.forWomen
                          .lastMenstrualPeriod || ""
                      } // Preload data
                      onChange={(e) =>
                        handleWomenHealthChange(
                          "lastMenstrualPeriod",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      D. Abortion/ Miscarriage?
                    </label>
                    <select
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.forWomen
                          .abortionOrMiscarriage || ""
                      } // Preload data
                      onChange={(e) =>
                        handleWomenHealthChange(
                          "abortionOrMiscarriage",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Abortion">Abortion</option>
                      <option value="Miscarriage">Miscarriage</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 mt-6">
                    <label className="text-sm font-medium text-gray-700 w-1/2">
                      E. Dysmenorrhea?
                    </label>

                    <select
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                      value={
                        medicalHistory.personalHistory.forWomen.dysmenorrhea ||
                        ""
                      } // Preload data
                      onChange={(e) =>
                        handleWomenHealthChange("dysmenorrhea", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={handleMedicalClose}
              >
                Close
              </button>
              {role === "nurse" && (
                <div>
                  <button
                    onClick={handleAddPatient}
                    className="px-4 py-2 bg-custom-red text-white rounded-lg"
                  >
                    Add Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

{isMonthDateModalOpen && clinicalRecords && peStudent && vaccine && labRecords && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
              
              <div className="mb-4">
                <label htmlFor="fromMonthYear" className="block text-sm font-medium text-gray-700">From:</label>
                <select
                  id="fromMonthYear"
                  value={fromMonthYear}
                  onChange={(e) => setFromMonthYear(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Month</option>
                  {availableMonths.map((monthYear) => (
                    <option key={monthYear} value={monthYear}>
                      {monthYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="toMonthYear" className="block text-sm font-medium text-gray-700">To:</label>
                <select
                  id="toMonthYear"
                  value={toMonthYear}
                  onChange={(e) => setToMonthYear(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Month</option>
                  {availableMonths.map((monthYear) => (
                    <option key={monthYear} value={monthYear}>
                      {monthYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleCloseDateSelectionModal}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleOpenMedicalClinicCensus(fromMonthYear, toMonthYear, clinicalRecords, peStudent, vaccine, labRecords)}                  
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"                
                >
                  Generate Report
                </button>
              </div>
              <MedicalClinicCensus isOpen={isMedicalClinicCensusOpen} onClose={handleCloseMedicalClinicCensus} fromMonthYear={fromMonthYear} toMonthYear={toMonthYear} clinicalRecords={clinicalRecords} peStudent={peStudent} vaccine={vaccine} labRecords={labRecords} />
            </div>
          </div>
        )}



    </div>
  );
}

export default Patients;
