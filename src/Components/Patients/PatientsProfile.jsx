import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { FaXRay } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { GiBiceps } from "react-icons/gi";
import { BiChevronDown } from "react-icons/bi";

function PatientsProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [selectedTab, setSelectedTab] = useState("clinical");
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [showPackageOptions, setShowPackageOptions] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isHematologyVisible, setHematologyVisible] = useState(false);
  const [isClinicalMicroscopyVisible, setClinicalMicroscopyVisible] =
    useState(false);
  const [isSerologyVisible, setSerologyVisible] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] =
    useState(false);
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);
  const [newTherapyRecord, setNewTherapyRecord] = useState({
    date: new Date().toLocaleDateString(),
    Diagnosis: "",
    Precautions: "",
    SOAPSummary: "",
  });
  const [newRecord, setNewRecord] = useState({
    date: new Date().toLocaleDateString(),
    complaints: "",
    treatments: "",
    emergencyTreatments: "",
    diagnosis: "",
  });
  const [laboratoryRecords, setLaboratoryRecords] = useState([]);
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [xrayRecords, setXrayRecords] = useState([]);
  const [isNewXrayModalOpen, setIsNewXrayModalOpen] = useState(false);
  const [newXrayRecord, setNewXrayRecord] = useState({
    date: new Date().toLocaleDateString(),
    xrayResult: "",
    xrayType: "",
    xrayDescription: "",
  });
  const [role, setRole] = useState(null); // Store the user role
  // Inside your component definition
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [showEmergencyTreatmentInput, setShowEmergencyTreatmentInput] =
    useState(false);
  const [clinicId, setClinicId] = useState(null); // Added state for clinicId
  const [medicalRecords, setMedicalRecords] = useState([]);

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole); // Store the role in state
    }
  }, []);

  const fetchLabRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/laboratory/${id}`
      );
      const sortedLabRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setLaboratoryRecords(sortedLabRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the laboratory records!",
        error
      );
    }
  }, [id]);

  const fetchXrayRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/xrayResults/${id}`
      );
      const sortedXrayRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setXrayRecords(sortedXrayRecords);
      console.log("Fetched X-ray Records:", sortedXrayRecords);
    } catch (error) {
      console.error("There was an error fetching the X-ray records!", error);
    }
  }, [id]);

  const fetchClinicalRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/clinicalRecords/${id}`
      );
      const sortedClinicalRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setClinicalRecords(sortedClinicalRecords);
    } catch (error) {
      console.error("There was an error fetching the clinical records!", error);
    }
  }, [id]);

  //Fetch Physical Therapy Records
  const fetchPhysicalTherapyRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/physicalTherapy/${id}`
      );
      const sortedPhysicalTherapyRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setPhysicalTherapyRecords(sortedPhysicalTherapyRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the Physical Therapy records!",
        error
      );
    }
  }, [id]);

  const fetchMedicalRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/medical-history/${id}`
      );
      const sortedMedicalRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setMedicalRecords(sortedMedicalRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the Medical records!",
        error
      );
    }
  }, [id]);

 useEffect(() => {
    fetchLabRecords();
    fetchXrayRecords();
    fetchClinicalRecords();
    fetchPhysicalTherapyRecords();
    fetchMedicalRecords();
    const fetchPatient = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/patients/${id}`
        );
        setPatient(response.data);
      } catch (error) {
        console.error(
          "There was an error fetching the patient details!",
          error
        );
      }
    };
    fetchPatient();
  }, [
    id,
    fetchLabRecords,
    fetchXrayRecords,
    fetchClinicalRecords,
    fetchPhysicalTherapyRecords,
    fetchMedicalRecords,
  ]);

  const handleNewTherapyRecordOpen = () => {
    setIsNewTherapyRecordModalOpen(true);
  };

  const handleNewTherapyRecordClose = () => {
    setIsNewTherapyRecordModalOpen(false);
  };

  const handleNewTherapyRecordChange = (e) => {
    const { name, value } = e.target;
    setNewTherapyRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewTherapySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/physicalTherapy", // Fix the spelling here
        {
          ...newTherapyRecord,
          patient: id,
        }
      );
      if (response.status === 200) {
        handleNewTherapyRecordClose();
        fetchPhysicalTherapyRecords();
        setNewTherapyRecord({
          SOAPSummary: "",
          Diagnosis: "",
          Precautions: "",
        });
      }
    } catch (error) {
      console.error("Error adding new record:", error.response || error);
    }
  };

  
  const handleNewRecordOpen = () => {
    setIsNewRecordModalOpen(true);
  };

  // Close the new record modal and reset form state
  const handleNewRecordClose = () => {
    setIsNewRecordModalOpen(false);
    setShowEmergencyTreatmentInput(false);
    setNewRecord({
      date: new Date().toLocaleDateString(),
      complaints: "",
      treatments: "",
      emergencyTreatments: "",
      diagnosis: "",
    });
  };

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewRecordSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId"); // Get the logged-in user's ID

    // Combine the regular treatments and the emergency treatment
    const updatedRecord = {
      ...newRecord,
      patient: id,
      createdBy: userId, // Add the logged-in user's ID as createdBy
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/clinicalRecords",
        updatedRecord
      );

      if (response.status === 200) {
        handleNewRecordClose();
        await fetchClinicalRecords();
      }
    } catch (error) {
      console.error("Error adding new record:", error.response || error);
    }
  };

  const handleNewXraySubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...newXrayRecord,
        patient: id,
        xrayResult: "pending",
      };

      // Include clinicId if available
      if (clinicId) {
        dataToSend.clinicId = clinicId; // Add clinicId to the data
      }

      const response = await axios.post(
        "http://localhost:3001/api/xrayResults",
        dataToSend
      );

      if (response.data.success) {
        console.log("X-ray submitted successfully:", response.data);
        setNewXrayRecord({}); // Reset form data
        handleNewXrayModalClose(); // Close the modal
        fetchXrayRecords(); // Refresh the main X-ray records list

        // Refresh X-ray records in the view modal for the specific record
        const updatedXrayRecords = await axios.get(
          `http://localhost:3001/api/xrayResults?clinicId=${clinicId}`
        );
        setSelectedXrayRecords(updatedXrayRecords.data);
      } else {
        console.error("Error submitting X-ray form:", response.data);
      }
    } catch (error) {
      console.error(
        "An error occurred while submitting the X-ray form:",
        error
      );
    } finally {
      setClinicId(null); // Clear clinicId explicitly
    }
  };

  const handleNewXrayChange = (e) => {
    const { name, value } = e.target;
    setNewXrayRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewXrayModalOpen = (record) => {
    setClinicId(record._id);
    setIsNewXrayModalOpen(true);
  };

  const handleNewXrayModalClose = () => {
    setIsNewXrayModalOpen(false);
  };

  const requestDropdownRef = useRef(null); // For showRequestOptions dropdown
  const packageDropdownRef = useRef(null); // For showPackageOptions dropdown

  // Hook for handling outside click for showRequestOptions
  useEffect(() => {
    const handleClickOutsideRequest = (event) => {
      if (
        showRequestOptions &&
        requestDropdownRef.current &&
        !requestDropdownRef.current.contains(event.target)
      ) {
        setShowRequestOptions(false);
      }
    };

    if (showRequestOptions) {
      document.addEventListener("mousedown", handleClickOutsideRequest);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideRequest);
    };
  }, [showRequestOptions]);

  // Hook for handling outside click for showPackageOptions
  useEffect(() => {
    const handleClickOutsidePackage = (event) => {
      if (
        showPackageOptions &&
        packageDropdownRef.current &&
        !packageDropdownRef.current.contains(event.target)
      ) {
        setShowPackageOptions(false);
      }
    };

    if (showPackageOptions) {
      document.addEventListener("mousedown", handleClickOutsidePackage);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsidePackage);
    };
  }, [showPackageOptions]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleMakeRequest = () => {
    setShowRequestOptions((prev) => !prev);
  };

  const handleAddPackage = () => {
    setShowPackageOptions((prev) => !prev);
  };

  const handleLabModalOpen = (record) => {
    setIsLabModalOpen(true);
    setClinicId(record._id);
  };

  const handleModalClose = () => {
    setIsLabModalOpen(false);
  };

  const displayedRecords =
    selectedTab === "clinical"
      ? clinicalRecords
      : selectedTab === "laboratory"
      ? laboratoryRecords
      : selectedTab === "xray"
      ? xrayRecords
      : selectedTab === "physical therapy"
      ? physicalTherapyRecords
      : [];

  const initialFormData = {
    bloodChemistry: {
      bloodSugar: "",
      bloodUreaNitrogen: "",
      bloodUricAcid: "",
      creatinine: "",
      SGOT_AST: "",
      SGPT_ALT: "",
      totalCholesterol: "",
      triglyceride: "",
      HDL_cholesterol: "",
      LDL_cholesterol: "",
    },
    hematology: {
      bleedingTimeClottingTime: "",
      completeBloodCount: "",
      hematocritAndHemoglobin: "",
    },
    clinicalMicroscopyParasitology: {
      routineUrinalysis: "",
      routineStoolExamination: "",
      katoThickSmear: "",
      fecalOccultBloodTest: "",
    },
    bloodBankingSerology: {
      antiTreponemaPallidum: "",
      antiHCV: "",
      bloodTyping: "",
      hepatitisBSurfaceAntigen: "",
      pregnancyTest: "",
      dengueTest: "",
      HIVRapidTest: "",
      HIVElsa: "",
      testForSalmonellaTyphi: "",
    },
    microbiology: {
      gramsStain: "",
      KOH: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (section, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: prevData[section][field] === "" ? field : "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        patient: id,
        labResult: "pending",
      };

      // Include clinicId if available
      if (clinicId) {
        dataToSend.clinicId = clinicId; // Add clinicId if it exists
      }

      const result = await axios.post(
        "http://localhost:3001/api/laboratory",
        dataToSend
      );

      if (result.data.message === "Laboratory request created successfully") {
        console.log("Form submitted successfully:", result.data);
        setFormData(initialFormData); // Reset form data
        handleModalClose(); // Close the modal
        fetchLabRecords(); // Refresh lab records

        // Refresh lab tests in the view modal for the specific record
        const updatedLabTests = await axios.get(
          `http://localhost:3001/api/laboratory?clinicId=${clinicId}`
        );
        setSelectedLabTests(updatedLabTests.data);
      } else {
        console.error("Error submitting form:", result.data);
      }
    } catch (err) {
      console.error("An error occurred while submitting the form:", err);
    } finally {
      setClinicId(null); // Clear clinicId explicitly
    }
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred this year yet
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedXrayRecords, setSelectedXrayRecords] = useState([]);

  const handleViewRecord = async (record) => {
    setSelectedRecord(record);
    setClinicId(record._id);

    try {
      const labResponse = await axios.get(
        `http://localhost:3001/api/laboratory?clinicId=${record._id}`
      );
      const labTests = labResponse.data;
      setSelectedLabTests(labTests);

      // Fetch X-ray records for the specific clinic
      const xrayResponse = await axios.get(
        `http://localhost:3001/api/xrayResults?clinicId=${record._id}`
      );
      const xrayRecords = xrayResponse.data;
      setSelectedXrayRecords(xrayRecords);
    } catch (error) {
      console.error(
        "Error fetching lab or X-ray records for the clinical record:",
        error
      );
    }

    setIsViewModalOpen(true);
  };

  const updateClinicalRecord = async (selectedRecord) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/clinicalRecords/${selectedRecord._id}`,
        selectedRecord
      );
      if (response.status === 200) {
        setIsViewModalOpen(false);
        fetchClinicalRecords();
      }
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const [showHistoryOptions, setShowHistoryOptions] = useState(false);
  const historyDropdownRef = useRef(null);

  const handleAddHistory = () => {
    setShowHistoryOptions((prev) => !prev);
  };

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

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  const handleMedicalOpen = () => {
    setIsMedicalModalOpen(true);
    setShowHistoryOptions(false);
  };

  const handleMedicalClose = () => {
    setIsMedicalModalOpen(false);
  };

  const [isFamilyPersonalModalOpen, setisFamilyPersonalModalOpen] =
    useState(false);

  const handleFamilyPersonalOpen = () => {
    setisFamilyPersonalModalOpen(true);
    setShowHistoryOptions(false);
  };

  const handleFamilyClose = () => {
    setisFamilyPersonalModalOpen(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({
    bloodChemistry: [],
    hematology: [],
    clinicalMicroscopyParasitology: [],
    bloodBankingSerology: [],
    microbiology: [],
  });

  const [packages, setPackages] = useState([]);
  const [packageClickCount, setPackageClickCount] = useState(0);

  const handlePackageClick = async (packageId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/packages/${packageId}`
      );
      const pkg = response.data;
      console.log("Selected package:", pkg);

      setSelectedPackage(pkg);
      setIsModalOpen(true);

      const {
        _id,
        isCreatedAt,
        xrayType,
        packageNumber,
        ...pkgWithoutIdAndCreatedAt
      } = pkg;

      // Calculate the updated package number based on the click count
      const updatedPackageNumber = packageNumber + packageClickCount + 1;

      // Create lab request with the updated package number
      const labResponse = await axios.post(
        "http://localhost:3001/api/laboratory",
        {
          ...pkgWithoutIdAndCreatedAt,
          patient: id,
          packageId: _id,
          packageNumber: updatedPackageNumber, // Use updated package number
          labResult: "pending",
        }
      );

      if (
        labResponse.data &&
        labResponse.data.message === "Laboratory request created successfully"
      ) {
        console.log(
          "Lab request created successfully:",
          labResponse.data.labRequest
        );
        fetchLabRecords();
      } else {
        console.error("Unexpected response structure:", labResponse.data);
      }

      // Check if package includes both Medical and Dental X-ray
      if (xrayType === "medical, dental") {
        // Send request for Medical X-ray with xrayDescription
        const medicalXrayResponse = await axios.post(
          "http://localhost:3001/api/xrayResults",
          {
            ...pkgWithoutIdAndCreatedAt,
            patient: id,
            packageId: _id,
            packageNumber: updatedPackageNumber, // Use updated package number
            xrayType: "medical",
            xrayDescription: pkgWithoutIdAndCreatedAt.xrayDescription,
            xrayResult: "pending",
          }
        );

        if (medicalXrayResponse.data && medicalXrayResponse.data.success) {
          console.log(
            "Medical X-ray request created successfully:",
            medicalXrayResponse.data
          );
        }

        // Send request for Dental X-ray with "Panoramic" description
        const dentalXrayResponse = await axios.post(
          "http://localhost:3001/api/xrayResults",
          {
            ...pkgWithoutIdAndCreatedAt,
            patient: id,
            packageId: _id,
            packageNumber: updatedPackageNumber, // Use updated package number
            xrayType: "dental",
            xrayDescription: "Panoramic",
            xrayResult: "pending",
          }
        );

        if (dentalXrayResponse.data && dentalXrayResponse.data.success) {
          console.log(
            "Dental X-ray request created successfully:",
            dentalXrayResponse.data
          );
        }
      } else {
        // Create a single X-ray request if only one type is present
        const xrayResponse = await axios.post(
          "http://localhost:3001/api/xrayResults",
          {
            ...pkgWithoutIdAndCreatedAt,
            patient: id,
            packageId: _id,
            packageNumber: updatedPackageNumber, // Use updated package number
            xrayType: xrayType,
            xrayDescription: pkgWithoutIdAndCreatedAt.xrayDescription || "",
            xrayResult: "pending",
          }
        );

        if (xrayResponse.data && xrayResponse.data.success) {
          console.log("X-ray request created successfully:", xrayResponse.data);
        }
      }

      // Increment the counter after the requests are processed
      setPackageClickCount((prevCount) => prevCount + 1);

      // Fetch the latest X-ray records after request(s) completion
      fetchXrayRecords();
    } catch (error) {
      console.error("Error fetching package or creating requests:", error);
      alert("Failed to fetch package or create requests. Please try again.");
    }
  };

  // Fetching packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/packages");
        setPackages(response.data); // Set the fetched packages to state
      } catch (error) {
        console.error("Error fetching packages:", error);
        alert("Failed to fetch packages. Please try again.");
      }
    };

    fetchPackages(); // Fetch packages when the component mounts
  }, []);

  // const renderLabTests = (testName, tests) => {
  //   // Check if tests is undefined, null, or not an array
  //   if (!tests || !Array.isArray(tests)) {
  //     return <p>No tests available for {testName}</p>; // Handle undefined cases
  //   }

  //   return (
  //     <div>
  //       <p className="font-semibold">{testName}</p>
  //       <ul className="list-disc list-inside">
  //         {tests.map((test, index) => (
  //           <li key={index}>{test}</li>
  //         ))}
  //       </ul>
  //     </div>
  //   );
  // };

  const combinedRecords = {};

  laboratoryRecords.forEach((record) => {
    const packageNumber = record.packageNumber;
    if (!combinedRecords[packageNumber]) {
      combinedRecords[packageNumber] = { labRecords: [], xrayRecords: [] };
    }
    combinedRecords[packageNumber].labRecords.push(record);
  });

  xrayRecords.forEach((record) => {
    const packageNumber = record.packageNumber;
    if (!combinedRecords[packageNumber]) {
      combinedRecords[packageNumber] = { labRecords: [], xrayRecords: [] };
    }
    combinedRecords[packageNumber].xrayRecords.push(record);
  });

  const [medicalHistory, setMedicalHistory] = useState({
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
      hasMalaria: null, // Radio buttons - Yes/No
      lastAttackDate: "", // Malaria attack details
    },
    operations: {
      undergoneOperation: null, // Radio buttons - Yes/No
      listOperations: "", // Details of operations
    },
    signature: {
      fileName: null,
      fileType: null,
      // fileSize: { type: Number, required: true, max: 5 * 1024 * 1024 }, // Max size 5MB
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
        hasAllergies: null, // Radio buttons - Yes/No/Not Sure
        allergyList: "", // List of allergies
      },
    },
    personalHistory: {
      tobaccoUse: {
        usesTobacco: null, // Radio buttons - Yes/No
        sticksPerDay: "", // Number of sticks per day
        quitSmoking: null, // Radio buttons - Yes/No
        quitWhen: "", // Reason for quitting
      },
      alcoholUse: {
        drinksAlcohol: null, // Radio buttons - Yes/No
        drinksPerDay: "",
        quitDrinking: null, // Radio buttons - Yes/No
        quitWhen: "",
      },
      forWomen: {
        pregnant: null, // Radio buttons - Yes/No
        months: "", // Number of months pregnant
        lastMenstrualPeriod: "", // Date of last menstrual period
        abortionOrMiscarriage: null, // Radio buttons - Abortion/Miscarriage
        dysmenorrhea: null, // Radio buttons - Yes/No
      },
    },
  });

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
    console.log("Changing value:", value); // Debugging line
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
    console.log("Changing value:", value); // Debugging line
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
    console.log("Changing value:", value); // Debugging line
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedicalHistory((prevData) => ({
      ...prevData,
      signature: {
        fileName: file.name,
        fileType: file.type,
      },
    }));
  };

  const initialMedicalHistory = {
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
    },
    forWomen: {
      pregnant: null,
      months: "",
      lastMenstrualPeriod: "",
      abortionOrMiscarriage: null,
      dysmenorrhea: null,
    },
  };

  const handleMedicalHistorySubmit = async () => {
    
    try {
      const response = await axios.post(
        `http://localhost:3001/api/medical-history`,{
          patient: id,
          ...medicalHistory,
        }
      );
      console.log('Medical history saved successfully:', response.data);
      if (response.status === 200) {
        handleMedicalClose();
        fetchMedicalRecords();
        setMedicalHistory({
          ...initialMedicalHistory,
        });
          
      }
    } catch (error) {
      console.error("Error adding medical history:", error);
    }
  };

 const medicalHistoryId = medicalRecords[0]?._id; // Get the medical history ID
   // Fetch the user data when the component is mounted
   useEffect(() => {
    if (medicalHistoryId) {
      axios
        .get(`http://localhost:3001/api/medical-history/${medicalHistoryId}`)
        .then((response) => {
          setMedicalHistory(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [medicalHistoryId]);
  
// Function to handle form submission and update the medical history
const handleUpdateSubmit = async () => {
  const updatedData = {
    familyHistory: {
      diseases: {
        heartDisease: medicalHistory.familyHistory.diseases.heartDisease,
        hypertension: medicalHistory.familyHistory.diseases.hypertension,
        tuberculosis: medicalHistory.familyHistory.diseases.tuberculosis,
        diabetes: medicalHistory.familyHistory.diseases.diabetes,
        kidneyDisease: medicalHistory.familyHistory.diseases.kidneyDisease,
        cancer: medicalHistory.familyHistory.diseases.cancer,
        asthma: medicalHistory.familyHistory.diseases.asthma,
      },
      allergies: {
        hasAllergies: medicalHistory.familyHistory.allergies.hasAllergies,
        allergyList: medicalHistory.familyHistory.allergies.allergyList,
      },
    },
    personalHistory: {
      tobaccoUse: {
        usesTobacco: medicalHistory.personalHistory.tobaccoUse.usesTobacco,
        sticksPerDay: medicalHistory.personalHistory.tobaccoUse.sticksPerDay,
        quitSmoking: medicalHistory.personalHistory.tobaccoUse.quitSmoking,
        quitWhen: medicalHistory.personalHistory.tobaccoUse.quitWhen,
      },
      alcoholUse: {
        drinksAlcohol: medicalHistory.personalHistory.alcoholUse.drinksAlcohol,
        drinksPerDay: medicalHistory.personalHistory.alcoholUse.drinksPerDay,
        quitDrinking: medicalHistory.personalHistory.alcoholUse.quitDrinking,
        quitWhen: medicalHistory.personalHistory.alcoholUse.quitWhen,
      },
      forWomen: {
        pregnant: medicalHistory.personalHistory.forWomen.pregnant,
        months: medicalHistory.personalHistory.forWomen.months,
        lastMenstrualPeriod: medicalHistory.personalHistory.forWomen.lastMenstrualPeriod,
        abortionOrMiscarriage: medicalHistory.personalHistory.forWomen.abortionOrMiscarriage,
        dysmenorrhea: medicalHistory.personalHistory.forWomen.dysmenorrhea,
      },
    },
    
  };

  try {
    // Log the medical history ID to verify it's correct
    console.log("Updating medical history ID:", medicalHistoryId);

    // Make the PUT request to the server
    const response = await axios.put(
      `http://localhost:3001/api/medical-history/${medicalHistoryId}`, // API endpoint with ID from medicalHistory
      updatedData // Send the updated data in the request body
    );

    // Log the successful response from the server
    console.log('Update successful:', response.data);
    // Handle success (e.g., close modal, refresh data, etc.)
  } catch (error) {
    console.error('Error updating medical history:', error.response || error.message);
    // Handle error (e.g., show error message)
  }
};

  const [selectedXrayRecord, setSelectedXrayRecord] = useState(null);

  const [isXrayDetailModalOpen, setIsXrayDetailModalOpen] = useState(false);
  const handleXrayView = (xray) => {
    setSelectedXrayRecord(xray);
    setIsXrayDetailModalOpen(true);
  };

  const handleXrayModalClose = () => {
    setIsXrayDetailModalOpen(false);
    setSelectedXrayRecord(null); // Clear the current selection
  };

  const [labDetails, setLabDetails] = useState(null);
  const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);

  const fetchLabResultByRequestId = async (laboratoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/laboratory-results/by-request/${laboratoryId}`
      );
      if (response.status === 200 && response.data) {
        setLabDetails(response.data); // Set lab details
        setIsLabResultModalOpen(true); // Open the modal
      } else {
        alert("No laboratory result found for this request ID.");
      }
    } catch (error) {
      console.error("Error fetching laboratory result by request ID:", error);
      alert(
        "Failed to load laboratory result. Please check the request ID and try again."
      );
    }
  };

  const openLabResultModal = (laboratoryId) => {
    fetchLabResultByRequestId(laboratoryId);
  };

  const closeLabResultModal = () => {
    setLabDetails(null);
    setIsLabResultModalOpen(false);
  };

  const toggleHematologyVisibility = () =>
    setHematologyVisible(!isHematologyVisible);
  const toggleClinicalMicroscopyVisibility = () =>
    setClinicalMicroscopyVisible(!isClinicalMicroscopyVisible);
  const toggleSerologyVisibility = () => setSerologyVisible(!isSerologyVisible);

  const getAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // State variables for lab results, X-ray results, and modal visibility
  const [selectedPackageLabResults, setSelectedPackageLabResults] = useState(
    []
  );
  const [selectedPackageXrayResults, setSelectedPackageXrayResults] = useState(
    []
  );
  const [isPackageResultModalOpen, setIsPackageResultModalOpen] =
    useState(false);

  const handleViewPackage = async (records) => {
    try {
      // Extract laboratory request IDs from labRecords
      const laboratoryIds = records.labRecords.map(
        (labRecord) => labRecord._id
      );

      // Fetch lab results for each laboratoryId
      const labResultsPromises = laboratoryIds.map((laboratoryId) =>
        axios
          .get(
            `http://localhost:3001/api/laboratory-results/by-request/${laboratoryId}`
          )
          .then((response) => response.data)
      );

      // Extract X-ray IDs from xrayRecords
      const xrayIds = records.xrayRecords.map((xrayRecord) => xrayRecord._id);

      // Fetch X-ray results for each xrayId
      const xrayResultsPromises = xrayIds.map((xrayId) =>
        axios
          .get(`http://localhost:3001/api/xrayResults/id/${xrayId}`)
          .then((response) => response.data)
      );

      // Wait for all promises to resolve
      const labResults = await Promise.all(labResultsPromises);
      const xrayResults = await Promise.all(xrayResultsPromises);

      // Debugging logs
      console.log("Lab Results:", labResults);
      console.log("X-ray Results:", xrayResults);

      // Store the lab and X-ray results and open the modal
      setSelectedPackageLabResults(labResults);
      setSelectedPackageXrayResults(xrayResults);
      setIsPackageResultModalOpen(true);
    } catch (error) {
      console.error("Error fetching results for the package:", error);
      alert("Failed to load results for this package.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient Profile</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {patient && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="text-center">
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Placeholder"
                      className="mx-auto h-20 w-20 rounded-full"
                    />
                    <h2 className="mt-4 text-xl font-semibold">
                      {patient.firstname} {patient.lastname}
                    </h2>
                    <p className="text-gray-500">{patient.email}</p>
                    <div className="flex justify-center mt-2 space-x-6">
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {clinicalRecords.length}
                        </p>
                        <p className="text-gray-500">Clinical</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {laboratoryRecords.length}
                        </p>
                        <p className="text-gray-500">Lab</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {xrayRecords.length}
                        </p>
                        <p className="text-gray-500">X-ray</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {physicalTherapyRecords.length}
                        </p>
                        <p className="text-gray-500">PT</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleGenerateReport}
                        >
                          Generate Report
                        </button> */}
                      <div className="relative" ref={requestDropdownRef}>
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleMakeRequest}
                        >
                          Transcation Type
                        </button>
                        {/* Request options */}
                        {showRequestOptions && (
                          <div className="absolute mt-2 bg-white border rounded-lg shadow-lg">
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleNewRecordOpen}
                            >
                              Regular Check Up
                            </button>
                            <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                              Vaccines
                            </button>
                            {/* <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleLabModalOpen} // Open modal here
                            >
                              Laboratory
                            </button>

                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleNewXrayModalOpen}
                            >
                              X-ray
                            </button> */}
                            {/* <button
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleNewTherapyRecordOpen}
                            >
                              Physical Theraphy 
                           </button> */}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={packageDropdownRef}>
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleAddPackage}
                        >
                          Packages
                        </button>
                        {showPackageOptions && (
                          <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg">
                            {packages.map((pkg) => (
                              <button
                                key={pkg._id}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                onClick={() => handlePackageClick(pkg._id)}
                              >
                                {pkg.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-semibold">{patient.idnumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Department/ Position</p>
                      <p className="font-semibold">
                        {" "}
                        {patient.patientType === "Employee"
                          ? patient.position
                          : patient.course}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age</p>
                      <p className="font-semibold">
                        {calculateAge(patient.birthdate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-semibold">{patient.sex}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-semibold">{patient.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birthday</p>
                      <p className="font-semibold">
                        {new Date(patient.birthdate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-semibold">{patient.phonenumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emergency Contact</p>
                      <p className="font-semibold">
                        {patient.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-lg">History</h2>
              {medicalRecords && medicalRecords.length > 0 ? (
                <ul>
                  {medicalRecords.map((record) => (
                    <li key={record._id} className="mb-4 p-2 bg-gray-100 rounded-lg">
                      <p><strong>Medical History:</strong></p>
                      <p><strong>Nose/Throat Disorders:</strong> {record.conditions.noseThroatDisorders ? 'Yes' : 'No'}</p>
                      <p><strong>Ear Trouble:</strong> {record.conditions.earTrouble ? 'Yes' : 'No'}</p>
                      <p><strong>Tuberculosis:</strong> {record.conditions.tuberculosis ? 'Yes' : 'No'}</p>
                      <p><strong>Lung Diseases:</strong> {record.conditions.lungDiseases ? 'Yes' : 'No'}</p>
                      <p><strong>Rheumatic Fever:</strong> {record.conditions.rheumaticFever ? 'Yes' : 'No'}</p>
                      <p><strong>Endocrine Disorder:</strong> {record.conditions.endocrineDisorder ? 'Yes' : 'No'}</p>
                      <p><strong>Cancer Tumor:</strong> {record.conditions.cancerTumor ? 'Yes' : 'No'}</p>
                      <p><strong>Mental Disorder:</strong> {record.conditions.mentalDisorder ? 'Yes' : 'No'}</p>
                      <p><strong>Head/Neck Injury:</strong> {record.conditions.headNeckInjury ? 'Yes' : 'No'}</p>
                      <p><strong>Hernia:</strong> {record.conditions.hernia ? 'Yes' : 'No'}</p>
                      <p><strong>Rheumatism/Joint Pain:</strong> {record.conditions.rheumatismJointPain ? 'Yes' : 'No'}</p>
                      <p><strong>Stomach Pain/Ulcer:</strong> {record.conditions.stomachPainUlcer ? 'Yes' : 'No'}</p>
                      <p><strong>Abdominal Disorders:</strong> {record.conditions.abdominalDisorders ? 'Yes' : 'No'}</p>
                      <p><strong>Kidney/Bladder Diseases:</strong> {record.conditions.kidneyBladderDiseases ? 'Yes' : 'No'}</p>
                      <p><strong>STD:</strong> {record.conditions.std ? 'Yes' : 'No'}</p>
                      <p><strong>Familial Disorder:</strong> {record.conditions.familialDisorder ? 'Yes' : 'No'}</p>
                      <p><strong>Tropical Diseases:</strong> {record.conditions.tropicalDiseases ? 'Yes' : 'No'}</p>
                      <p><strong>Chronic Cough:</strong> {record.conditions.chronicCough ? 'Yes' : 'No'}</p>
                      <p><strong>Fainting/Seizures:</strong> {record.conditions.faintingSeizures ? 'Yes' : 'No'}</p>
                      <p><strong>Frequent Headache:</strong> {record.conditions.frequentHeadache ? 'Yes' : 'No'}</p>
                      <p><strong>Dizziness:</strong> {record.conditions.dizziness ? 'Yes' : 'No'}</p>
                      <p><strong>Asthma:</strong> {record.conditions.asthma ? 'Yes' : 'No'}</p>
                      <p><strong>High Blood Pressure:</strong> {record.conditions.highBloodPressure ? 'Yes' : 'No'}</p>
                      <p><strong>Heart Diseases:</strong> {record.conditions.heartDiseases ? 'Yes' : 'No'}</p>
                      <p><strong>Diabetes Mellitus:</strong> {record.conditions.diabetesMellitus ? 'Yes' : 'No'}</p>
                      <p><strong>Eye Disorders:</strong> {record.conditions.eyeDisorders ? 'Yes' : 'No'}</p>

                      {/* Malaria */}
                      <p><strong>Malaria:</strong> {record.malaria.hasMalaria ? 'Yes' : 'No'}</p>
                      {record.malaria.hasMalaria && <p><strong>Last Malaria Attack:</strong> {record.malaria.lastAttackDate}</p>}

                      {/* Operations */}
                      <p><strong>Undergone Operation:</strong> {record.operations.undergoneOperation ? 'Yes' : 'No'}</p>
                      {record.operations.undergoneOperation && (
                        <p><strong>List of Operations:</strong> {record.operations.listOperations}</p>
                      )}
                      <br />
                      {/* Family History */}
                      <p><strong>Family History:</strong></p>
                      <p><strong>Heart Disease:</strong> {record.familyHistory.diseases.heartDisease ? 'Yes' : 'No'}</p>
                      <p><strong>Tuberculosis:</strong> {record.familyHistory.diseases.tuberculosis ? 'Yes' : 'No'}</p>
                      <p><strong>Diabetes:</strong> {record.familyHistory.diseases.diabetes ? 'Yes' : 'No'}</p>
                      <br />
                      {/* Personal History */}
                      <p><strong>Personal History:</strong></p>
                      <p><strong>Uses Tobacco:</strong> {record.personalHistory.tobaccoUse.usesTobacco ? 'Yes' : 'No'}</p>
                      {record.personalHistory.tobaccoUse.usesTobacco && (
                        <>
                          <p><strong>Sticks Per Day:</strong> {record.personalHistory.tobaccoUse.sticksPerDay}</p>
                          <p><strong>Quit Smoking:</strong> {record.personalHistory.tobaccoUse.quitSmoking ? 'Yes' : 'No'}</p>
                          <p><strong>Quit When:</strong> {record.personalHistory.tobaccoUse.quitWhen}</p>
                        </>
                      )}

                      <br />
                      <p><strong>Drinks Alcohol:</strong> {record.personalHistory.alcoholUse.drinksAlcohol ? 'Yes' : 'No'}</p>
                      {record.personalHistory.alcoholUse.drinksAlcohol && (
                        <>
                          <p><strong>Drinks Per Day:</strong> {record.personalHistory.alcoholUse.drinksPerDay}</p>
                          <p><strong>Quit Drinking:</strong> {record.personalHistory.alcoholUse.quitDrinking ? 'Yes' : 'No'}</p>
                          <p><strong>Quit When:</strong> {record.personalHistory.alcoholUse.quitWhen}</p>
                        </>
                      )}

                      <br />
                      <p><strong>For Women:</strong></p>
                      <p><strong>Pregnant:</strong> {record.personalHistory.forWomen.pregnant ? 'Yes' : 'No'}</p>
                      {record.personalHistory.forWomen.pregnant && (
                        <>
                          <p><strong>Months:</strong> {record.personalHistory.forWomen.months}</p>
                          <p><strong>Last Menstrual Period:</strong> {record.personalHistory.forWomen.lastMenstrualPeriod}</p>
                          <p><strong>Abortion/Miscarriage:</strong> {record.personalHistory.forWomen.abortionOrMiscarriage}</p>
                          <p><strong>Dysmenorrhea:</strong> {record.personalHistory.forWomen.dysmenorrhea ? 'Yes' : 'No'}</p>
                        </>
                      )}
                  
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No medical history available.</p>
              )}
            </div>
            <div className="relative mt-4" ref={historyDropdownRef}>
              <button
                className="w-full bg-custom-red text-white p-2 rounded-lg"
                onClick={handleAddHistory}
              >
                Add History
              </button>
              {showHistoryOptions && (
                <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={handleMedicalOpen}
                  >
                    Medical
                  </button>
                  
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={handleFamilyPersonalOpen}
                  >
                    Family/ Personal
                  </button>
                </div>
              )}
            </div>
          </div>
          {isMedicalModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white py-4 px-6 rounded-lg w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
                <h1 className="text-2xl font-semibold text-center mb-6">
                  Medical History Form
                </h1>

                {/* Conditions Section */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold">
                    Has any of the applicant suffered from, or been told he had
                    any of the following conditions:
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
                          handleCheckboxChange(
                            "conditions",
                            "stomachPainUlcer",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "highBloodPressure",
                            e
                          )
                        }
                      />{" "}
                      6. High Blood Pressure
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={
                          medicalHistory.conditions.kidneyBladderDiseases
                        }
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
                          handleCheckboxChange(
                            "conditions",
                            "rheumaticFever",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "familialDisorder",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "diabetesMellitus",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "tropicalDiseases",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "endocrineDisorder",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "faintingSeizures",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "mentalDisorder",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "frequentHeadache",
                            e
                          )
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
                          handleCheckboxChange(
                            "conditions",
                            "headNeckInjury",
                            e
                          )
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
                            medicalHistory.operations.undergoneOperation ===
                            "Yes"
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
                            medicalHistory.operations.undergoneOperation ===
                            "No"
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

                  <div className="mt-7 flex flex-col space-y-4">
                    <label className="text-sm font-semibold text-gray-700">
                      I hereby certify that all the information I have disclosed
                      as reflected in this report are true to the best of my
                      knowledge and belief and that any misrepresentation or
                      concealment on my part may lead to consequences, which may
                      or may not include disqualification, etc.
                      <br />
                      <br />
                      I hereby authorize UB Medical-Dental Clinic and its
                      officially designated examining physicians and staff to
                      conduct the examinations necessary to assess my fitness to
                      undergo Internship/On-the-Job Training/Practicum.
                      <br />
                      <br />
                      By signing this, I hold UB Medical-Dental Clinic and its
                      authorized physicians and staff free from any criminal,
                      civil, administrative, ethical, and moral liability, that
                      may arise from the above.
                    </label>

                    <div className="flex justify-end mt-4">
                      <div className="w-1/2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Upload Signature
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Accepted file types: JPG, PNG. Max size: 5MB
                        </p>
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
                  <button
                    className="bg-custom-red text-white py-2 px-4 rounded-lg"
                    onClick={async (e) => {
                      await handleMedicalHistorySubmit(e); // Call the submit function
                      handleMedicalClose(); // Close the modal
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {isFamilyPersonalModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white py-4 px-6 rounded-lg w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
                <h1 className="text-2xl font-semibold text-center mb-6">
                  History Form
                </h1>

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
                        checked={
                          medicalHistory.familyHistory.diseases.heartDisease
                        } // Ensure it's never undefined
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
                        checked={
                          medicalHistory.familyHistory.diseases.hypertension
                        }
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
                        checked={
                          medicalHistory.familyHistory.diseases.tuberculosis
                        }
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
                            medicalHistory.familyHistory.allergies
                              .hasAllergies === "Yes"
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
                            medicalHistory.familyHistory.allergies
                              .hasAllergies === "No"
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
                            medicalHistory.familyHistory.allergies
                              .hasAllergies === "Not Sure"
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
                        Do you use any kind of tobacco or have you ever used
                        them?
                      </label>

                      <select
                        className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                        onChange={(e) =>
                          handleTobaccoChange("usesTobacco", e.target.value)
                        }
                      >
                        <option value="" disabled selected>
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
                          onChange={(e) =>
                            handleTobaccoChange("quitSmoking", e.target.value)
                          }
                        >
                          <option value="" disabled selected>
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
                        onChange={(e) =>
                          handleAlcoholChange("drinksAlcohol", e.target.value)
                        }
                      >
                        <option value="" disabled selected>
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
                          onChange={(e) =>
                            handleAlcoholChange("quitDrinking", e.target.value)
                          }
                        >
                          <option value="" disabled selected>
                            {" "}
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
                        onChange={(e) =>
                          handleWomenHealthChange("pregnant", e.target.value)
                        }
                      >
                        <option value="" disabled selected>
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
                          onChange={(e) =>
                            handleWomenHealthChange(
                              "abortionOrMiscarriage",
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled selected>
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
                          onChange={(e) =>
                            handleWomenHealthChange(
                              "dysmenorrhea",
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled selected>
                            Select
                          </option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-7 flex flex-col space-y-4">
                    <label className="text-sm font-semibold text-gray-700">
                      I hereby certify that all the information I have disclosed
                      as reflected in this report is true to the best of my
                      knowledge and belief, and that any misrepresentation or
                      concealment on my part may lead to consequences, which may
                      or may not include disqualification, etc.
                      <br />
                      <br />
                      I hereby authorize UB Medical-Dental Clinic and its
                      officially designated examining physicians and staff to
                      conduct the examinations necessary to assess my fitness to
                      undergo Internship/On-the-Job Training/Practicum.
                      <br />
                      <br />
                      By signing this, I hold UB Medical-Dental Clinic and its
                      authorized physicians and staff free from any criminal,
                      civil, administrative, ethical, and moral liability that
                      may arise from the above.
                    </label>

                    <div className="flex justify-end mt-4">
                      <div className="w-1/2">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Upload Signature
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Accepted file types: JPG, PNG. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                    onClick={handleFamilyClose}
                  >
                    Close
                  </button>
                  <button
                    className="bg-custom-red text-white py-2 px-4 rounded-lg"
                    onClick={ () => {
                      handleUpdateSubmit();
                      handleFamilyClose();
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  className={`${
                    selectedTab === "clinical"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("clinical")}
                >
                  Consultation Records
                </button>
                <button
                  className={`${
                    selectedTab === "laboratory"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("laboratory")}
                >
                  Laboratory Records
                </button>
                <button
                  className={`${
                    selectedTab === "xray"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("xray")}
                >
                  X-ray Records
                </button>
                {(role === "physical therapist" ||
                  role === "special trainee") && (
                  <button
                    className={`${
                      selectedTab === "physical therapy"
                        ? "text-custom-red font-semibold"
                        : ""
                    }`}
                    onClick={() => handleTabChange("physical therapy")}
                  >
                    Physical Therapy Records
                  </button>
                )}
                <button
                  className={`${
                    selectedTab === "package"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("package")}
                >
                  Package Records
                </button>
              </div>
            </div>

            {/* Scrollable section */}
            <div className="mt-4 max-h-72 overflow-y-auto">
              <ul className="space-y-4">
                {/* Clinical Records */}
                {selectedTab === "clinical" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">{records.complaints}</p>
                        </div>
                        <div className="flex-1 text-gray-500">
                          {records.treatments.length > 20
                            ? `${records.treatments.substring(0, 20)}...`
                            : records.treatments}
                          {records.emergencyTreatment && (
                            <p className="text-custom-red italic">
                              Emergency: {records.emergencyTreatment}
                            </p>
                          )}
                        </div>
                        <div className="flex-1 text-gray-500">
                          {records.diagnosis.length > 20
                            ? `${records.diagnosis.substring(0, 20)}...`
                            : records.diagnosis}
                        </div>
                        <button
                          className="text-custom-red"
                          onClick={() => handleViewRecord(records)}
                        >
                          View
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No clinical records found.
                    </p>
                  ))}

                {/* Laboratory Records */}
                {selectedTab === "laboratory" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => {
                      const allTests = [
                        ...Object.entries(records.bloodChemistry || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.hematology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(
                          records.clinicalMicroscopyParasitology || {}
                        )
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.bloodBankingSerology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.microbiology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                      ].join(", ");

                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-100 rounded-lg space-x-4"
                        >
                          <div className="flex-1">
                            <p className="text-gray-500 text-sm">
                              {new Date(records.isCreatedAt).toLocaleString()}
                            </p>
                            <p className="font-semibold">
                              {allTests || "No test data available"}
                            </p>
                          </div>
                          <div className="flex-1 text-gray-500 text-center">
                            {records.labResult}
                          </div>
                          <div className="flex-1 text-right">
                            <button className="text-custom-red">View</button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No lab records available.
                    </p>
                  ))}

                {/* X-ray Records */}
                {selectedTab === "xray" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div className="col-span-1">
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">
                            {records.xrayDescription}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-500">{records.xrayType}</p>
                        </div>
                        <div className="col-span-1 flex justify-between items-center">
                          <p className="text-gray-500">{records.xrayResult}</p>
                          <button className="text-custom-red">View</button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No X-ray records available.
                    </p>
                  ))}

                {/* Physical Therapy Records */}
                {selectedTab === "physical therapy" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">{records.SOAPSummary}</p>
                          <p className="text-gray-500">{records.Diagnosis}</p>
                        </div>
                        <div className="text-gray-500">
                          {records.physicalTherapyResult}
                        </div>
                        <button className="text-custom-red">Edit</button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No Physical Therapy records available.
                    </p>
                  ))}

                {selectedTab === "package" &&
                  (Object.keys(combinedRecords).length > 0 ? (
                    Object.entries(combinedRecords).map(
                      ([packageNumber, records], index) => (
                        <li
                          key={index}
                          className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                        >
                          <div className="col-span-1">
                            <p className="text-gray-500 text-sm">
                              {new Date(
                                records.labRecords[0]?.isCreatedAt ||
                                  records.xrayRecords[0]?.isCreatedAt
                              ).toLocaleString() || "Invalid Date"}
                            </p>
                            <p className="font-semibold">
                              {records.labRecords[0]?.packageId?.name || "N/A"}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Package No: {packageNumber}
                            </p>
                          </div>

                          <div className="col-span-1">
                            <p className="text-gray-500">
                              {records.labRecords.length > 0
                                ? records.labRecords
                                    .flatMap((record) =>
                                      // Extract only values from bloodChemistry and hematology
                                      [
                                        // Extract all values from each category and filter empty values
                                        ...Object.values(
                                          record.bloodChemistry || {}
                                        ).filter((value) => value),
                                        ...Object.values(
                                          record.hematology || {}
                                        ).filter((value) => value),
                                        ...Object.values(
                                          record.clinicalMicroscopyParasitology ||
                                            {}
                                        ).filter((value) => value),
                                        ...Object.values(
                                          record.bloodBankingSerology || {}
                                        ).filter((value) => value),
                                        ...Object.values(
                                          record.microbiology || {}
                                        ).filter((value) => value),
                                      ]
                                    )
                                    .join(", ") || "No test data available"
                                : "No Lab Tests Available"}
                            </p>
                          </div>

                          <div className="col-span-1 flex justify-between items-center">
                            <p className="text-gray-500">
                              {records.xrayRecords.length > 0
                                ? records.xrayRecords.map((record, idx) => (
                                    <span key={idx}>
                                      {record.xrayType}
                                      {idx < records.xrayRecords.length - 1 &&
                                        ", "}{" "}
                                    </span>
                                  ))
                                : "No X-ray Data"}
                            </p>
                            <button
                              className="text-custom-red"
                              onClick={() => handleViewPackage(records)}
                            >
                              View
                            </button>{" "}
                          </div>
                        </li>
                      )
                    )
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No Package records available.
                    </p>
                  ))}

                {isPackageResultModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
                      {/* Lab Results Section */}
                      {selectedPackageLabResults.length > 0 ? (
                        selectedPackageLabResults.map((labResult, index) => (
                          <div className="" key={index}>
                            <div className="">
                              <form className="flex-grow">
                                {/* <div className="flex mb-4">
                                  <div className="w-3/4 mr-2">
                                    <label className="block text-gray-700">
                                      OR No.
                                    </label>
                                    <input
                                      type="text"
                                      name="ORNumber" // Changed name to match the formData key
                                      value={labResult.ORNumber || "N/A"}
                                      className="w-full px-3 py-2 border rounded"
                                    />
                                  </div>

                                  <div className="w-3/4 mr-2">
                                    <label className="block text-gray-700">
                                      Lab No.
                                    </label>
                                    <input
                                      type="text"
                                      name="labNumber" // Changed name to match the formData key
                                      value={labResult.labNumber || "N/A"}
                                      className="w-full px-3 py-2 border rounded"
                                      readOnly
                                    />
                                  </div>

                                  <div className="w-1/4">
                                    <label className="block text-gray-700">
                                      Date
                                    </label>
                                    <input
                                      type="text"
                                      name="date"
                                      className="w-full px-3 py-2 border rounded"
                                      value={
                                        new Date(
                                          labResult.isCreatedAt
                                        ).toLocaleDateString() || "N/A"
                                      }
                                      readOnly
                                    />
                                  </div>
                                </div> */}

                                <div className="flex mb-4">
                                  <div className="w-1/2 mr-2">
                                    <label className="block text-gray-700">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      className="w-full px-3 py-2 border rounded bg-gray-100"
                                      value={
                                        labResult.patient
                                          ? `${labResult.patient.lastname}, ${labResult.patient.firstname}`
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                  </div>
                                  <div className="w-1/4 mr-2">
                                    <label className="block text-gray-700">
                                      Age
                                    </label>
                                    <input
                                      type="text"
                                      name="age"
                                      className="w-full px-3 py-2 border rounded bg-gray-100"
                                      value={
                                        labResult.patient?.birthdate
                                          ? getAge(labResult.patient.birthdate)
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                  </div>
                                  <div className="w-1/4">
                                    <label className="block text-gray-700">
                                      Sex
                                    </label>
                                    <input
                                      type="text"
                                      name="sex"
                                      className="w-full px-3 py-2 border rounded bg-gray-100"
                                      value={labResult.patient?.sex || "N/A"}
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-gray-700">
                                    Department/ Position
                                  </label>
                                  <input
                                    type="text"
                                    name="courseDept"
                                    className="w-full px-3 py-2 border rounded bg-gray-100"
                                    value={
                                      labResult.patient
                                        ? labResult.patient.patientType ===
                                          "Student"
                                          ? labResult.patient.course || "N/A" // Display course if patientType is student
                                          : labResult.patient.position || "N/A" // Otherwise, display position
                                        : "N/A"
                                    }
                                    readOnly
                                  />
                                </div>
                                <h2 className="text-center text-xl font-semibold mt-4">
                                Lab Result Form
                              </h2>
                                {/* Hematology Section */}
                                <div className="mb-0">
                                  <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={toggleHematologyVisibility}
                                  >
                                    <h3 className="text-lg font-semibold my-0 py-2">
                                      I. Hematology
                                    </h3>
                                    <BiChevronDown
                                      className={`transform transition-transform duration-300 ${
                                        isHematologyVisible ? "rotate-180" : ""
                                      }`}
                                      size={24}
                                    />
                                  </div>
                                  <div className="w-full h-px bg-gray-300 my-0"></div>

                                  {isHematologyVisible && (
                                    <div className="grid grid-cols-3 gap-4 p-4">
                                      <div className="col-span-1 font-semibold">
                                        Tests
                                      </div>
                                      <div className="col-span-1 font-semibold">
                                        Result
                                      </div>
                                      <div className="col-span-1 font-semibold">
                                        Reference Range
                                      </div>

                                      <div className="col-span-1">
                                        Red Blood Cell Count
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="redBloodCellCount"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.redBloodCellCount || "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        Male: 4.0 - 5.5 x10^12/L; Female: 3.5 -
                                        5.0 x10^12/L
                                      </div>

                                      <div className="col-span-1">
                                        Hemoglobin
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="hemoglobin"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology?.Hemoglobin ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        Male: 140 - 180 g/L; Female: 120 - 180
                                        g/L
                                      </div>

                                      <div className="col-span-1">
                                        Hematocrit
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="hematocrit"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology?.Hematocrit ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        Male: 0.40 - 0.54; Female: 0.37 - 0.47
                                      </div>

                                      <div className="col-span-1">
                                        Leukocyte Count
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="leukocyteCount"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.LeukocyteCount || "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        5.0 - 10.0 x10^9/L
                                      </div>

                                      <div className="col-span-1">
                                        Differential Count
                                      </div>
                                      <div className="col-span-1"></div>
                                      <div className="col-span-1"></div>

                                      <div className="col-span-1 ml-9">
                                        Segmenters
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="segmenters"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount?.segmenters ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        0.50 - 0.70
                                      </div>

                                      <div className="col-span-1 ml-9">
                                        Lymphocytes
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="lymphocytes"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount
                                              ?.lymphocytes || "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        0.20 - 0.40
                                      </div>

                                      <div className="col-span-1 ml-9">
                                        Monocytes
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="monocytes"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount?.monocytes ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        0.00 - 0.07
                                      </div>

                                      <div className="col-span-1 ml-9">
                                        Eosinophils
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="eosinophils"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount
                                              ?.eosinophils || "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        0.00 - 0.05
                                      </div>

                                      <div className="col-span-1 ml-9">
                                        Basophils
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="basophils"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount?.basophils ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        0.00 - 0.01
                                      </div>

                                      <div className="col-span-1 ml-9">
                                        Total
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="total"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.DifferentialCount?.total ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1"></div>

                                      <div className="col-span-1">
                                        Platelet Count
                                      </div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="plateletCount"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology
                                              ?.PlateletCount || "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1">
                                        150 - 400 x10^9/L
                                      </div>

                                      <div className="col-span-1">Others</div>
                                      <div className="col-span-1">
                                        <input
                                          type="text"
                                          name="others"
                                          className="w-full px-3 py-1 border rounded bg-gray-100"
                                          value={
                                            labResult.Hematology?.others ||
                                            "N/A"
                                          }
                                          readOnly
                                        />
                                      </div>
                                      <div className="col-span-1"></div>
                                    </div>
                                  )}
                                </div>

                                <div
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={toggleClinicalMicroscopyVisibility}
                                >
                                  <h3 className="text-lg font-semibold mb-0 py-2">
                                    II. Clinical Microscopy and Parasitology
                                  </h3>
                                  <BiChevronDown
                                    className={`transform transition-transform duration-300 ${
                                      isClinicalMicroscopyVisible
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    size={24}
                                  />
                                </div>
                                <div className="w-full h-px bg-gray-300 my-0"></div>

                                {isClinicalMicroscopyVisible && (
                                  <div className="grid grid-cols-6 gap-4 p-4">
                                    {/* Routine Urinalysis - Macroscopic Examination */}
                                    <label className="col-span-3 font-semibold">
                                      Routine Urinalysis
                                    </label>

                                    <label className="col-span-1">LMP</label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.LMP || "N/A"
                                      }
                                      readOnly
                                    />
                                    <h4 className="col-span-6 font-semibold">
                                      Macroscopic Examination
                                    </h4>
                                    <label className="col-span-1">Color</label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.macroscopicExam
                                          ?.color || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Appearance
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.macroscopicExam
                                          ?.appearance || "N/A"
                                      }
                                      readOnly
                                    />

                                    {/* Routine Urinalysis - Chemical Examination */}
                                    <h4 className="col-span-6 font-semibold mt-4">
                                      Chemical Examination
                                    </h4>
                                    <label className="col-span-1">Sugar</label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.sugar || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Urobilinogen
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.urobilinogen || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Albumin
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.albumin || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Ketones
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.ketones || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Blood</label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.blood || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Nitrite
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.nitrites || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Bilirubin
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.bilirubin || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Leukocyte
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.leukocytes || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Reaction
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.reaction || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Specific Gravity
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.chemicalExam
                                          ?.specificGravity || "N/A"
                                      }
                                      readOnly
                                    />

                                    {/* Routine Urinalysis - Microscopic Examination */}
                                    <h4 className="col-span-6 font-semibold mt-4">
                                      Microscopic Examination
                                    </h4>
                                    <label className="col-span-1">
                                      Pus Cells
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/hpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.pusCells || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Epithelial Cells
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/lpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.epithelialCells || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Red Blood Cells
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/hpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.RBC || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Mucus Threads
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/lpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.mucusThreads || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Bacteria
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/hpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.bacteria || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Crystals
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/lpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.crystals || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Yeast Cells
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/hpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.yeastCells || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Amorphous
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/lpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.amorphous || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Cast</label>
                                    <input
                                      type="text"
                                      className="col-span-1 border rounded px-3 py-1"
                                      placeholder="/lpf"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.casts || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Others</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineUrinalysis?.microscopicExam
                                          ?.others || "N/A"
                                      }
                                    />

                                    {/* Routine Fecalysis */}
                                    <h4 className="col-span-6 font-semibold mt-4">
                                      Routine Fecalysis
                                    </h4>
                                    <label className="col-span-1">Color</label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.color || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Consistency
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.consistency ||
                                        "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Bacteria
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.bacteria || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Others</label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.color || "N/A"
                                      }
                                      readOnly
                                    />

                                    {/* Microscopic Examination for Fecalysis */}
                                    <h4 className="col-span-6 font-semibold mt-4">
                                      Microscopic Examination
                                    </h4>
                                    <label className="col-span-1">
                                      Direct Fecal Smear
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.microscopicExam
                                          ?.directFecalSmear || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Kato Thick Smear
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-2 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.microscopicExam
                                          ?.katoThickSmear || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">Others</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.clinicalMicroscopyParasitology
                                          ?.routineFecalysis?.others || "N/A"
                                      }
                                      readOnly
                                    />
                                  </div>
                                )}

                                {/* Serology Section */}
                                <div
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={toggleSerologyVisibility}
                                >
                                  <h3 className="text-lg font-semibold mb-0 py-2">
                                    III. Serology
                                  </h3>
                                  <BiChevronDown
                                    className={`transform transition-transform duration-300 ${
                                      isSerologyVisible ? "rotate-180" : ""
                                    }`}
                                    size={24}
                                  />
                                </div>
                                <div className="w-full h-px bg-gray-300 my-0"></div>

                                {isSerologyVisible && (
                                  <div className="grid grid-cols-12 gap-4 p-4">
                                    {/* Hepatitis B Surface Antigen Determination and Anti-HAV Test */}
                                    <h4 className="col-span-6 font-semibold">
                                      Hepatitis B Surface Antigen Determination
                                      (Screening Test Only)
                                    </h4>
                                    <h4 className="col-span-6 font-semibold">
                                      Anti-HAV Test (Screening Test Only)
                                    </h4>

                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.hepatitisBSurfaceAntigen
                                          ?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.antiHAVTest?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.hepatitisBSurfaceAntigen
                                          ?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.antiHAVTest?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.hepatitisBSurfaceAntigen
                                          ?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.hepatitisBSurfaceAntigen.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.antiHAVTest?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.antiHAVTest.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.hepatitisBSurfaceAntigen?.result ||
                                        "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.antiHAVTest?.result || "N/A"
                                      }
                                      readOnly
                                    />

                                    {/* Serum Pregnancy and Test for Treponema pallidum / Syphilis */}
                                    <h4 className="col-span-6 font-semibold">
                                      Serum Pregnancy
                                    </h4>
                                    <h4 className="col-span-6 font-semibold">
                                      Test for Treponema pallidum / Syphilis
                                    </h4>

                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.serumPregnancy?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.treponemaPallidumTest?.methodUsed ||
                                        "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.serumPregnancy?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.treponemaPallidumTest?.lotNumber ||
                                        "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.serumPregnancy?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.serumPregnancy.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.treponemaPallidumTest
                                          ?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.treponemaPallidumTest.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.serumPregnancy?.result || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.treponemaPallidumTest?.result ||
                                        "N/A"
                                      }
                                      readOnly
                                    />

                                    {/* Salmonella typhi and Blood Typing */}
                                    <h4 className="col-span-6 font-semibold">
                                      Salmonella typhi
                                    </h4>
                                    <h4 className="col-span-6 font-semibold">
                                      Blood Typing
                                    </h4>

                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.salmonellaTyphi?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      ABO Type
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.bloodTyping?.ABOType || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.salmonellaTyphi?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Rh Type
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.bloodTyping?.RhType || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.salmonellaTyphi?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.salmonellaTyphi.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-6"></label>

                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.salmonellaTyphi?.result || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-6"></label>

                                    {/* Test for Dengue and Others */}
                                    <h4 className="col-span-6 font-semibold">
                                      Test for Dengue
                                    </h4>
                                    <h4 className="col-span-6 font-semibold">
                                      Others
                                    </h4>

                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.testDengue?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Method Used
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology?.others
                                          ?.methodUsed || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.testDengue?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Lot No.
                                    </label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology?.others
                                          ?.lotNumber || "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.testDengue?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.testDengue.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">
                                      Expiration Date
                                    </label>
                                    <input
                                      type="date"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology?.others
                                          ?.expirationDate
                                          ? new Date(
                                              labResult.bloodBankingSerology.others.expirationDate
                                            )
                                              .toISOString()
                                              .split("T")[0]
                                          : "N/A"
                                      }
                                      readOnly
                                    />

                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology
                                          ?.testDengue?.result || "N/A"
                                      }
                                      readOnly
                                    />
                                    <label className="col-span-1">Result</label>
                                    <input
                                      type="text"
                                      className="col-span-5 border rounded px-3 py-1"
                                      value={
                                        labResult.bloodBankingSerology?.others
                                          ?.result || "N/A"
                                      }
                                      readOnly
                                    />
                                  </div>
                                )}
                              </form>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No lab results available for this package.</p>
                      )}

                      {/* X-ray Results Section */}
                      {selectedPackageXrayResults.length > 0 ? (
                        selectedPackageXrayResults.map((xrayResult, index) => (
                          <div key={index} className="mt-6">
                            <div className="">
                              {/* Form Title */}
                              <h2 className="text-center text-xl font-semibold mb-4">
                                X-Ray Result Form
                              </h2>

                              {/* Main Form Content */}
                              <div className="flex-grow flex flex-col mb-4">
                                <form className="flex flex-row items-start gap-4">
                                  {/* X-ray Result Image - Left Side */}
                                  <div className="w-1/2">
                                    <label className="block text-gray-700">
                                      X-ray Result
                                    </label>
                                    <img
                                      src={xrayResult.imageFile}
                                      alt="X-ray"
                                      className="w-auto h-full object-cover cursor-pointer"
                                    />
                                  </div>

                                  <div className="w-1/2">
                                    {/* <div className="flex mb-4">
                                      <div className="w-1/3 mr-2">
                                        <label className="block text-gray-700">
                                          OR No.
                                        </label>
                                        <input
                                          type="text"
                                          name="XrayNo"
                                          value={xrayResult.ORNumber || "N/A"}
                                          className="w-full px-3 py-2 border rounded"
                                          readOnly
                                        />
                                      </div>
                                      <div className="w-1/3 mr-2">
                                        <label className="block text-gray-700">
                                          Case No.
                                        </label>
                                        <input
                                          type="text"
                                          name="XrayNo"
                                          value={xrayResult.XrayNo || "N/A"}
                                          className="w-full px-3 py-2 border rounded"
                                          readOnly
                                        />
                                      </div>

                                      <div className="w-1/3">
                                        <label className="block text-gray-700">
                                          Date
                                        </label>
                                        <input
                                          type="date"
                                          name="date"
                                          value={
                                            new Date(xrayResult.isCreatedAt)
                                              .toISOString()
                                              .split("T")[0]
                                          }
                                          className="w-full px-3 py-2 border rounded"
                                          readOnly
                                        />
                                      </div>
                                    </div>

                                    <div className="flex mb-4">
                                      <div className="w-1/2 mr-2">
                                        <label className="block text-gray-700">
                                          Name
                                        </label>
                                        <input
                                          type="text"
                                          name="name"
                                          value={
                                            `${patient.firstname} ${patient.lastname}` ||
                                            "N/A"
                                          }
                                          readOnly
                                          className="w-full px-3 py-2 border rounded bg-gray-100"
                                        />
                                      </div>
                                      <div className="w-1/4 mr-2">
                                        <label className="block text-gray-700">
                                          Age
                                        </label>
                                        <input
                                          type="text"
                                          name="age"
                                          value={calculateAge(
                                            patient.birthdate
                                          )}
                                          readOnly
                                          className="w-full px-3 py-2 border rounded bg-gray-100"
                                        />
                                      </div>
                                      <div className="w-1/4">
                                        <label className="block text-gray-700">
                                          Sex
                                        </label>
                                        <input
                                          type="text"
                                          name="sex"
                                          value={patient.sex || "N/A"}
                                          readOnly
                                          className="w-full px-3 py-2 border rounded bg-gray-100"
                                        />
                                      </div>
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-gray-700">
                                        {patient.patientType === "Student"
                                          ? "Course/Dept."
                                          : "Position"}
                                      </label>
                                      <input
                                        type="text"
                                        name="courseDept"
                                        value={
                                          patient.patientType === "Student"
                                            ? patient.course || "N/A"
                                            : patient.position || "N/A"
                                        }
                                        readOnly
                                        className="w-full px-3 py-2 border rounded bg-gray-100"
                                      />
                                    </div> */}

                                    {/* Diagnosis (Interpretation) */}
                                    <div className="w-full">
                                      <label className="block text-gray-700">
                                        Interpretation
                                      </label>
                                      <textarea
                                        name="diagnosis"
                                        className="w-full px-3 py-2 border rounded"
                                        rows="4"
                                        placeholder="Enter an interpretation..."
                                        value={xrayResult.xrayDescription || ""}
                                        readOnly
                                      />
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No X-ray results available for this package.</p>
                      )}
                      {/* Close Button */}
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setIsPackageResultModalOpen(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Physical Therapy Records */}
                {selectedTab === "physical therapy" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">{records.SOAPSummary}</p>
                          <p className="text-gray-500">{records.Diagnosis}</p>
                        </div>
                        <div className="text-gray-500">
                          {records.physicalTherapyResult}
                        </div>
                        <button className="text-custom-red">Edit</button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No Physical Therapy records available.
                    </p>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isNewTherapyRecordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">
              New Physical Therapy Record
            </h2>
            <form onSubmit={handleNewTherapySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Diagnosis</label>
                <input
                  type="text"
                  name="Diagnosis"
                  value={newTherapyRecord.Diagnosis}
                  onChange={handleNewTherapyRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleNewTherapyRecordClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom-red text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New Clinical Record
            </h2>
            <form onSubmit={handleNewRecordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Complaints/Findings
                </label>
                <input
                  type="text"
                  name="complaints"
                  value={newRecord.complaints}
                  onChange={handleNewRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>

              {/* Conditionally render Treatment and Diagnosis fields */}
              {role === "doctor" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Treatment
                    </label>
                    <input
                      type="text"
                      name="treatments"
                      value={newRecord.treatments}
                      onChange={handleNewRecordChange}
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={newRecord.diagnosis}
                      onChange={handleNewRecordChange}
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                  </div>
                </>
              )}

              {role === "nurse" && (
                <>
                  {!showEmergencyTreatmentInput ? (
                    <div className="mb-4">
                      <p
                        className="text-sm italic text-custom-red cursor-pointer"
                        onClick={() => setShowEmergencyTreatmentInput(true)}
                      >
                        Add Emergency Treatment
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Emergency Treatment
                      </label>
                      <input
                        type="text"
                        name="emergencyTreatment"
                        value={newRecord.emergencyTreatment || ""}
                        onChange={handleNewRecordChange}
                        className="border rounded-lg w-full p-2 mt-1"
                        placeholder="Enter emergency treatment"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleNewRecordClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom-red text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{selectedRecord.complaints}</h2>
              <p className="text-gray-500">
                {selectedRecord?.isCreatedAt
                  ? new Date(selectedRecord.isCreatedAt).toLocaleString()
                  : "No date available"}
              </p>
            </div>

            <div className="flex-grow">
              {/* Treatments Section */}
              <div className="mb-4 w-full">
                <div className="flex justify-between items-center">
                  <div className="block text-sm font-medium">Treatments</div>
                  {role === "doctor" && (
                    <button
                      className="text-sm text-custom-red underline italic hover:text-custom-red focus:outline-none"
                      onClick={() => setIsTreatmentModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0",
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>

                {selectedRecord.emergencyTreatment && (
                  <div className="border rounded-lg p-2 mt-1 w-full bg-gray-50">
                    <p className="text-custom-red italic">
                      Emergency: {selectedRecord.emergencyTreatment}
                      <br />
                      Treated by: {selectedRecord.createdBy.firstname}{" "}
                      {selectedRecord.createdBy.lastname}
                    </p>
                  </div>
                )}

                {selectedRecord.treatments &&
                selectedRecord.treatments.length > 0 ? (
                  <div className="space-y-4 mt-4 max-h-48 overflow-y-auto">
                    {selectedRecord.treatments
                      .split(", ")
                      .map((treatment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm space-x-4"
                        >
                          <div className="flex-1">
                            <p className="text-gray-800 font-semibold">
                              {treatment}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No treatments available.</p>
                )}
              </div>

              <div className="mb-4 w-full">
                <div className="flex justify-between items-center">
                  <div className="block text-sm font-medium">Diagnosis</div>
                  {role === "doctor" && (
                    <button
                      className="text-sm text-custom-red underline italic hover:text-custom-red focus:outline-none"
                      onClick={() => setIsDiagnosisModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0",
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>

                {selectedRecord.diagnosis &&
                selectedRecord.diagnosis.length > 0 ? (
                  <div className="space-y-4 mt-4 max-h-48 overflow-y-auto">
                    {selectedRecord.diagnosis
                      .split(", ")
                      .map((diagnosis, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm space-x-4"
                        >
                          <div className="flex-1">
                            <p className="text-gray-800 font-semibold">
                              {diagnosis}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No diagnosis available.</p>
                )}
              </div>

              {selectedLabTests && selectedLabTests.length > 0 ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-4">
                    Lab Tests
                  </label>
                  <div className="mb-4 max-h-48 overflow-y-auto">
                    <ul className="space-y-4">
                      {selectedLabTests
                        .sort(
                          (a, b) =>
                            new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
                        )
                        .map((labTest, index) => {
                          const allTests = [
                            ...Object.entries(labTest.bloodChemistry || {})
                              .filter(([key, value]) => value)
                              .map(([key]) => key),
                            ...Object.entries(labTest.hematology || {})
                              .filter(([key, value]) => value)
                              .map(([key]) => key),
                            ...Object.entries(
                              labTest.clinicalMicroscopyParasitology || {}
                            )
                              .filter(([key, value]) => value)
                              .map(([key]) => key),
                            ...Object.entries(
                              labTest.bloodBankingSerology || {}
                            )
                              .filter(([key, value]) => value)
                              .map(([key]) => key),
                            ...Object.entries(labTest.microbiology || {})
                              .filter(([key, value]) => value)
                              .map(([key]) => key),
                          ].join(", ");

                          return (
                            <li
                              key={index}
                              className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                            >
                              <div className="col-span-1">
                                <p className="text-gray-500 text-sm">
                                  {new Date(
                                    labTest.isCreatedAt
                                  ).toLocaleString()}
                                </p>
                                <p className="font-semibold">{allTests}</p>
                              </div>

                              <div className="col-span-1 flex justify-center items-center">
                                <p className="text-gray-500">
                                  {labTest.labResult || "pending"}
                                </p>
                              </div>

                              <div className="col-span-1 flex justify-end items-center">
                                <button
                                  className="text-custom-red"
                                  onClick={() =>
                                    openLabResultModal(labTest._id)
                                  }
                                >
                                  View
                                </button>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No lab tests available for this record.
                </p>
              )}
            </div>

            {selectedXrayRecords && selectedXrayRecords.length > 0 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-4">
                  X-Ray Records
                </label>
                <div className="mb-4 max-h-48 overflow-y-auto">
                  <ul className="space-y-4">
                    {selectedXrayRecords
                      .sort(
                        (a, b) =>
                          new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
                      )
                      .map((xray, index) => (
                        <li
                          key={index}
                          className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                        >
                          <div className="col-span-1">
                            <p className="text-gray-500 text-sm">
                              {new Date(xray.isCreatedAt).toLocaleString()}
                            </p>
                            <p className="font-semibold">{xray.xrayType}</p>
                          </div>
                          <div className="col-span-1 flex justify-center items-center">
                            <p className="text-gray-500">
                              {xray.xrayResult || "pending"}
                            </p>
                          </div>
                          <div className="col-span-1 flex justify-end items-center">
                            <button
                              className="text-custom-red"
                              onClick={() => handleXrayView(xray)}
                            >
                              View
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                No X-ray records available for this record.
              </p>
            )}

            {isLabResultModalOpen && labDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
                  <h2 className="text-xl font-semibold mb-4">Result Form</h2>
                  <form className="flex-grow">
                    <div className="flex mb-4">
                      <div className="w-3/4 mr-2">
                        <label className="block text-gray-700">OR No.</label>
                        <input
                          type="text"
                          name="ORNumber" // Changed name to match the formData key
                          value={labDetails.ORNumber || "N/A"}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      <div className="w-3/4 mr-2">
                        <label className="block text-gray-700">Lab No.</label>
                        <input
                          type="text"
                          name="labNumber" // Changed name to match the formData key
                          value={labDetails.labNumber || "N/A"}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>

                      <div className="w-1/4">
                        <label className="block text-gray-700">Date</label>
                        <input
                          type="text"
                          name="date"
                          className="w-full px-3 py-2 border rounded"
                          value={
                            new Date(
                              labDetails.isCreatedAt
                            ).toLocaleDateString() || "N/A"
                          }
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex mb-4">
                      <div className="w-1/2 mr-2">
                        <label className="block text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          className="w-full px-3 py-2 border rounded bg-gray-100"
                          value={
                            labDetails.patient
                              ? `${labDetails.patient.lastname}, ${labDetails.patient.firstname}`
                              : "N/A"
                          }
                          readOnly
                        />
                      </div>
                      <div className="w-1/4 mr-2">
                        <label className="block text-gray-700">Age</label>
                        <input
                          type="text"
                          name="age"
                          className="w-full px-3 py-2 border rounded bg-gray-100"
                          value={
                            labDetails.patient?.birthdate
                              ? getAge(labDetails.patient.birthdate)
                              : "N/A"
                          }
                          readOnly
                        />
                      </div>
                      <div className="w-1/4">
                        <label className="block text-gray-700">Sex</label>
                        <input
                          type="text"
                          name="sex"
                          className="w-full px-3 py-2 border rounded bg-gray-100"
                          value={labDetails.patient?.sex || "N/A"}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Department/ Position
                      </label>
                      <input
                        type="text"
                        name="courseDept"
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                        value={
                          labDetails.patient
                            ? labDetails.patient.patientType === "Student"
                              ? labDetails.patient.course || "N/A" // Display course if patientType is student
                              : labDetails.patient.position || "N/A" // Otherwise, display position
                            : "N/A"
                        }
                        readOnly
                      />
                    </div>

                    {/* Hematology Section */}
                    <div className="mb-0">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={toggleHematologyVisibility}
                      >
                        <h3 className="text-lg font-semibold my-0 py-2">
                          I. Hematology
                        </h3>
                        <BiChevronDown
                          className={`transform transition-transform duration-300 ${
                            isHematologyVisible ? "rotate-180" : ""
                          }`}
                          size={24}
                        />
                      </div>
                      <div className="w-full h-px bg-gray-300 my-0"></div>

                      {isHematologyVisible && (
                        <div className="grid grid-cols-3 gap-4 p-4">
                          <div className="col-span-1 font-semibold">Tests</div>
                          <div className="col-span-1 font-semibold">Result</div>
                          <div className="col-span-1 font-semibold">
                            Reference Range
                          </div>

                          <div className="col-span-1">Red Blood Cell Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="redBloodCellCount"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.redBloodCellCount ||
                                "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">
                            Male: 4.0 - 5.5 x10^12/L; Female: 3.5 - 5.0 x10^12/L
                          </div>

                          <div className="col-span-1">Hemoglobin</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="hemoglobin"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={labDetails.Hematology?.Hemoglobin || "N/A"}
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">
                            Male: 140 - 180 g/L; Female: 120 - 180 g/L
                          </div>

                          <div className="col-span-1">Hematocrit</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="hematocrit"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={labDetails.Hematology?.Hematocrit || "N/A"}
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">
                            Male: 0.40 - 0.54; Female: 0.37 - 0.47
                          </div>

                          <div className="col-span-1">Leukocyte Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="leukocyteCount"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.LeukocyteCount || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">5.0 - 10.0 x10^9/L</div>

                          <div className="col-span-1">Differential Count</div>
                          <div className="col-span-1"></div>
                          <div className="col-span-1"></div>

                          <div className="col-span-1 ml-9">Segmenters</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="segmenters"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.segmenters || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">0.50 - 0.70</div>

                          <div className="col-span-1 ml-9">Lymphocytes</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="lymphocytes"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.lymphocytes || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">0.20 - 0.40</div>

                          <div className="col-span-1 ml-9">Monocytes</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="monocytes"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.monocytes || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">0.00 - 0.07</div>

                          <div className="col-span-1 ml-9">Eosinophils</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="eosinophils"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.eosinophils || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">0.00 - 0.05</div>

                          <div className="col-span-1 ml-9">Basophils</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="basophils"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.basophils || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">0.00 - 0.01</div>

                          <div className="col-span-1 ml-9">Total</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="total"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.DifferentialCount
                                  ?.total || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1"></div>

                          <div className="col-span-1">Platelet Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="plateletCount"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={
                                labDetails.Hematology?.PlateletCount || "N/A"
                              }
                              readOnly
                            />
                          </div>
                          <div className="col-span-1">150 - 400 x10^9/L</div>

                          <div className="col-span-1">Others</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="others"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={labDetails.Hematology?.others || "N/A"}
                              readOnly
                            />
                          </div>
                          <div className="col-span-1"></div>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={toggleClinicalMicroscopyVisibility}
                    >
                      <h3 className="text-lg font-semibold mb-0 py-2">
                        II. Clinical Microscopy and Parasitology
                      </h3>
                      <BiChevronDown
                        className={`transform transition-transform duration-300 ${
                          isClinicalMicroscopyVisible ? "rotate-180" : ""
                        }`}
                        size={24}
                      />
                    </div>
                    <div className="w-full h-px bg-gray-300 my-0"></div>

                    {isClinicalMicroscopyVisible && (
                      <div className="grid grid-cols-6 gap-4 p-4">
                        {/* Routine Urinalysis - Macroscopic Examination */}
                        <label className="col-span-3 font-semibold">
                          Routine Urinalysis
                        </label>

                        <label className="col-span-1">LMP</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.LMP || "N/A"
                          }
                          readOnly
                        />
                        <h4 className="col-span-6 font-semibold">
                          Macroscopic Examination
                        </h4>
                        <label className="col-span-1">Color</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.macroscopicExam?.color ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Appearance</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.macroscopicExam
                              ?.appearance || "N/A"
                          }
                          readOnly
                        />

                        {/* Routine Urinalysis - Chemical Examination */}
                        <h4 className="col-span-6 font-semibold mt-4">
                          Chemical Examination
                        </h4>
                        <label className="col-span-1">Sugar</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.sugar || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Urobilinogen</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.urobilinogen ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Albumin</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.albumin ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Ketones</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.ketones ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Blood</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.blood || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Nitrite</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.nitrites ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Bilirubin</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.bilirubin ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Leukocyte</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.leukocytes ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Reaction</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.reaction ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Specific Gravity</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam
                              ?.specificGravity || "N/A"
                          }
                          readOnly
                        />

                        {/* Routine Urinalysis - Microscopic Examination */}
                        <h4 className="col-span-6 font-semibold mt-4">
                          Microscopic Examination
                        </h4>
                        <label className="col-span-1">Pus Cells</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/hpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.pusCells ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Epithelial Cells</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam
                              ?.epithelialCells || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Red Blood Cells</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/hpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.RBC || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Mucus Threads</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam
                              ?.mucusThreads || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Bacteria</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/hpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.bacteria ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Crystals</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.crystals ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Yeast Cells</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/hpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam
                              ?.yeastCells || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Amorphous</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.amorphous ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Cast</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.casts ||
                            "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Others</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.others ||
                            "N/A"
                          }
                        />

                        {/* Routine Fecalysis */}
                        <h4 className="col-span-6 font-semibold mt-4">
                          Routine Fecalysis
                        </h4>
                        <label className="col-span-1">Color</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.color || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Consistency</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.consistency || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Bacteria</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.bacteria || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Others</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.color || "N/A"
                          }
                          readOnly
                        />

                        {/* Microscopic Examination for Fecalysis */}
                        <h4 className="col-span-6 font-semibold mt-4">
                          Microscopic Examination
                        </h4>
                        <label className="col-span-1">Direct Fecal Smear</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.microscopicExam
                              ?.directFecalSmear || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Kato Thick Smear</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.microscopicExam
                              ?.katoThickSmear || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Others</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.others || "N/A"
                          }
                          readOnly
                        />
                      </div>
                    )}

                    {/* Serology Section */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={toggleSerologyVisibility}
                    >
                      <h3 className="text-lg font-semibold mb-0 py-2">
                        III. Serology
                      </h3>
                      <BiChevronDown
                        className={`transform transition-transform duration-300 ${
                          isSerologyVisible ? "rotate-180" : ""
                        }`}
                        size={24}
                      />
                    </div>
                    <div className="w-full h-px bg-gray-300 my-0"></div>

                    {isSerologyVisible && (
                      <div className="grid grid-cols-12 gap-4 p-4">
                        {/* Hepatitis B Surface Antigen Determination and Anti-HAV Test */}
                        <h4 className="col-span-6 font-semibold">
                          Hepatitis B Surface Antigen Determination (Screening
                          Test Only)
                        </h4>
                        <h4 className="col-span-6 font-semibold">
                          Anti-HAV Test (Screening Test Only)
                        </h4>

                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.hepatitisBSurfaceAntigen?.methodUsed || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.antiHAVTest
                              ?.methodUsed || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.hepatitisBSurfaceAntigen?.lotNumber || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.antiHAVTest
                              ?.lotNumber || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.hepatitisBSurfaceAntigen?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.hepatitisBSurfaceAntigen.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.antiHAVTest
                              ?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.antiHAVTest.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.hepatitisBSurfaceAntigen?.result || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.antiHAVTest
                              ?.result || "N/A"
                          }
                          readOnly
                        />

                        {/* Serum Pregnancy and Test for Treponema pallidum / Syphilis */}
                        <h4 className="col-span-6 font-semibold">
                          Serum Pregnancy
                        </h4>
                        <h4 className="col-span-6 font-semibold">
                          Test for Treponema pallidum / Syphilis
                        </h4>

                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.serumPregnancy
                              ?.methodUsed || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.treponemaPallidumTest?.methodUsed || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.serumPregnancy
                              ?.lotNumber || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.treponemaPallidumTest?.lotNumber || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.serumPregnancy
                              ?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.serumPregnancy.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.treponemaPallidumTest?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.treponemaPallidumTest.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.serumPregnancy
                              ?.result || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology
                              ?.treponemaPallidumTest?.result || "N/A"
                          }
                          readOnly
                        />

                        {/* Salmonella typhi and Blood Typing */}
                        <h4 className="col-span-6 font-semibold">
                          Salmonella typhi
                        </h4>
                        <h4 className="col-span-6 font-semibold">
                          Blood Typing
                        </h4>

                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.salmonellaTyphi
                              ?.methodUsed || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">ABO Type</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.bloodTyping
                              ?.ABOType || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.salmonellaTyphi
                              ?.lotNumber || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Rh Type</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.bloodTyping
                              ?.RhType || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.salmonellaTyphi
                              ?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.salmonellaTyphi.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-6"></label>

                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.salmonellaTyphi
                              ?.result || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-6"></label>

                        {/* Test for Dengue and Others */}
                        <h4 className="col-span-6 font-semibold">
                          Test for Dengue
                        </h4>
                        <h4 className="col-span-6 font-semibold">Others</h4>

                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.testDengue
                              ?.methodUsed || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Method Used</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.others
                              ?.methodUsed || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.testDengue
                              ?.lotNumber || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Lot No.</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.others
                              ?.lotNumber || "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.testDengue
                              ?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.testDengue.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Expiration Date</label>
                        <input
                          type="date"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.others
                              ?.expirationDate
                              ? new Date(
                                  labDetails.bloodBankingSerology.others.expirationDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : "N/A"
                          }
                          readOnly
                        />

                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.testDengue
                              ?.result || "N/A"
                          }
                          readOnly
                        />
                        <label className="col-span-1">Result</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.bloodBankingSerology?.others?.result ||
                            "N/A"
                          }
                          readOnly
                        />
                      </div>
                    )}
                  </form>

                  {/* Buttons Wrapper */}
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      type="button"
                      onClick={closeLabResultModal}
                      className="px-6 py-2 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isXrayDetailModalOpen && selectedXrayRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
                  {/* Form Title */}
                  <h2 className="text-xl font-semibold mb-4">Result Form</h2>

                  {/* Main Form Content */}
                  <div className="flex-grow flex flex-col mb-4">
                    <form className="flex flex-row items-start gap-4">
                      {/* X-ray Result Image - Left Side */}
                      <div className="w-1/2">
                        <label className="block text-gray-700">
                          X-ray Result
                        </label>
                        <img
                          src={selectedXrayRecord.imageFile}
                          alt="X-ray"
                          className="w-auto h-full object-cover cursor-pointer"
                        />
                      </div>

                      {/* Details Section - Right Side */}
                      <div className="w-1/2">
                        {/* Xray No. and Date */}
                        <div className="flex mb-4">
                          <div className="w-1/3 mr-2">
                            <label className="block text-gray-700">
                              OR No.
                            </label>
                            <input
                              type="text"
                              name="XrayNo"
                              value={selectedXrayRecord.ORNumber || "N/A"}
                              className="w-full px-3 py-2 border rounded"
                              readOnly
                            />
                          </div>
                          <div className="w-1/3 mr-2">
                            <label className="block text-gray-700">
                              Case No.
                            </label>
                            <input
                              type="text"
                              name="XrayNo"
                              value={selectedXrayRecord.XrayNo || "N/A"}
                              className="w-full px-3 py-2 border rounded"
                              readOnly
                            />
                          </div>

                          <div className="w-1/3">
                            <label className="block text-gray-700">Date</label>
                            <input
                              type="text"
                              name="date"
                              value={new Date(
                                selectedXrayRecord.isCreatedAt
                              ).toLocaleString()}
                              className="w-full px-3 py-2 border rounded"
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Name, Age, and Sex */}
                        <div className="flex mb-4">
                          <div className="w-1/2 mr-2">
                            <label className="block text-gray-700">Name</label>
                            <input
                              type="text"
                              name="name"
                              value={
                                `${patient.firstname} ${patient.lastname}` ||
                                "N/A"
                              }
                              readOnly
                              className="w-full px-3 py-2 border rounded bg-gray-100"
                            />
                          </div>
                          <div className="w-1/4 mr-2">
                            <label className="block text-gray-700">Age</label>
                            <input
                              type="text"
                              name="age"
                              value={calculateAge(patient.birthdate)}
                              readOnly
                              className="w-full px-3 py-2 border rounded bg-gray-100"
                            />
                          </div>
                          <div className="w-1/4">
                            <label className="block text-gray-700">Sex</label>
                            <input
                              type="text"
                              name="sex"
                              value={patient.sex || "N/A"}
                              readOnly
                              className="w-full px-3 py-2 border rounded bg-gray-100"
                            />
                          </div>
                        </div>

                        {/* Course/Dept. or Position */}
                        <div className="mb-4">
                          <label className="block text-gray-700">
                            {patient.patientType === "Student"
                              ? "Course/Dept."
                              : "Position"}
                          </label>
                          <input
                            type="text"
                            name="courseDept"
                            value={
                              patient.patientType === "Student"
                                ? patient.course || "N/A"
                                : patient.position || "N/A"
                            }
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        </div>

                        {/* Diagnosis (Interpretation) */}
                        <div className="w-full">
                          <label className="block text-gray-700">
                            Interpretation
                          </label>
                          <textarea
                            name="diagnosis"
                            className="w-full px-3 py-2 border rounded"
                            rows="4"
                            placeholder="Enter an interpretation..."
                            value={selectedXrayRecord.xrayDescription || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={handleXrayModalClose}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              {/* Left Side: Doctor-Specific Button Group */}
              {role === "doctor" && (
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                    onClick={() => handleLabModalOpen(selectedRecord)}
                  >
                    <SlChemistry className="mr-2" /> Lab Request
                  </button>
                  <button
                    className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                    onClick={() => handleNewXrayModalOpen(selectedRecord)}
                  >
                    <FaXRay className="mr-2" /> X-Ray Request
                  </button>
                  <button
                    className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                    onClick={() => handleNewTherapyRecordOpen(selectedRecord)}
                  >
                    <GiBiceps className="mr-2" /> Refer to PT
                  </button>
                </div>
              )}

              {/* Right Side: Close and Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-md"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                  onClick={() => updateClinicalRecord(selectedRecord)}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* { isModalOpen && selectedPackage && (
        <div>
          {renderLabTests("Blood Chemistry", selectedPackage.bloodChemistry)}
          {renderLabTests("Hematology", selectedPackage.hematology)}
          {renderLabTests("Clinical Microscopy & Parasitology", selectedPackage.clinicalMicroscopyParasitology)}
          {renderLabTests("Blood Banking & Serology", selectedPackage.bloodBankingSerology)}
          {renderLabTests("Microbiology", selectedPackage.microbiology)}
          <p className="font-semibold">X-ray</p>
        </div>
      )} */}
      {isTreatmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              Add Treatment
            </h2>
            <input
              type="text"
              className="border rounded-lg w-full p-2 mb-4"
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
              placeholder="Enter new treatment"
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:border-gray-500 border transition duration-200"
                onClick={() => setIsTreatmentModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                onClick={() => {
                  setSelectedRecord({
                    ...selectedRecord,
                    treatments: selectedRecord.treatments
                      ? `${selectedRecord.treatments}, ${newTreatment}`
                      : newTreatment,
                  });
                  setIsTreatmentModalOpen(false);
                  setNewTreatment("");
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding Diagnosis */}
      {isDiagnosisModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add Diagnosis</h2>
            <input
              type="text"
              className="border rounded-lg w-full p-2 mb-4"
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              placeholder="Enter new diagnosis"
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={() => setIsDiagnosisModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-custom-red text-white py-2 px-4 rounded-lg"
                onClick={() => {
                  setSelectedRecord({
                    ...selectedRecord,
                    diagnosis: selectedRecord.diagnosis
                      ? `${selectedRecord.diagnosis}, ${newDiagnosis}`
                      : newDiagnosis,
                  });
                  setIsDiagnosisModalOpen(false);
                  setNewDiagnosis(""); // Clear the diagnosis input after adding
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {isLabModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">
              Laboratory Request Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* I. Blood Chemistry */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  I. Blood Chemistry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodSugar !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodSugar")
                      }
                    />{" "}
                    Blood Sugar (Fasting / Random)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodUreaNitrogen !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodUreaNitrogen")
                      }
                    />{" "}
                    Blood Urea Nitrogen
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodUricAcid !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodUricAcid")
                      }
                    />{" "}
                    Blood Uric Acid
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.creatinine !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "creatinine")
                      }
                    />{" "}
                    Creatinine
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.SGOT_AST !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "SGOT_AST")
                      }
                    />{" "}
                    SGOT / AST
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.SGPT_ALT !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "SGPT_ALT")
                      }
                    />{" "}
                    SGPT / ALT
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.totalCholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "totalCholesterol")
                      }
                    />{" "}
                    Total Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.triglyceride !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "triglyceride")
                      }
                    />{" "}
                    Triglyceride
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.HDL_cholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "HDL_cholesterol")
                      }
                    />{" "}
                    HDL Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.LDL_cholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "LDL_cholesterol")
                      }
                    />{" "}
                    LDL Cholesterol
                  </label>
                </div>
              </div>

              {/* II. Hematology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">II. Hematology</h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.hematology.bleedingTimeClottingTime !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "hematology",
                          "bleedingTimeClottingTime"
                        )
                      }
                    />{" "}
                    Bleeding Time & Clotting Time
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.hematology.completeBloodCount !== ""}
                      onChange={() =>
                        handleInputChange("hematology", "completeBloodCount")
                      }
                    />{" "}
                    Complete Blood Count with Platelet Count
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.hematology.hematocritAndHemoglobin !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "hematology",
                          "hematocritAndHemoglobin"
                        )
                      }
                    />{" "}
                    Hematocrit and Hemoglobin
                  </label>
                </div>
              </div>

              {/* III. Clinical Microscopy & Parasitology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  III. Clinical Microscopy & Parasitology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .routineUrinalysis !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "routineUrinalysis"
                        )
                      }
                    />{" "}
                    Routine Urinalysis
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .routineStoolExamination !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "routineStoolExamination"
                        )
                      }
                    />{" "}
                    Routine Stool Examination
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .katoThickSmear !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "katoThickSmear"
                        )
                      }
                    />{" "}
                    Kato Thick Smear
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .fecalOccultBloodTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "fecalOccultBloodTest"
                        )
                      }
                    />{" "}
                    Fecal Occult Blood Test
                  </label>
                </div>
              </div>

              {/* IV. Blood Banking And Serology */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  IV. Blood Banking And Serology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.antiTreponemaPallidum !==
                        ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "antiTreponemaPallidum"
                        )
                      }
                    />{" "}
                    Anti-Treponema Pallidum
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.antiHCV !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "antiHCV")
                      }
                    />{" "}
                    Anti-HCV
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.bloodTyping !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "bloodTyping")
                      }
                    />{" "}
                    Blood Typing (ABO & Rh Grouping)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology
                          .hepatitisBSurfaceAntigen !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "hepatitisBSurfaceAntigen"
                        )
                      }
                    />{" "}
                    Hepatitis B Surface Antigen
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.pregnancyTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "pregnancyTest"
                        )
                      }
                    />{" "}
                    Pregnancy Test (Plasma/Serum)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.dengueTest !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "dengueTest")
                      }
                    />{" "}
                    Dengue Test
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.HIVRapidTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "HIVRapidTest"
                        )
                      }
                    />{" "}
                    HIV Rapid Test Kit
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.HIVElsa !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "HIVElsa")
                      }
                    />{" "}
                    HIV ELISA
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.testForSalmonellaTyphi !==
                        ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "testForSalmonellaTyphi"
                        )
                      }
                    />{" "}
                    Test for Salmonella typhi
                  </label>
                </div>
              </div>

              {/* V. Microbiology */}
              <div className="md:col-span-3 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  V. Microbiology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.microbiology.gramsStain !== ""}
                      onChange={() =>
                        handleInputChange("microbiology", "gramsStain")
                      }
                    />{" "}
                    Gram's Stain
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.microbiology.KOH !== ""}
                      onChange={() => handleInputChange("microbiology", "KOH")}
                    />{" "}
                    KOH
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:gray-500 hover:border-gray-500 border transition duration-200"
                onClick={handleModalClose}
              >
                Cancel
              </button>

              <button
                className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isNewXrayModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New X-ray Request
            </h2>
            <form onSubmit={handleNewXraySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">X-ray Type</label>
                <select
                  name="xrayType"
                  value={newXrayRecord.xrayType}
                  onChange={handleNewXrayChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                >
                  <option value="" disabled>
                    Select X-ray Type
                  </option>
                  <option value="medical">Medical X-Ray</option>
                  <option value="dental">Dental X-ray</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="xrayDescription"
                  value={newXrayRecord.xrayDescription || ""}
                  onChange={handleNewXrayChange}
                  className="border rounded-lg w-full p-2 mt-1"
                  placeholder="Enter X-ray description or details"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleNewXrayModalClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom-red text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientsProfile;
