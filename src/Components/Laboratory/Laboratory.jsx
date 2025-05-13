import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi"; // Import arrow icon
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function Laboratory() {
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Add state for success modal
  const [showOPDSuccessModal, setShowOPDSuccessModal] = useState(false);
  const [labRecords, setLabRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const labRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [isBloodChemistryVisible, setIsBloodChemistryVisible] = useState(false);
  const [isHematologyVisible, setIsHematologyVisible] = useState(false);
  const [isClinicalMicroscopyVisible, setIsClinicalMicroscopyVisible] =
    useState(false);
  const [isSerologyVisible, setIsSerologyVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedCategories, setRequestedCategories] = useState([]);
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  // Error State for Test Selection
  const [testSelectionError, setTestSelectionError] = useState("");
  const [formData, setFormData] = useState({
    ORNumber: "",
    labNumber: "", // Lab number
    patient: "", // Patient ID or name (you can adjust this as needed)
    clinicId: "", // Clinic ID
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
    Hematology: {
      redBloodCellCount: "",
      Hemoglobin: "",
      Hematocrit: "",
      LeukocyteCount: "",
      DifferentialCount: {
        segmenters: "",
        lymphocytes: "",
        monocytes: "",
        eosinophils: "",
        basophils: "",
        total: "",
      },
      PlateletCount: "",
      others: "",
    },

    clinicalMicroscopyParasitology: {
      routineUrinalysis: {
        LMP: "",
        macroscopicExam: {
          color: "",
          appearance: "",
        },
        chemicalExam: {
          sugar: "",
          albumin: "",
          blood: "",
          bilirubin: "",
          urobilinogen: "",
          ketones: "",
          nitrites: "",
          leukocytes: "",
          reaction: "",
          specificGravity: "",
        },
        microscopicExam: {
          pusCells: "",
          RBC: "",
          epithelialCells: "",
          casts: "",
          crystals: "",
          bacteria: "",
          yeastCells: "",
          mucusThreads: "",
          amorphous: "",
          others: "",
        },
      },
      routineFecalysis: {
        color: "",
        consistency: "",
        bacteria: "",
        microscopicExam: {
          directFecalSmear: "",
          katoThickSmear: "",
        },
        others: "",
      },
    },
    bloodBankingSerology: {
      hepatitisBSurfaceAntigen: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      serumPregnancy: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      salmonellaTyphi: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      testDengue: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      antiHAVTest: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      treponemaPallidumTest: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
      bloodTyping: {
        ABOType: "",
        RhType: "",
      },
      others: {
        methodUsed: "",
        lotNumber: "",
        expirationDate: "",
        result: "",
      },
    },
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleBloodChemistryVisibility = () => {
    setIsBloodChemistryVisible(!isBloodChemistryVisible);
  };

  const toggleHematologyVisibility = () =>
    setIsHematologyVisible(!isHematologyVisible); // Toggle Hematology visibility

  const toggleClinicalMicroscopyVisibility = () =>
    setIsClinicalMicroscopyVisible(!isClinicalMicroscopyVisible); // Toggle Clinical Microscopy visibility

  const toggleSerologyVisibility = () =>
    setIsSerologyVisible(!isSerologyVisible); // Toggle Serology visibility

  // const handleAddResultClick = async (record) => {
  //   console.log("Clicked record:", record);

  //   if (record && record.patient && record._id) {
  //     try {
  //       // Fetch patient data
  //       const response = await axios.get(
  //         `${apiUrl}/patients/${record.patient._id}`,
  //         {
  //           headers: {
  //             "api-key": api_Key,
  //           },
  //         }
  //       );
  //       const patientData = response.data;

  //       console.log("Fetched patient data:", patientData);

  //       setFormData({
  //         ORNumber: record.ORNumber || "",
  //         labNumber: record.labNumber || "",
  //         patient: record.patient._id,
  //         clinicId: record.clinicId,
  //         laboratoryId: record._id,
  //         name: `${patientData.firstname} ${patientData.lastname}`,
  //         courseDept:
  //           patientData.patientType === "Student"
  //             ? patientData.course
  //             : patientData.position || "",
  //         date: new Date().toISOString().split("T")[0],
  //         age: getAge(patientData.birthdate),
  //         sex: patientData.sex || "",
  //         patientType: patientData.patientType,
  //       });

  //       // Determine requested categories
  //       const categories = [];

  //       // Helper function to check if an object has any non-empty values
  //       const hasNonEmptyFields = (obj) => {
  //         return Object.values(obj).some(
  //           (value) =>
  //             value !== "" &&
  //             (typeof value !== "object" || hasNonEmptyFields(value))
  //         );
  //       };

  //       // Check Blood Chemistry and its subcategories
  //       if (record.bloodChemistry && hasNonEmptyFields(record.bloodChemistry)) {
  //         categories.push("Blood Chemistry");

  //         // Check for individual blood chemistry tests like bloodSugar, creatinine, etc.
  //         const bloodChemistryKeys = [
  //           "bloodSugar",
  //           "bloodUreaNitrogen",
  //           "bloodUricAcid",
  //           "creatinine",
  //           "SGOT_AST",
  //           "SGPT_ALT",
  //           "totalCholesterol",
  //           "triglyceride",
  //           "HDL_cholesterol",
  //           "LDL_cholesterol",
  //         ];

  //         bloodChemistryKeys.forEach((key) => {
  //           if (record.bloodChemistry[key]) {
  //             categories.push(key); // Add each specific test under Blood Chemistry
  //           }
  //         });
  //       }

  //       // Check Hematology and its subcategories
  //       if (record.hematology && hasNonEmptyFields(record.hematology)) {
  //         categories.push("Hematology");

  //         // Check for individual hematology tests like bleedingTimeClottingTime, etc.
  //         const hematologyKeys = [
  //           "bleedingTimeClottingTime",
  //           "completeBloodCount",
  //           "hematocritAndHemoglobin",
  //         ];

  //         hematologyKeys.forEach((key) => {
  //           if (record.hematology[key]) {
  //             categories.push(key); // Add each specific test under Hematology
  //           }
  //         });
  //       }

  //       // Check Clinical Microscopy and Parasitology and its subcategories
  //       if (
  //         record.clinicalMicroscopyParasitology &&
  //         hasNonEmptyFields(record.clinicalMicroscopyParasitology)
  //       ) {
  //         categories.push("Clinical Microscopy and Parasitology");

  //         // Check for individual clinical microscopy tests like routineUrinalysis, etc.
  //         const clinicalMicroscopyKeys = [
  //           "routineUrinalysis",
  //           "routineStoolExamination",
  //           "katoThickSmear",
  //           "fecalOccultBloodTest",
  //         ];

  //         clinicalMicroscopyKeys.forEach((key) => {
  //           if (record.clinicalMicroscopyParasitology[key]) {
  //             categories.push(key); // Add each specific test under Clinical Microscopy and Parasitology
  //           }
  //         });
  //       }

  //       // Check Serology and its subcategories
  //       if (
  //         record.bloodBankingSerology &&
  //         hasNonEmptyFields(record.bloodBankingSerology)
  //       ) {
  //         categories.push("Serology");

  //         // Check for individual serology tests like antiTreponemaPallidum, etc.
  //         const serologyKeys = [
  //           "antiTreponemaPallidum",
  //           "antiHCV",
  //           "bloodTyping",
  //           "hepatitisBSurfaceAntigen",
  //           "pregnancyTest",
  //           "dengueTest",
  //           "HIVRapidTest",
  //           "HIVElsa",
  //           "testForSalmonellaTyphi",
  //         ];

  //         serologyKeys.forEach((key) => {
  //           if (record.bloodBankingSerology[key]) {
  //             categories.push(key); // Add each specific test under Serology
  //           }
  //         });
  //       }

  //       setRequestedCategories(categories);

  //       openModal();
  //     } catch (error) {
  //       console.error("There was an error fetching the patient data!", error);
  //     }
  //   } else {
  //     console.warn("No valid patient or clinic data found for this record.");
  //     openModal();
  //   }
  // };
const handleAddResultClick = async (record) => {
  console.log("🧾 Clicked record:", record);

  if (record && record.patient && record._id) {
    try {
      const token = localStorage.getItem("token"); // optional, depending on backend
      const response = await axios.get(
        `${apiUrl}/patients/${record.patient._id}`,
        {
          headers: {
            "api-key": api_Key, // or Authorization: `Bearer ${token}` if required
          },
        }
      );
      const patientData = response.data;

      // Prepare form data
      setFormData({
        ORNumber: record.ORNumber || "",
        labNumber: record.labNumber || "",
        patient: record.patient._id,
        clinicId: record.clinicId,
        laboratoryId: record._id,
        name: `${patientData.firstname} ${patientData.lastname}`,
        courseDept:
          patientData.patientType === "Student"
            ? patientData.course
            : patientData.position || "",
        date: new Date().toISOString().split("T")[0],
        age: getAge(patientData.birthdate),
        sex: patientData.sex || "",
        patientType: patientData.patientType,
      });

      // Build test list
      const tests = [];

      if (Array.isArray(record.tests)) {
        record.tests.forEach((test) => {
          let details = [];

          if (
            Array.isArray(test.whatShouldBeIncluded) &&
            test.whatShouldBeIncluded.length > 0
          ) {
            details = test.whatShouldBeIncluded
              .map((item) => {
                if (typeof item === "string") {
                  return { fieldName: item };
                } else if (item && typeof item === "object" && item.fieldName) {
                  return { fieldName: item.fieldName };
                }
                return null;
              })
              .filter(Boolean);
          } else if (Array.isArray(test.details)) {
            details = test.details;
          }

          console.log(`🔍 Test: ${test.name}, Reference Range:`, test.referenceRange);

          tests.push({
            name: test.name || "Unnamed Test",
            category: test.category || "Uncategorized",
            referenceRange: test.referenceRange || "",
            details,
          });
        });
      }

      // Log tests
      console.log("🧪 Tests availed by user:");
      tests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name} (${test.category})`);
        console.log("    Reference Range:", test.referenceRange || "N/A");
        if (test.details.length > 0) {
          test.details.forEach((d) => console.log("    -", d.fieldName));
        } else {
          console.log("    (No details)");
        }
      });

      // ✅ Open the Add Result modal
      setSelectedRecord({ ...record, tests });
      setTestResults({});
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching patient data!", error);
    }
  } else {
    console.warn("⚠️ Missing patient or record ID.");
  }
};


  const handleInputChange = (e, parentKey, childKey, subChildKey, field) => {
    const { value } = e.target;

    // If all keys are provided (for deeply nested objects)
    if (parentKey && childKey && subChildKey && field) {
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: {
            ...prevData[parentKey]?.[childKey],
            [subChildKey]: {
              ...prevData[parentKey]?.[childKey]?.[subChildKey],
              [field]: value,
            },
          },
        },
      }));
    } else if (parentKey && childKey && subChildKey) {
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: {
            ...prevData[parentKey][childKey],
            [subChildKey]: value,
          },
        },
      }));
    } else if (parentKey && childKey && field) {
      // Handle one level less deeply nested object
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: {
            ...prevData[parentKey]?.[childKey],
            [field]: value,
          },
        },
      }));
    } else if (parentKey && childKey) {
      // Handle two-level nested object
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: value,
      }));
    }
  };

  const [OPDerrorMessage, setOPDErrorMessage] = useState({
    firstname: "",
    lastname: "",
    birthdate: "",
    sex: "",
    address: "",
    phonenumber: "",
    email: "",
    referredBy: "",
  });

  const validateOPDForm = () => {
    const newErrors = {};

    // Helper function to check if a field is empty
    const isEmpty = (value) => {
      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      );
    };

    // Validate Top-Level Fields
    if (isEmpty(firstname)) {
      newErrors.firstname = "First Name is required.";
    }

    if (isEmpty(lastname)) {
      newErrors.lastname = "Last Name is required.";
    }

    if (isEmpty(birthdate)) {
      newErrors.birthdate = "Birthdate is required.";
    }

    if (isEmpty(sex)) {
      newErrors.sex = "Gender is required.";
    }

    if (isEmpty(address)) {
      newErrors.address = "Address is required.";
    }

    if (isEmpty(phonenumber)) {
      newErrors.phonenumber = "Phone Number is required.";
    }

    if (isEmpty(email)) {
      newErrors.email = "Email is required.";
    }

    if (isEmpty(referredBy)) {
      newErrors.referredBy = "Referred By is required.";
    }

    setOPDErrorMessage(newErrors);

      // Determine if there are any errors
      const hasErrors = Object.keys(newErrors).length > 0;

      return !hasErrors; // Returns true if no errors
    
  };
  const [errorMessage, setErrorMessage] = useState({
    ORNumber: "",
    labNumber: "",

    // Blood Chemistry Errors
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

    // Hematology Errors
    redBloodCellCount: "",
    Hemoglobin: "",
    Hematocrit: "",
    LeukocyteCount: "",
    "DifferentialCount.segmenters": "",
    "DifferentialCount.lymphocytes": "",
    "DifferentialCount.monocytes": "",
    "DifferentialCount.eosinophils": "",
    "DifferentialCount.basophils": "",
    "DifferentialCount.total": "",
    PlateletCount: "",

    // Clinical Microscopy and Parasitology Errors
    "routineUrinalysis.LMP": "",
    "routineUrinalysis.macroscopicExam.color": "",
    "routineUrinalysis.macroscopicExam.appearance": "",
    "routineUrinalysis.chemicalExam.sugar": "",
    "routineUrinalysis.chemicalExam.albumin": "",
    "routineUrinalysis.chemicalExam.blood": "",
    "routineUrinalysis.chemicalExam.bilirubin": "",
    "routineUrinalysis.chemicalExam.urobilinogen": "",
    "routineUrinalysis.chemicalExam.ketones": "",
    "routineUrinalysis.chemicalExam.nitrites": "",
    "routineUrinalysis.chemicalExam.leukocytes": "",
    "routineUrinalysis.chemicalExam.reaction": "",
    "routineUrinalysis.chemicalExam.specificGravity": "",
    "routineUrinalysis.microscopicExam.pusCells": "",
    "routineUrinalysis.microscopicExam.RBC": "",
    "routineUrinalysis.microscopicExam.epithelialCells": "",
    "routineUrinalysis.microscopicExam.casts": "",
    "routineUrinalysis.microscopicExam.crystals": "",
    "routineUrinalysis.microscopicExam.bacteria": "",
    "routineUrinalysis.microscopicExam.yeastCells": "",
    "routineUrinalysis.microscopicExam.mucusThreads": "",
    "routineUrinalysis.microscopicExam.amorphous": "",
    "routineUrinalysis.microscopicExam.others": "",
    "routineFecalysis.color": "",
    "routineFecalysis.consistency": "",
    "routineFecalysis.bacteria": "",
    "routineFecalysis.microscopicExam.directFecalSmear": "",
    "routineFecalysis.microscopicExam.katoThickSmear": "",
    "routineFecalysis.others": "",

    // BloodBanking Serology Errors
    "bloodBankingSerology.hepatitisBSurfaceAntigen.methodUsed": "",
    "bloodBankingSerology.hepatitisBSurfaceAntigen.lotNumber": "",
    "bloodBankingSerology.hepatitisBSurfaceAntigen.expirationDate": "",
    "bloodBankingSerology.hepatitisBSurfaceAntigen.result": "",

    "bloodBankingSerology.serumPregnancy.methodUsed": "",
    "bloodBankingSerology.serumPregnancy.lotNumber": "",
    "bloodBankingSerology.serumPregnancy.expirationDate": "",
    "bloodBankingSerology.serumPregnancy.result": "",

    "bloodBankingSerology.salmonellaTyphi.methodUsed": "",
    "bloodBankingSerology.salmonellaTyphi.lotNumber": "",
    "bloodBankingSerology.salmonellaTyphi.expirationDate": "",
    "bloodBankingSerology.salmonellaTyphi.result": "",

    "bloodBankingSerology.testDengue.methodUsed": "",
    "bloodBankingSerology.testDengue.lotNumber": "",
    "bloodBankingSerology.testDengue.expirationDate": "",
    "bloodBankingSerology.testDengue.result": "",

    "bloodBankingSerology.antiHAVTest.methodUsed": "",
    "bloodBankingSerology.antiHAVTest.lotNumber": "",
    "bloodBankingSerology.antiHAVTest.expirationDate": "",
    "bloodBankingSerology.antiHAVTest.result": "",

    "bloodBankingSerology.treponemaPallidumTest.methodUsed": "",
    "bloodBankingSerology.treponemaPallidumTest.lotNumber": "",
    "bloodBankingSerology.treponemaPallidumTest.expirationDate": "",
    "bloodBankingSerology.treponemaPallidumTest.result": "",

    "bloodBankingSerology.bloodTyping.ABOType": "",
    "bloodBankingSerology.bloodTyping.RhType": "",

    "bloodBankingSerology.others.methodUsed": "",
    "bloodBankingSerology.others.lotNumber": "",
    "bloodBankingSerology.others.expirationDate": "",
    "bloodBankingSerology.others.result": "",
    "bloodBankingSerology.signature": "",
  });

  // const validateForm = () => {
  //   const newErrors = {};

  //   // Helper function to check if a field is empty
  //   const isEmpty = (value) => {
  //     return (
  //       value === undefined ||
  //       value === null ||
  //       (typeof value === "string" && value.trim() === "")
  //     );
  //   };

  //   // Validate Top-Level Fields
  //   if (isEmpty(formData.ORNumber)) {
  //     newErrors.ORNumber = "OR Number is required.";
  //   }

  //   if (isEmpty(formData.labNumber)) {
  //     newErrors.labNumber = "Lab Number is required.";
  //   }

  //   // Validate Blood Chemistry Fields
  //   if (requestedCategories.includes("bloodSugar")) {
  //     if (isEmpty(formData.bloodChemistry?.bloodSugar)) {
  //       newErrors.bloodSugar = "Blood Sugar is required.";
  //     } else if (isNaN(formData.bloodChemistry.bloodSugar)) {
  //       newErrors.bloodSugar = "Blood Sugar must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("bloodUreaNitrogen")) {
  //     if (isEmpty(formData.bloodChemistry?.bloodUreaNitrogen)) {
  //       newErrors.bloodUreaNitrogen = "Blood Urea Nitrogen is required.";
  //     } else if (isNaN(formData.bloodChemistry.bloodUreaNitrogen)) {
  //       newErrors.bloodUreaNitrogen = "Blood Urea Nitrogen must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("bloodUricAcid")) {
  //     if (isEmpty(formData.bloodChemistry?.bloodUricAcid)) {
  //       newErrors.bloodUricAcid = "Blood Uric Acid is required.";
  //     } else if (isNaN(formData.bloodChemistry.bloodUricAcid)) {
  //       newErrors.bloodUricAcid = "Blood Uric Acid must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("creatinine")) {
  //     if (isEmpty(formData.bloodChemistry?.creatinine)) {
  //       newErrors.creatinine = "Creatinine is required.";
  //     } else if (isNaN(formData.bloodChemistry.creatinine)) {
  //       newErrors.creatinine = "Creatinine must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("SGOT_AST")) {
  //     if (isEmpty(formData.bloodChemistry?.SGOT_AST)) {
  //       newErrors.SGOT_AST = "SGOT_AST is required.";
  //     } else if (isNaN(formData.bloodChemistry.SGOT_AST)) {
  //       newErrors.SGOT_AST = "SGOT_AST must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("SGPT_ALT")) {
  //     if (isEmpty(formData.bloodChemistry?.SGPT_ALT)) {
  //       newErrors.SGPT_ALT = "SGPT_ALT is required.";
  //     } else if (isNaN(formData.bloodChemistry.SGOT_AST)) {
  //       newErrors.SGOT_AST = "SGOT_AST must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("totalCholesterol")) {
  //     if (isEmpty(formData.bloodChemistry?.totalCholesterol)) {
  //       newErrors.totalCholesterol = "Total Cholesterol is required.";
  //     } else if (isNaN(formData.bloodChemistry.totalCholesterol)) {
  //       newErrors.totalCholesterol = "Total Cholesterol must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("triglyceride")) {
  //     if (isEmpty(formData.bloodChemistry?.triglyceride)) {
  //       newErrors.triglyceride = "Triglyceride is required.";
  //     } else if (isNaN(formData.bloodChemistry.triglyceride)) {
  //       newErrors.triglyceride = "Triglyceride must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("HDL_cholesterol")) {
  //     if (isEmpty(formData.bloodChemistry?.HDL_cholesterol)) {
  //       newErrors.HDL_cholesterol = "HDL Cholesterol is required.";
  //     } else if (isNaN(formData.bloodChemistry.HDL_cholesterol)) {
  //       newErrors.HDL_cholesterol = "HDL Cholesterol must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("LDL_cholesterol")) {
  //     if (isEmpty(formData.bloodChemistry?.LDL_cholesterol)) {
  //       newErrors.LDL_cholesterol = "LDL Cholesterol is required.";
  //     } else if (isNaN(formData.bloodChemistry.LDL_cholesterol)) {
  //       newErrors.LDL_cholesterol = "HDL Cholesterol must be a number.";
  //     }
  //   }

  //   // Validate Hematology Fields
  //   if (requestedCategories.includes("completeBloodCount")) {
  //     // Red Blood Cell Count
  //     if (isEmpty(formData.Hematology?.redBloodCellCount)) {
  //       newErrors.redBloodCellCount = "Red Blood Cell Count is required.";
  //     } else if (isNaN(formData.Hematology.redBloodCellCount)) {
  //       newErrors.redBloodCellCount = "Red Blood Cell Count must be a number.";
  //     }

  //     // Hemoglobin
  //     if (isEmpty(formData.Hematology?.Hemoglobin)) {
  //       newErrors.Hemoglobin = "Hemoglobin is required.";
  //     } else if (isNaN(formData.Hematology.Hemoglobin)) {
  //       newErrors.Hemoglobin = "Hemoglobin must be a number.";
  //     }

  //     // Hematocrit
  //     if (isEmpty(formData.Hematology?.Hematocrit)) {
  //       newErrors.Hematocrit = "Hematocrit is required.";
  //     } else if (isNaN(formData.Hematology.Hematocrit)) {
  //       newErrors.Hematocrit = "Hematocrit must be a number.";
  //     }

  //     // Leukocyte Count
  //     if (isEmpty(formData.Hematology?.LeukocyteCount)) {
  //       newErrors.LeukocyteCount = "Leukocyte Count is required.";
  //     } else if (isNaN(formData.Hematology.LeukocyteCount)) {
  //       newErrors.LeukocyteCount = "Leukocyte Count must be a number.";
  //     }

  //     // Differential Count Fields
  //     const differentialFields = [
  //       "segmenters",
  //       "lymphocytes",
  //       "monocytes",
  //       "eosinophils",
  //       "basophils",
  //       "total",
  //     ];

  //     differentialFields.forEach((field) => {
  //       const key = `DifferentialCount.${field}`;
  //       if (isEmpty(formData.Hematology?.DifferentialCount?.[field])) {
  //         newErrors[key] = `${
  //           field.charAt(0).toUpperCase() + field.slice(1)
  //         } is required.`;
  //       } else if (isNaN(formData.Hematology.DifferentialCount[field])) {
  //         newErrors[key] = `${
  //           field.charAt(0).toUpperCase() + field.slice(1)
  //         } must be a number.`;
  //       }
  //     });

  //     // Platelet Count
  //     if (isEmpty(formData.Hematology?.PlateletCount)) {
  //       newErrors.PlateletCount = "Platelet Count is required.";
  //     } else if (isNaN(formData.Hematology.PlateletCount)) {
  //       newErrors.PlateletCount = "Platelet Count must be a number.";
  //     }
  //   }

  //   if (requestedCategories.includes("bleedingTimeClottingTime")) {
  //     if (isEmpty(formData.Hematology?.others)) {
  //       newErrors.others = "This field is required.";
  //     }
  //   }

  //   // Validate Clinical Microscopy and Parasitology Fields

  //   if (requestedCategories.includes("routineUrinalysis")) {
  //     if (
  //       isEmpty(formData.clinicalMicroscopyParasitology?.routineUrinalysis.LMP)
  //     ) {
  //       newErrors["routineUrinalysis.LMP"] = "LMP is required.";
  //     }

  //     // Macroscopic Examination
  //     const macroscopicFields = ["color", "appearance"];
  //     macroscopicFields.forEach((field) => {
  //       const key = `routineUrinalysis.macroscopicExam.${field}`;
  //       if (
  //         isEmpty(
  //           formData.clinicalMicroscopyParasitology?.routineUrinalysis
  //             .macroscopicExam[field]
  //         )
  //       ) {
  //         newErrors[key] = `${
  //           field.charAt(0).toUpperCase() + field.slice(1)
  //         } is required.`;
  //       }
  //     });

  //     // Chemical Examination
  //     const chemicalFields = [
  //       "sugar",
  //       "albumin",
  //       "blood",
  //       "bilirubin",
  //       "urobilinogen",
  //       "ketones",
  //       "nitrites",
  //       "leukocytes",
  //       "reaction",
  //       "specificGravity",
  //     ];

  //     chemicalFields.forEach((field) => {
  //       const key = `routineUrinalysis.chemicalExam.${field}`;
  //       const value =
  //         formData.clinicalMicroscopyParasitology?.routineUrinalysis
  //           ?.chemicalExam?.[field];
  //       if (isEmpty(value)) {
  //         newErrors[key] = `${
  //           field.charAt(0).toUpperCase() + field.slice(1)
  //         } is required.`;
  //       } else if (
  //         [
  //           "sugar",
  //           "albumin",
  //           "blood",
  //           "bilirubin",
  //           "urobilinogen",
  //           "ketones",
  //           "nitrites",
  //           "leukocytes",
  //           "reaction",
  //           "specificGravity",
  //         ].includes(field)
  //       ) {
  //         if (isNaN(value)) {
  //           newErrors[key] = `${
  //             field.charAt(0).toUpperCase() + field.slice(1)
  //           } must be a number.`;
  //         }
  //       }
  //     });

  //     // Microscopic Examination
  //     const microscopicFields = [
  //       "pusCells",
  //       "RBC",
  //       "epithelialCells",
  //       "casts",
  //       "crystals",
  //       "bacteria",
  //       "yeastCells",
  //       "mucusThreads",
  //       "amorphous",
  //       "others",
  //     ];

  //     microscopicFields.forEach((field) => {
  //       const key = `routineUrinalysis.microscopicExam.${field}`;
  //       const value =
  //         formData.clinicalMicroscopyParasitology?.routineUrinalysis
  //           ?.microscopicExam?.[field];
  //       if (isEmpty(value)) {
  //         newErrors[key] = `${
  //           field.charAt(0).toUpperCase() + field.slice(1)
  //         } is required.`;
  //       }
  //     });
  //   }

  //   // Validate Routine Fecalysis
  //   if (requestedCategories.includes("routineStoolExamination")) {
  //     if (
  //       isEmpty(
  //         formData.clinicalMicroscopyParasitology?.routineFecalysis?.color
  //       )
  //     ) {
  //       newErrors["routineFecalysis.color"] = "Color is required.";
  //     }

  //     if (
  //       isEmpty(
  //         formData.clinicalMicroscopyParasitology?.routineFecalysis?.consistency
  //       )
  //     ) {
  //       newErrors["routineFecalysis.consistency"] = "Consistency is required.";
  //     }
  //   }

  //   if (requestedCategories.includes("katoThickSmear")) {
  //     // Microscopic Examination
  //     const fecalMicroscopicFields = ["directFecalSmear", "katoThickSmear"];
  //     fecalMicroscopicFields.forEach((field) => {
  //       const key = `routineFecalysis.microscopicExam.${field}`;
  //       const value =
  //         formData.clinicalMicroscopyParasitology?.routineFecalysis
  //           ?.microscopicExam?.[field];
  //       if (isEmpty(value)) {
  //         newErrors[key] = `${
  //           field === "directFecalSmear"
  //             ? "Direct Fecal Smear"
  //             : "Kato Thick Smear"
  //         } is required.`;
  //       }
  //     });
  //   }

  //   if (requestedCategories.includes("fecalOccultBloodTest")) {
  //     if (
  //       isEmpty(
  //         formData.clinicalMicroscopyParasitology?.routineFecalysis?.others
  //       )
  //     ) {
  //       newErrors["routineFecalysis.others"] = "Others field is required.";
  //     }
  //   }

  //   // Validate Blood Banking Serology Fields
  //   if (requestedCategories.includes("hepatitisBSurfaceAntigen")) {
  //     // Hepatitis B Surface Antigen
  //     if (
  //       isEmpty(
  //         formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.methodUsed
  //       )
  //     ) {
  //       newErrors.hepatitisBSurfaceAntigenMethodUsed =
  //         "Method Used is required for Hepatitis B Surface Antigen.";
  //     }
  //     if (
  //       isEmpty(
  //         formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.lotNumber
  //       )
  //     ) {
  //       newErrors.hepatitisBSurfaceAntigenLotNumber =
  //         "Lot Number is required for Hepatitis B Surface Antigen.";
  //     }
  //     if (
  //       isEmpty(
  //         formData.bloodBankingSerology?.hepatitisBSurfaceAntigen
  //           ?.expirationDate
  //       )
  //     ) {
  //       newErrors.hepatitisBSurfaceAntigenExpirationDate =
  //         "Expiration Date is required for Hepatitis B Surface Antigen.";
  //     }
  //     if (
  //       isEmpty(formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.result)
  //     ) {
  //       newErrors.hepatitisBSurfaceAntigenResult =
  //         "Result is required for Hepatitis B Surface Antigen.";
  //     }
  //   }
  //   if (requestedCategories.includes("pregnancyTest")) {
  //     // Serum Pregnancy
  //     if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.methodUsed)) {
  //       newErrors.serumPregnancyMethodUsed =
  //         "Method Used is required for Serum Pregnancy.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.lotNumber)) {
  //       newErrors.serumPregnancyLotNumber =
  //         "Lot Number is required for Serum Pregnancy.";
  //     }
  //     if (
  //       isEmpty(formData.bloodBankingSerology?.serumPregnancy?.expirationDate)
  //     ) {
  //       newErrors.serumPregnancyExpirationDate =
  //         "Expiration Date is required for Serum Pregnancy.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.result)) {
  //       newErrors.serumPregnancyResult =
  //         "Result is required for Serum Pregnancy.";
  //     }
  //   }

  //   if (requestedCategories.includes("testForSalmonellaTyphi")) {
  //     // Salmonella Typhi
  //     if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.methodUsed)) {
  //       newErrors.salmonellaTyphiMethodUsed =
  //         "Method Used is required for Salmonella Typhi.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.lotNumber)) {
  //       newErrors.salmonellaTyphiLotNumber =
  //         "Lot Number is required for Salmonella Typhi.";
  //     }
  //     if (
  //       isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.expirationDate)
  //     ) {
  //       newErrors.salmonellaTyphiExpirationDate =
  //         "Expiration Date is required for Salmonella Typhi.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.result)) {
  //       newErrors.salmonellaTyphiResult =
  //         "Result is required for Salmonella Typhi.";
  //     }
  //   }

  //   if (requestedCategories.includes("dengueTest")) {
  //     // Test Dengue
  //     if (isEmpty(formData.bloodBankingSerology?.testDengue?.methodUsed)) {
  //       newErrors.testDengueMethodUsed =
  //         "Method Used is required for Test Dengue.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.testDengue?.lotNumber)) {
  //       newErrors.testDengueLotNumber =
  //         "Lot Number is required for Test Dengue.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.testDengue?.expirationDate)) {
  //       newErrors.testDengueExpirationDate =
  //         "Expiration Date is required for Test Dengue.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.testDengue?.result)) {
  //       newErrors.testDengueResult = "Result is required for Test Dengue.";
  //     }
  //   }

  //   if (requestedCategories.includes("antiHCV")) {
  //     // Anti HAV Test
  //     if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.methodUsed)) {
  //       newErrors.antiHAVTestMethodUsed =
  //         "Method Used is required for Anti HAV Test.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.lotNumber)) {
  //       newErrors.antiHAVTestLotNumber =
  //         "Lot Number is required for Anti HAV Test.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.expirationDate)) {
  //       newErrors.antiHAVTestExpirationDate =
  //         "Expiration Date is required for Anti HAV Test.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.result)) {
  //       newErrors.antiHAVTestResult = "Result is required for Anti HAV Test.";
  //     }
  //   }

  //   if (requestedCategories.includes("antiTreponemaPallidum")) {
  //     // Treponema Pallidum Test
  //     if (
  //       isEmpty(
  //         formData.bloodBankingSerology?.treponemaPallidumTest?.methodUsed
  //       )
  //     ) {
  //       newErrors.treponemaPallidumTestMethodUsed =
  //         "Method Used is required for Treponema Pallidum Test.";
  //     }
  //     if (
  //       isEmpty(formData.bloodBankingSerology?.treponemaPallidumTest?.lotNumber)
  //     ) {
  //       newErrors.treponemaPallidumTestLotNumber =
  //         "Lot Number is required for Treponema Pallidum Test.";
  //     }
  //     if (
  //       isEmpty(
  //         formData.bloodBankingSerology?.treponemaPallidumTest?.expirationDate
  //       )
  //     ) {
  //       newErrors.treponemaPallidumTestExpirationDate =
  //         "Expiration Date is required for Treponema Pallidum Test.";
  //     }
  //     if (
  //       isEmpty(formData.bloodBankingSerology?.treponemaPallidumTest?.result)
  //     ) {
  //       newErrors.treponemaPallidumTestResult =
  //         "Result is required for Treponema Pallidum Test.";
  //     }
  //   }
  //   if (requestedCategories.includes("bloodTyping")) {
  //     // Blood Typing
  //     if (isEmpty(formData.bloodBankingSerology?.bloodTyping?.ABOType)) {
  //       newErrors.bloodTypingABOType = "ABO Type is required for Blood Typing.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.bloodTyping?.RhType)) {
  //       newErrors.bloodTypingRhType = "Rh Type is required for Blood Typing.";
  //     }
  //   }
  //   if (requestedCategories.includes("HIVELsa")) {
  //     // Others
  //     if (isEmpty(formData.bloodBankingSerology?.others?.methodUsed)) {
  //       newErrors.othersMethodUsed = "Method Used is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.lotNumber)) {
  //       newErrors.othersLotNumber = "Lot Number is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.expirationDate)) {
  //       newErrors.othersExpirationDate =
  //         "Expiration Date is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.result)) {
  //       newErrors.othersResult = "Result is required for Others.";
  //     }
  //   }

  //   if (requestedCategories.includes("HIVRapidTest")) {
  //     // Others
  //     if (isEmpty(formData.bloodBankingSerology?.others?.methodUsed)) {
  //       newErrors.othersMethodUsed = "Method Used is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.lotNumber)) {
  //       newErrors.othersLotNumber = "Lot Number is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.expirationDate)) {
  //       newErrors.othersExpirationDate =
  //         "Expiration Date is required for Others.";
  //     }
  //     if (isEmpty(formData.bloodBankingSerology?.others?.result)) {
  //       newErrors.othersResult = "Result is required for Others.";
  //     }
  //   }

  //   // Set the error messages
  //   setErrorMessage(newErrors);

  //   // Determine if there are any errors
  //   const hasErrors = Object.keys(newErrors).length > 0;

  //   return !hasErrors; // Returns true if no errors
  // };

      const [selectedRecord, setSelectedRecord] = useState(null);
const [testResults, setTestResults] = useState({});

const handleSaveResult = async () => {
  const {
    ORNumber,
    labNumber,
    patient,
    clinicId,
    laboratoryId,
    ...dynamicResults
  } = formData;

  const results = [];

  // Build results from dynamic categories and tests
  Object.entries(dynamicResults).forEach(([category, tests]) => {
    if (tests && typeof tests === "object") {
      Object.entries(tests).forEach(([testName, result]) => {
        results.push({
          category,
          testName,
          result,
        });
      });
    }
  });

  const dataToSend = {
    ORNumber,
    labNumber,
    patient,
    clinicId,
    laboratoryId,
    results,
  };

  try {
    const token = localStorage.getItem("token"); // if you're using token-based auth

    const response = await axios.post(
      `${apiUrl}/api/laboratory-results`,
      dataToSend,
      {
        headers: {
          "api-key": api_Key, // or Authorization: `Bearer ${token}`
        },
      }
    );

    if (response.status === 200) {
      console.log("✅ Lab result submission successful:", response.data.labResults);

      await axios.put(
        `${apiUrl}/api/laboratory/${laboratoryId}`,
        { labResult: "for verification" },
        {
          headers: {
            "api-key": api_Key, // include for protected PUT as well
          },
        }
      );

      closeModal();
      fetchLabRecords();

      setFormData({
        ORNumber: "",
        labNumber: "",
        patient: "",
        clinicId: "",
        laboratoryId: "",
      });
    } else {
      alert("Failed to save laboratory results.");
    }
  } catch (error) {
    console.error("❌ Error saving lab results:", error);
    alert("Failed to save laboratory results.");
  }
};


  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get(`${apiUrl}/api/laboratory`, {
        headers: {
          "api-key": api_Key,
        },
      })
      .then((response) => {
        // Filter records where labResult is "pending"
        const pendingRecords = response.data
          .filter((record) => record.labResult === "pending")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(pendingRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

  const indexOfLastRecord = currentPage * labRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - labRecordsPerPage;

  const filteredLabRecords = labRecords.filter((record) => {
    const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();
    return (
      record.patient &&
      (record.patient.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        record.patient.lastname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber.includes(searchQuery) ||
        formattedDate.includes(searchQuery))
    );
  });

  const currentLabRecords = filteredLabRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredLabRecords.length / labRecordsPerPage);

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

  // Patient details state
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
  const [sex, setSex] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [position, setPosition] = useState("");
  const [referredBy, setReferredBy] = useState(""); // State for "Referred by"
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

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

  const [formReqData, setFormReqData] = useState(initialFormData);

  // Utility Function to Check if At Least One Test is Selected
  const isAtLeastOneTestSelected = () => {
    const sections = [
      "bloodChemistry",
      "hematology",
      "clinicalMicroscopyParasitology",
      "bloodBankingSerology",
      "microbiology",
    ];

    for (let section of sections) {
      const sectionData = formReqData[section];
      for (let key in sectionData) {
        if (typeof sectionData[key] === "object" && sectionData[key] !== null) {
          for (let subKey in sectionData[key]) {
            if (sectionData[key][subKey] !== "") {
              return true;
            }
          }
        } else {
          if (sectionData[key] !== "") {
            return true;
          }
        }
      }
    }

    return false;
  };

  const handleReqInputChange = (section, field) => {
    setFormReqData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: prevData[section][field] === "" ? field : "",
      },
    }));
  };

  const handleLabModalOpen = (e) => {
    e.preventDefault();
    if(validateOPDForm()) {
      setIsLabModalOpen(true);
    }
  };

  const handleAddOPDSubmit = async (e) => {
    e.preventDefault();

   // Reset previous error message
    setTestSelectionError("");

    // Validate that at least one test is selected
    if (!isAtLeastOneTestSelected()) {
      setTestSelectionError("Please select at least one laboratory test.");
      return; // Stop submission if no tests are selected
    }

    const patientData = {
      firstname,
      middlename,
      lastname,
      birthdate,
      address,
      phonenumber,
      email,
      course,
      sex,
      patientType: "OPD",
    };

    try {
      // Step 1: Add the patient
      const patientResponse = await axios.post(
        `${apiUrl}/add-patient`,
        patientData,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
      const patientId = patientResponse.data.patient._id; // Extract the patient ID

      // Step 2: Create the lab request data including selected tests
      const labRequestData = {
        patient: patientId,
        ...formReqData, // Include selected laboratory tests
        labResult: "pending", // Initial status of the lab request
        referredBy,
      };

      await axios.post(`${apiUrl}/api/laboratory`, labRequestData, {
        headers: {
          "api-key": api_Key,
        },
      });

      // Close modal and reset form
      fetchLabRecords();
      setShowOPDSuccessModal(true);
      setIsAddOPDModalOpen(false);
      setIsLabModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding OPD patient and X-ray request:", error);
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
    setSex("");
    setEmergencyContact("");
    setPosition("");
    setPatientType("OPD");
    setReferredBy("");
    setFormReqData(initialFormData);
  };

  const [isAddOPDModalOpen, setIsAddOPDModalOpen] = useState(false);

  const toggleAddOPDModal = () => {
    setOPDErrorMessage([]);
    setIsAddOPDModalOpen(!isAddOPDModalOpen);
  };
  const handleLabModalClose = () => {
    setIsLabModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Laboratory Requests</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredLabRecords.length}
            </span>{" "}
            requests
          </p>

          <div className="flex items-center space-x-4">
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
            <button
              onClick={toggleAddOPDModal}
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
            >
              Add OPD Patient
            </button>
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/4">Patient Info</th>
                    <th className="py-3 w-1/4">Lab Test Req</th>
                    <th className="py-3 w-1/4">Status</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
        <tbody>
          {currentLabRecords.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center text-gray-500">
                No laboratory request found.
              </td>
            </tr>
          ) : (
            [...currentLabRecords]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((record) => {
                const testNames = record.tests?.map((test) => test.name).filter(Boolean).join(", ") || "No test data available";
                const includes = record.tests?.flatMap((test) => test.whatShouldBeIncluded || []);

                return (
                  <tr key={record._id} className="border-b">
                    <td className="py-4">
                      {record.patient ? (
                        <>
                          <p className="font-semibold">
                            {record.patient.lastname}, {record.patient.firstname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.createdAt
                              ? new Date(record.createdAt).toLocaleString()
                              : "Unknown date"}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No patient data</p>
                      )}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold">{testNames}</p>
                    </td>
                    <td className="py-4">
                      <p>{record.labResult || "Pending"}</p>
                    </td>
                    <td className="py-4">
                      <button
                        className="text-custom-red"
                        onClick={() => handleAddResultClick(record)}
                      >
                        Add Result
                      </button>
                    </td>
                  </tr>
                );
              })
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
                <span className="mr-2">&#9432;</span> Whole laboratory request
                list is not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Laboratory Requests
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
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
                    value={formData.ORNumber} // Keep this as is
                    onChange={(e) =>
                      handleInputChange(e, null, null, null, "ORNumber")
                    } // Adjusted the onChange handler
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                  {errorMessage.ORNumber && (
                    <p className="text-red-500 text-sm">
                      {errorMessage.ORNumber}
                    </p>
                  )}
                </div>

                <div className="w-3/4 mr-2">
                  <label className="block text-gray-700">Lab No.</label>
                  <input
                    type="text"
                    name="labNumber"
                    value={formData.labNumber}
                    onChange={(e) =>
                      handleInputChange(e, null, null, null, "labNumber")
                    }
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                  {errorMessage.labNumber && (
                    <p className="text-red-500 text-sm">
                      {errorMessage.labNumber}
                    </p>
                  )}
                </div>

                <div className="w-1/4">
                  <label className="block text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
                <div className="w-1/4 mr-2">
                  <label className="block text-gray-700">Age</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-gray-700">Sex</label>
                  <input
                    type="text"
                    name="sex"
                    value={formData.sex}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
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
                  value={formData.courseDept}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              {formData.ORNumber && (
                <>
    {Array.from(
      new Set(selectedRecord.tests.map((test) => test.category))
    ).map((category, catIndex) => (
      <div key={catIndex} className="mb-6">
        <h3 className="text-lg font-bold border-b pb-1 mb-2">{category}</h3>

        {selectedRecord.tests
          .filter((test) => test.category === category)
          .map((test, testIndex) => (
            <div key={testIndex} className="mb-4">
              {/* Main row: test name + input + reference */}
              <div className="flex items-center gap-4">
                <div className="font-semibold min-w-[150px]">{test.name}</div>

                {/* Main result input */}
                <input
                  type="text"
                  className="flex-1 px-3 py-1 border rounded bg-gray-100"
                  placeholder="Enter result"
                  value={
                    formData[category]?.[test.name]?.result || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const prevTest = prev[category]?.[test.name];
                      return {
                        ...prev,
                        [category]: {
                          ...prev[category],
                          [test.name]: {
                            ...(typeof prevTest === "object" ? prevTest : {}),
                            result: value,
                          },
                        },
                      };
                    });
                  }}
                />

                {/* Reference range display */}
                {test.referenceRange && (
                  <div className="text-xs font-bold text-red-600 whitespace-nowrap">
                    Reference: {test.referenceRange}
                  </div>
                )}
              </div>

              {/* Subtest inputs if they exist */}
              {Array.isArray(test.details) && test.details.length > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {test.details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <label className="font-semibold min-w-[150px] text-sm text-gray-800">
                        {detail.fieldName}
                      </label>
                      <input
                        type="text"
                        className="flex-1 px-3 py-1 border rounded bg-gray-50"
                        placeholder="Enter result"
                        value={
                          formData[category]?.[test.name]?.[detail.fieldName] || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => {
                            const updated = { ...prev };
                            if (!updated[category]) updated[category] = {};
                            if (
                              !updated[category][test.name] ||
                              typeof updated[category][test.name] !== "object"
                            ) {
                              updated[category][test.name] = { result: "" };
                            }
                            updated[category][test.name][detail.fieldName] = value;
                            return updated;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    ))}
  </>
              )}
            </form>

            {/* Buttons Wrapper */}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                className="px-6 py-2 text-white bg-custom-red rounded hover:bg-red-600 transition duration-300 ease-in-out"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOPDModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-1/2 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add OPD Patient</h2>
            <form onSubmit={handleAddOPDSubmit}>
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
                      
                    />
                    {OPDerrorMessage.firstname && (
                      <p className="text-red-500 text-sm col-span-3">
                        {OPDerrorMessage.firstname}
                      </p>
                    )}
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
                      
                    />
                    {OPDerrorMessage.lastname && (
                      <p className="text-red-500 text-sm col-span-3">
                        {OPDerrorMessage.lastname}
                      </p>
                    )}

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
                    
                  />
                  {OPDerrorMessage.birthdate && (
                    <p className="text-red-500 text-sm">
                      {OPDerrorMessage.birthdate}
                    </p>
                  )}
                  
                </div>

                <div className="col-span-1">
                  <label className="block mb-2">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                    
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {OPDerrorMessage.sex && (
                    <p className="text-red-500 text-sm">
                      {OPDerrorMessage.sex}
                      </p>
                      )}
                </div>

                {/* Address */}
                <div className="col-span-3">
                  <label className="block mb-2">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="px-4 py-2 border rounded w-full"
                  />
                  {OPDerrorMessage.address && (
                    <p className="text-red-500 text-sm">
                      {OPDerrorMessage.address}
                    </p>
                  )}
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
                    {OPDerrorMessage.phonenumber && (
                      <p className="text-red-500 text-sm">
                        {OPDerrorMessage.phonenumber}
                      </p>
                    )}

                  </div>

                  <div>
                    <label className="block mb-2">E-mail Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@example.com"
                      className="px-4 py-2 border rounded w-full"
                      
                    />
                    {OPDerrorMessage.email && (
                      <p className="text-red-500 text-sm">
                        {OPDerrorMessage.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="my-4">
                <label className="block text-sm font-medium">Referred by</label>
                <input
                  type="text"
                  name="referredBy"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="border rounded-lg w-full p-2 mt-1"
                  placeholder="Enter name of referrer"
                />
                {OPDerrorMessage.referredBy && (
                  <p className="text-red-500 text-sm">
                    {OPDerrorMessage.referredBy}
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:gray-500 hover:border-gray-500 border transition duration-200"
                  onClick={toggleAddOPDModal}
                >
                  Cancel
                </button>

                <button
                  className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                  onClick={handleLabModalOpen}
                >
                  Laboratory Request Modal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLabModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto z-50">
            <h2 className="text-lg font-bold mb-4 text-center">
              Laboratory Request Form
            </h2>

            {/* Display Error Message */}
            {testSelectionError && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {testSelectionError}
              </div>
            )}

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
                      checked={formReqData.bloodChemistry.bloodSugar !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "bloodSugar")
                      }
                    />{" "}
                    Blood Sugar (Fasting / Random)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodChemistry.bloodUreaNitrogen !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodChemistry",
                          "bloodUreaNitrogen"
                        )
                      }
                    />{" "}
                    Blood Urea Nitrogen
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodChemistry.bloodUricAcid !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "bloodUricAcid")
                      }
                    />{" "}
                    Blood Uric Acid
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodChemistry.creatinine !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "creatinine")
                      }
                    />{" "}
                    Creatinine
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodChemistry.SGOT_AST !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "SGOT_AST")
                      }
                    />{" "}
                    SGOT / AST
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodChemistry.SGPT_ALT !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "SGPT_ALT")
                      }
                    />{" "}
                    SGPT / ALT
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodChemistry.totalCholesterol !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodChemistry",
                          "totalCholesterol"
                        )
                      }
                    />{" "}
                    Total Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodChemistry.triglyceride !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodChemistry", "triglyceride")
                      }
                    />{" "}
                    Triglyceride
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodChemistry.HDL_cholesterol !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodChemistry",
                          "HDL_cholesterol"
                        )
                      }
                    />{" "}
                    HDL Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodChemistry.LDL_cholesterol !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodChemistry",
                          "LDL_cholesterol"
                        )
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
                        formReqData.hematology.bleedingTimeClottingTime !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                      checked={formReqData.hematology.completeBloodCount !== ""}
                      onChange={() =>
                        handleReqInputChange("hematology", "completeBloodCount")
                      }
                    />{" "}
                    Complete Blood Count with Platelet Count
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.hematology.hematocritAndHemoglobin !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.clinicalMicroscopyParasitology
                          .routineUrinalysis !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.clinicalMicroscopyParasitology
                          .routineStoolExamination !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.clinicalMicroscopyParasitology
                          .katoThickSmear !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.clinicalMicroscopyParasitology
                          .fecalOccultBloodTest !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.bloodBankingSerology
                          .antiTreponemaPallidum !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                      checked={formReqData.bloodBankingSerology.antiHCV !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodBankingSerology", "antiHCV")
                      }
                    />{" "}
                    Anti-HCV
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodBankingSerology.bloodTyping !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodBankingSerology",
                          "bloodTyping"
                        )
                      }
                    />{" "}
                    Blood Typing (ABO & Rh Grouping)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodBankingSerology
                          .hepatitisBSurfaceAntigen !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                        formReqData.bloodBankingSerology.pregnancyTest !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
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
                      checked={formReqData.bloodBankingSerology.dengueTest !== ""}
                      onChange={() =>
                        handleReqInputChange(
                          "bloodBankingSerology",
                          "dengueTest"
                        )
                      }
                    />{" "}
                    Dengue Test
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formReqData.bloodBankingSerology.HIVRapidTest !== ""}
                      onChange={() =>
                        handleReqInputChange(
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
                      checked={formReqData.bloodBankingSerology.HIVElsa !== ""}
                      onChange={() =>
                        handleReqInputChange("bloodBankingSerology", "HIVElsa")
                      }
                    />{" "}
                    HIV ELISA
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formReqData.bloodBankingSerology
                          .testForSalmonellaTyphi !== ""
                      }
                      onChange={() =>
                        handleReqInputChange(
                          "bloodBankingSerology",
                          "testForSalmonellaTyphi"
                        )
                      }
                    />{" "}
                    Test for Salmonella typhi
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:gray-500 hover:border-gray-500 border transition duration-200"
                onClick={handleLabModalClose}
              >
                Cancel
              </button>

              <button
                className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                onClick={handleAddOPDSubmit}
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Save Successful
            </h2>
            <p className="text-center text-gray-600 mb-4">
              The laboratory result has been saved successfully.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)} // Close the modal
                className="px-4 py-2 bg-custom-red text-white rounded-md"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {showOPDSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              OPD Patient Successfully Added
            </h2>
            <p className="text-center text-gray-600 mb-4">
              The OPD patient and laboratory request have been successfully
              added.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowOPDSuccessModal(false)} // Close the modal
                className="px-4 py-2 bg-custom-red text-white rounded-md"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laboratory;
