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

  const handleAddResultClick = async (record) => {
    console.log("Clicked record:", record);

    if (record && record.patient && record._id) {
      try {
        // Fetch patient data
        const response = await axios.get(
          `${apiUrl}/patients/${record.patient._id}`,
          {
            headers: {
              "api-key": api_Key,
            },
          }
        );
        const patientData = response.data;

        console.log("Fetched patient data:", patientData);

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

        // Determine requested categories
        const categories = [];

        // Helper function to check if an object has any non-empty values
        const hasNonEmptyFields = (obj) => {
          return Object.values(obj).some(
            (value) =>
              value !== "" &&
              (typeof value !== "object" || hasNonEmptyFields(value))
          );
        };

        // Check Blood Chemistry and its subcategories
        if (record.bloodChemistry && hasNonEmptyFields(record.bloodChemistry)) {
          categories.push("Blood Chemistry");

          // Check for individual blood chemistry tests like bloodSugar, creatinine, etc.
          const bloodChemistryKeys = [
            "bloodSugar",
            "bloodUreaNitrogen",
            "bloodUricAcid",
            "creatinine",
            "SGOT_AST",
            "SGPT_ALT",
            "totalCholesterol",
            "triglyceride",
            "HDL_cholesterol",
            "LDL_cholesterol",
          ];

          bloodChemistryKeys.forEach((key) => {
            if (record.bloodChemistry[key]) {
              categories.push(key); // Add each specific test under Blood Chemistry
            }
          });
        }

        // Check Hematology and its subcategories
        if (record.hematology && hasNonEmptyFields(record.hematology)) {
          categories.push("Hematology");

          // Check for individual hematology tests like bleedingTimeClottingTime, etc.
          const hematologyKeys = [
            "bleedingTimeClottingTime",
            "completeBloodCount",
            "hematocritAndHemoglobin",
          ];

          hematologyKeys.forEach((key) => {
            if (record.hematology[key]) {
              categories.push(key); // Add each specific test under Hematology
            }
          });
        }

        // Check Clinical Microscopy and Parasitology and its subcategories
        if (
          record.clinicalMicroscopyParasitology &&
          hasNonEmptyFields(record.clinicalMicroscopyParasitology)
        ) {
          categories.push("Clinical Microscopy and Parasitology");

          // Check for individual clinical microscopy tests like routineUrinalysis, etc.
          const clinicalMicroscopyKeys = [
            "routineUrinalysis",
            "routineStoolExamination",
            "katoThickSmear",
            "fecalOccultBloodTest",
          ];

          clinicalMicroscopyKeys.forEach((key) => {
            if (record.clinicalMicroscopyParasitology[key]) {
              categories.push(key); // Add each specific test under Clinical Microscopy and Parasitology
            }
          });
        }

        // Check Serology and its subcategories
        if (
          record.bloodBankingSerology &&
          hasNonEmptyFields(record.bloodBankingSerology)
        ) {
          categories.push("Serology");

          // Check for individual serology tests like antiTreponemaPallidum, etc.
          const serologyKeys = [
            "antiTreponemaPallidum",
            "antiHCV",
            "bloodTyping",
            "hepatitisBSurfaceAntigen",
            "pregnancyTest",
            "dengueTest",
            "HIVRapidTest",
            "HIVElsa",
            "testForSalmonellaTyphi",
          ];

          serologyKeys.forEach((key) => {
            if (record.bloodBankingSerology[key]) {
              categories.push(key); // Add each specific test under Serology
            }
          });
        }

        setRequestedCategories(categories);

        openModal();
      } catch (error) {
        console.error("There was an error fetching the patient data!", error);
      }
    } else {
      console.warn("No valid patient or clinic data found for this record.");
      openModal();
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

  const validateForm = () => {
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
    if (isEmpty(formData.ORNumber)) {
      newErrors.ORNumber = "OR Number is required.";
    }

    if (isEmpty(formData.labNumber)) {
      newErrors.labNumber = "Lab Number is required.";
    }

    // Validate Blood Chemistry Fields
    if (requestedCategories.includes("bloodSugar")) {
      if (isEmpty(formData.bloodChemistry?.bloodSugar)) {
        newErrors.bloodSugar = "Blood Sugar is required.";
      } else if (isNaN(formData.bloodChemistry.bloodSugar)) {
        newErrors.bloodSugar = "Blood Sugar must be a number.";
      }
    }

    if (requestedCategories.includes("bloodUreaNitrogen")) {
      if (isEmpty(formData.bloodChemistry?.bloodUreaNitrogen)) {
        newErrors.bloodUreaNitrogen = "Blood Urea Nitrogen is required.";
      } else if (isNaN(formData.bloodChemistry.bloodUreaNitrogen)) {
        newErrors.bloodUreaNitrogen = "Blood Urea Nitrogen must be a number.";
      }
    }

    if (requestedCategories.includes("bloodUricAcid")) {
      if (isEmpty(formData.bloodChemistry?.bloodUricAcid)) {
        newErrors.bloodUricAcid = "Blood Uric Acid is required.";
      } else if (isNaN(formData.bloodChemistry.bloodUricAcid)) {
        newErrors.bloodUricAcid = "Blood Uric Acid must be a number.";
      }
    }

    if (requestedCategories.includes("creatinine")) {
      if (isEmpty(formData.bloodChemistry?.creatinine)) {
        newErrors.creatinine = "Creatinine is required.";
      } else if (isNaN(formData.bloodChemistry.creatinine)) {
        newErrors.creatinine = "Creatinine must be a number.";
      }
    }

    if (requestedCategories.includes("SGOT_AST")) {
      if (isEmpty(formData.bloodChemistry?.SGOT_AST)) {
        newErrors.SGOT_AST = "SGOT_AST is required.";
      } else if (isNaN(formData.bloodChemistry.SGOT_AST)) {
        newErrors.SGOT_AST = "SGOT_AST must be a number.";
      }
    }

    if (requestedCategories.includes("SGPT_ALT")) {
      if (isEmpty(formData.bloodChemistry?.SGPT_ALT)) {
        newErrors.SGPT_ALT = "SGPT_ALT is required.";
      } else if (isNaN(formData.bloodChemistry.SGOT_AST)) {
        newErrors.SGOT_AST = "SGOT_AST must be a number.";
      }
    }

    if (requestedCategories.includes("totalCholesterol")) {
      if (isEmpty(formData.bloodChemistry?.totalCholesterol)) {
        newErrors.totalCholesterol = "Total Cholesterol is required.";
      } else if (isNaN(formData.bloodChemistry.totalCholesterol)) {
        newErrors.totalCholesterol = "Total Cholesterol must be a number.";
      }
    }

    if (requestedCategories.includes("triglyceride")) {
      if (isEmpty(formData.bloodChemistry?.triglyceride)) {
        newErrors.triglyceride = "Triglyceride is required.";
      } else if (isNaN(formData.bloodChemistry.triglyceride)) {
        newErrors.triglyceride = "Triglyceride must be a number.";
      }
    }

    if (requestedCategories.includes("HDL_cholesterol")) {
      if (isEmpty(formData.bloodChemistry?.HDL_cholesterol)) {
        newErrors.HDL_cholesterol = "HDL Cholesterol is required.";
      } else if (isNaN(formData.bloodChemistry.HDL_cholesterol)) {
        newErrors.HDL_cholesterol = "HDL Cholesterol must be a number.";
      }
    }

    if (requestedCategories.includes("LDL_cholesterol")) {
      if (isEmpty(formData.bloodChemistry?.LDL_cholesterol)) {
        newErrors.LDL_cholesterol = "LDL Cholesterol is required.";
      } else if (isNaN(formData.bloodChemistry.LDL_cholesterol)) {
        newErrors.LDL_cholesterol = "HDL Cholesterol must be a number.";
      }
    }

    // Validate Hematology Fields
    if (requestedCategories.includes("completeBloodCount")) {
      // Red Blood Cell Count
      if (isEmpty(formData.Hematology?.redBloodCellCount)) {
        newErrors.redBloodCellCount = "Red Blood Cell Count is required.";
      } else if (isNaN(formData.Hematology.redBloodCellCount)) {
        newErrors.redBloodCellCount = "Red Blood Cell Count must be a number.";
      }

      // Hemoglobin
      if (isEmpty(formData.Hematology?.Hemoglobin)) {
        newErrors.Hemoglobin = "Hemoglobin is required.";
      } else if (isNaN(formData.Hematology.Hemoglobin)) {
        newErrors.Hemoglobin = "Hemoglobin must be a number.";
      }

      // Hematocrit
      if (isEmpty(formData.Hematology?.Hematocrit)) {
        newErrors.Hematocrit = "Hematocrit is required.";
      } else if (isNaN(formData.Hematology.Hematocrit)) {
        newErrors.Hematocrit = "Hematocrit must be a number.";
      }

      // Leukocyte Count
      if (isEmpty(formData.Hematology?.LeukocyteCount)) {
        newErrors.LeukocyteCount = "Leukocyte Count is required.";
      } else if (isNaN(formData.Hematology.LeukocyteCount)) {
        newErrors.LeukocyteCount = "Leukocyte Count must be a number.";
      }

      // Differential Count Fields
      const differentialFields = [
        "segmenters",
        "lymphocytes",
        "monocytes",
        "eosinophils",
        "basophils",
        "total",
      ];

      differentialFields.forEach((field) => {
        const key = `DifferentialCount.${field}`;
        if (isEmpty(formData.Hematology?.DifferentialCount?.[field])) {
          newErrors[key] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required.`;
        } else if (isNaN(formData.Hematology.DifferentialCount[field])) {
          newErrors[key] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be a number.`;
        }
      });

      // Platelet Count
      if (isEmpty(formData.Hematology?.PlateletCount)) {
        newErrors.PlateletCount = "Platelet Count is required.";
      } else if (isNaN(formData.Hematology.PlateletCount)) {
        newErrors.PlateletCount = "Platelet Count must be a number.";
      }
    }

    if (requestedCategories.includes("bleedingTimeClottingTime")) {
      if (isEmpty(formData.Hematology?.others)) {
        newErrors.others = "This field is required.";
      }
    }

    // Validate Clinical Microscopy and Parasitology Fields

    if (requestedCategories.includes("routineUrinalysis")) {
      if (
        isEmpty(formData.clinicalMicroscopyParasitology?.routineUrinalysis.LMP)
      ) {
        newErrors["routineUrinalysis.LMP"] = "LMP is required.";
      }

      // Macroscopic Examination
      const macroscopicFields = ["color", "appearance"];
      macroscopicFields.forEach((field) => {
        const key = `routineUrinalysis.macroscopicExam.${field}`;
        if (
          isEmpty(
            formData.clinicalMicroscopyParasitology?.routineUrinalysis
              .macroscopicExam[field]
          )
        ) {
          newErrors[key] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required.`;
        }
      });

      // Chemical Examination
      const chemicalFields = [
        "sugar",
        "albumin",
        "blood",
        "bilirubin",
        "urobilinogen",
        "ketones",
        "nitrites",
        "leukocytes",
        "reaction",
        "specificGravity",
      ];

      chemicalFields.forEach((field) => {
        const key = `routineUrinalysis.chemicalExam.${field}`;
        const value =
          formData.clinicalMicroscopyParasitology?.routineUrinalysis
            ?.chemicalExam?.[field];
        if (isEmpty(value)) {
          newErrors[key] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required.`;
        } else if (
          [
            "sugar",
            "albumin",
            "blood",
            "bilirubin",
            "urobilinogen",
            "ketones",
            "nitrites",
            "leukocytes",
            "reaction",
            "specificGravity",
          ].includes(field)
        ) {
          if (isNaN(value)) {
            newErrors[key] = `${
              field.charAt(0).toUpperCase() + field.slice(1)
            } must be a number.`;
          }
        }
      });

      // Microscopic Examination
      const microscopicFields = [
        "pusCells",
        "RBC",
        "epithelialCells",
        "casts",
        "crystals",
        "bacteria",
        "yeastCells",
        "mucusThreads",
        "amorphous",
        "others",
      ];

      microscopicFields.forEach((field) => {
        const key = `routineUrinalysis.microscopicExam.${field}`;
        const value =
          formData.clinicalMicroscopyParasitology?.routineUrinalysis
            ?.microscopicExam?.[field];
        if (isEmpty(value)) {
          newErrors[key] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required.`;
        }
      });
    }

    // Validate Routine Fecalysis
    if (requestedCategories.includes("routineStoolExamination")) {
      if (
        isEmpty(
          formData.clinicalMicroscopyParasitology?.routineFecalysis?.color
        )
      ) {
        newErrors["routineFecalysis.color"] = "Color is required.";
      }

      if (
        isEmpty(
          formData.clinicalMicroscopyParasitology?.routineFecalysis?.consistency
        )
      ) {
        newErrors["routineFecalysis.consistency"] = "Consistency is required.";
      }
    }

    if (requestedCategories.includes("katoThickSmear")) {
      // Microscopic Examination
      const fecalMicroscopicFields = ["directFecalSmear", "katoThickSmear"];
      fecalMicroscopicFields.forEach((field) => {
        const key = `routineFecalysis.microscopicExam.${field}`;
        const value =
          formData.clinicalMicroscopyParasitology?.routineFecalysis
            ?.microscopicExam?.[field];
        if (isEmpty(value)) {
          newErrors[key] = `${
            field === "directFecalSmear"
              ? "Direct Fecal Smear"
              : "Kato Thick Smear"
          } is required.`;
        }
      });
    }

    if (requestedCategories.includes("fecalOccultBloodTest")) {
      if (
        isEmpty(
          formData.clinicalMicroscopyParasitology?.routineFecalysis?.others
        )
      ) {
        newErrors["routineFecalysis.others"] = "Others field is required.";
      }
    }

    // Validate Blood Banking Serology Fields
    if (requestedCategories.includes("hepatitisBSurfaceAntigen")) {
      // Hepatitis B Surface Antigen
      if (
        isEmpty(
          formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.methodUsed
        )
      ) {
        newErrors.hepatitisBSurfaceAntigenMethodUsed =
          "Method Used is required for Hepatitis B Surface Antigen.";
      }
      if (
        isEmpty(
          formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.lotNumber
        )
      ) {
        newErrors.hepatitisBSurfaceAntigenLotNumber =
          "Lot Number is required for Hepatitis B Surface Antigen.";
      }
      if (
        isEmpty(
          formData.bloodBankingSerology?.hepatitisBSurfaceAntigen
            ?.expirationDate
        )
      ) {
        newErrors.hepatitisBSurfaceAntigenExpirationDate =
          "Expiration Date is required for Hepatitis B Surface Antigen.";
      }
      if (
        isEmpty(formData.bloodBankingSerology?.hepatitisBSurfaceAntigen?.result)
      ) {
        newErrors.hepatitisBSurfaceAntigenResult =
          "Result is required for Hepatitis B Surface Antigen.";
      }
    }
    if (requestedCategories.includes("pregnancyTest")) {
      // Serum Pregnancy
      if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.methodUsed)) {
        newErrors.serumPregnancyMethodUsed =
          "Method Used is required for Serum Pregnancy.";
      }
      if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.lotNumber)) {
        newErrors.serumPregnancyLotNumber =
          "Lot Number is required for Serum Pregnancy.";
      }
      if (
        isEmpty(formData.bloodBankingSerology?.serumPregnancy?.expirationDate)
      ) {
        newErrors.serumPregnancyExpirationDate =
          "Expiration Date is required for Serum Pregnancy.";
      }
      if (isEmpty(formData.bloodBankingSerology?.serumPregnancy?.result)) {
        newErrors.serumPregnancyResult =
          "Result is required for Serum Pregnancy.";
      }
    }

    if (requestedCategories.includes("testForSalmonellaTyphi")) {
      // Salmonella Typhi
      if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.methodUsed)) {
        newErrors.salmonellaTyphiMethodUsed =
          "Method Used is required for Salmonella Typhi.";
      }
      if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.lotNumber)) {
        newErrors.salmonellaTyphiLotNumber =
          "Lot Number is required for Salmonella Typhi.";
      }
      if (
        isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.expirationDate)
      ) {
        newErrors.salmonellaTyphiExpirationDate =
          "Expiration Date is required for Salmonella Typhi.";
      }
      if (isEmpty(formData.bloodBankingSerology?.salmonellaTyphi?.result)) {
        newErrors.salmonellaTyphiResult =
          "Result is required for Salmonella Typhi.";
      }
    }

    if (requestedCategories.includes("dengueTest")) {
      // Test Dengue
      if (isEmpty(formData.bloodBankingSerology?.testDengue?.methodUsed)) {
        newErrors.testDengueMethodUsed =
          "Method Used is required for Test Dengue.";
      }
      if (isEmpty(formData.bloodBankingSerology?.testDengue?.lotNumber)) {
        newErrors.testDengueLotNumber =
          "Lot Number is required for Test Dengue.";
      }
      if (isEmpty(formData.bloodBankingSerology?.testDengue?.expirationDate)) {
        newErrors.testDengueExpirationDate =
          "Expiration Date is required for Test Dengue.";
      }
      if (isEmpty(formData.bloodBankingSerology?.testDengue?.result)) {
        newErrors.testDengueResult = "Result is required for Test Dengue.";
      }
    }

    if (requestedCategories.includes("antiHCV")) {
      // Anti HAV Test
      if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.methodUsed)) {
        newErrors.antiHAVTestMethodUsed =
          "Method Used is required for Anti HAV Test.";
      }
      if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.lotNumber)) {
        newErrors.antiHAVTestLotNumber =
          "Lot Number is required for Anti HAV Test.";
      }
      if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.expirationDate)) {
        newErrors.antiHAVTestExpirationDate =
          "Expiration Date is required for Anti HAV Test.";
      }
      if (isEmpty(formData.bloodBankingSerology?.antiHAVTest?.result)) {
        newErrors.antiHAVTestResult = "Result is required for Anti HAV Test.";
      }
    }

    if (requestedCategories.includes("antiTreponemaPallidum")) {
      // Treponema Pallidum Test
      if (
        isEmpty(
          formData.bloodBankingSerology?.treponemaPallidumTest?.methodUsed
        )
      ) {
        newErrors.treponemaPallidumTestMethodUsed =
          "Method Used is required for Treponema Pallidum Test.";
      }
      if (
        isEmpty(formData.bloodBankingSerology?.treponemaPallidumTest?.lotNumber)
      ) {
        newErrors.treponemaPallidumTestLotNumber =
          "Lot Number is required for Treponema Pallidum Test.";
      }
      if (
        isEmpty(
          formData.bloodBankingSerology?.treponemaPallidumTest?.expirationDate
        )
      ) {
        newErrors.treponemaPallidumTestExpirationDate =
          "Expiration Date is required for Treponema Pallidum Test.";
      }
      if (
        isEmpty(formData.bloodBankingSerology?.treponemaPallidumTest?.result)
      ) {
        newErrors.treponemaPallidumTestResult =
          "Result is required for Treponema Pallidum Test.";
      }
    }
    if (requestedCategories.includes("bloodTyping")) {
      // Blood Typing
      if (isEmpty(formData.bloodBankingSerology?.bloodTyping?.ABOType)) {
        newErrors.bloodTypingABOType = "ABO Type is required for Blood Typing.";
      }
      if (isEmpty(formData.bloodBankingSerology?.bloodTyping?.RhType)) {
        newErrors.bloodTypingRhType = "Rh Type is required for Blood Typing.";
      }
    }
    if (requestedCategories.includes("HIVELsa")) {
      // Others
      if (isEmpty(formData.bloodBankingSerology?.others?.methodUsed)) {
        newErrors.othersMethodUsed = "Method Used is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.lotNumber)) {
        newErrors.othersLotNumber = "Lot Number is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.expirationDate)) {
        newErrors.othersExpirationDate =
          "Expiration Date is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.result)) {
        newErrors.othersResult = "Result is required for Others.";
      }
    }

    if (requestedCategories.includes("HIVRapidTest")) {
      // Others
      if (isEmpty(formData.bloodBankingSerology?.others?.methodUsed)) {
        newErrors.othersMethodUsed = "Method Used is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.lotNumber)) {
        newErrors.othersLotNumber = "Lot Number is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.expirationDate)) {
        newErrors.othersExpirationDate =
          "Expiration Date is required for Others.";
      }
      if (isEmpty(formData.bloodBankingSerology?.others?.result)) {
        newErrors.othersResult = "Result is required for Others.";
      }
    }

    // Set the error messages
    setErrorMessage(newErrors);

    // Determine if there are any errors
    const hasErrors = Object.keys(newErrors).length > 0;

    return !hasErrors; // Returns true if no errors
  };

  const handleSaveResult = async () => {
    if (!validateForm()) {
      return; // Stop submission if there are validation errors
    }

    console.log("Current form data:", formData);

    const {
      ORNumber,
      labNumber,
      patient,
      clinicId,
      laboratoryId, // Include laboratoryId in the data to be sent
      bloodChemistry,
      Hematology,
      clinicalMicroscopyParasitology,
      bloodBankingSerology,
    } = formData;

    const dataToSend = {
      ORNumber,
      labNumber,
      patient,
      clinicId,
      laboratoryId, // Include laboratoryId here
      bloodChemistry,
      Hematology,
      clinicalMicroscopyParasitology,
      bloodBankingSerology,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/api/laboratory-results`,
        dataToSend,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      if (response.status === 200) {
        console.log("Laboratory result saved successfully:", response.data);

        // Step 2: Update labResult to "complete" in Laboratory after successful save
        await axios.put(
          `${apiUrl}/api/laboratory/${laboratoryId}`,
          {
            labResult: "for verification",
          },
          {
            headers: {
              "api-key": api_Key,
            },
          }
        );
        closeModal(); // Close the modal
        fetchLabRecords();

        setFormData({
          ORNumber: "",
          labNumber: "",
          patient: "",
          clinicId: "",
          laboratoryId: "",
          bloodChemistry: {
            /* reset bloodChemistry fields */
          },
          Hematology: {
            /* reset Hematology fields */
          },
          clinicalMicroscopyParasitology: {
            /* reset clinicalMicroscopyParasitology fields */
          },
          bloodBankingSerology: {
            /* reset bloodBankingSerology fields */
          },
        });
        // Show success modal
        setShowSuccessModal(true);
      } else {
        console.error("Unexpected response status:", response.status);
        alert("Failed to save laboratory results. Please try again.");
      }
    } catch (error) {
      console.error("Error saving laboratory results:", error);
      alert("Failed to save laboratory results. Please try again.");
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
    setIsLabModalOpen(true);
  };

  const handleAddOPDSubmit = async (e) => {
    e.preventDefault();

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
  };

  const [isAddOPDModalOpen, setIsAddOPDModalOpen] = useState(false);

  const toggleAddOPDModal = () => {
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
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500"
                      >
                        No laboratory request found.
                      </td>
                    </tr>
                  ) : (
                    currentLabRecords.map((record, index) => {
                      const allTests = [
                        ...Object.entries(record.bloodChemistry)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.hematology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.clinicalMicroscopyParasitology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.bloodBankingSerology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.microbiology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr key={record._id} className="border-b">
                          <td className="py-4">
                            {record.patient ? (
                              <>
                                <p className="font-semibold">
                                  {record.patient.lastname},{" "}
                                  {record.patient.firstname}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    record.isCreatedAt
                                  ).toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No patient data
                              </p>
                            )}
                          </td>
                          <td className="py-4">
                            <p className="font-semibold">
                              {allTests || "No test data available"}
                            </p>
                          </td>
                          <td className="py-4">
                            <p>{record.labResult}</p>
                          </td>
                          <td className="py-4 ">
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
                  {/* Blood Chemistry Section */}
                  {requestedCategories.includes("Blood Chemistry") && (
                    <div className="mb-0">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={toggleBloodChemistryVisibility}
                      >
                        <h3 className="text-lg font-semibold my-0 py-2">
                          I. Blood Chemistry
                        </h3>
                        <BiChevronDown
                          className={`transform transition-transform duration-300 ${
                            isBloodChemistryVisible ? "rotate-180" : ""
                          }`}
                          size={24}
                        />
                      </div>
                      <div className="w-full h-px bg-gray-300 my-0"></div>

                      {isBloodChemistryVisible && (
                        <div className="grid grid-cols-3 gap-4 p-4">
                          <div className="col-span-1 font-semibold">Test</div>
                          <div className="col-span-1 font-semibold">Result</div>
                          <div className="col-span-1 font-semibold">
                            Reference Range
                          </div>

                          {/* FBS */}
                          <div className="col-span-1">FBS</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="bloodSugar"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("bloodSugar")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.bloodChemistry?.bloodSugar || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "bloodSugar"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("bloodSugar")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.bloodSugar &&
                              errorMessage.bloodSugar && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.bloodSugar}
                                </p>
                              )}
                            {formData.bloodChemistry?.bloodSugar && (
                              <>
                                {formData.bloodChemistry?.bloodSugar < 70 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.bloodChemistry?.bloodSugar >
                                  105 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">70 - 105 mg/dL</div>

                          {/* Total Cholesterol */}
                          <div className="col-span-1">Total Cholesterol</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="totalCholesterol"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("totalCholesterol")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.totalCholesterol || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "totalCholesterol"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "totalCholesterol"
                                )
                              }
                              required
                            />
                            {!formData.bloodChemistry?.totalCholesterol &&
                              errorMessage.totalCholesterol && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.totalCholesterol}
                                </p>
                              )}
                            {formData.bloodChemistry?.totalCholesterol && (
                              <>
                                {formData.bloodChemistry?.totalCholesterol <
                                140 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.bloodChemistry?.totalCholesterol >
                                  200 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">140 - 200 mg/dL</div>

                          {/* Triglycerides */}
                          <div className="col-span-1">Triglycerides</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="triglyceride"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("triglyceride")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.triglyceride || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "triglyceride"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("triglyceride")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.triglyceride &&
                              errorMessage.triglyceride && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.triglyceride}
                                </p>
                              )}
                            {formData.bloodChemistry?.triglyceride && (
                              <>
                                {formData.bloodChemistry?.triglyceride > 200 ? (
                                  <span className="text-red-500">Above</span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">{"<200 mg/dL"}</div>

                          {/* Blood Uric Acid */}
                          <div className="col-span-1">Blood Uric Acid</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="bloodUricAcid"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("bloodUricAcid")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.bloodUricAcid || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "bloodUricAcid"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("bloodUricAcid")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.bloodUricAcid &&
                              errorMessage.bloodUricAcid && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.bloodUricAcid}
                                </p>
                              )}
                            {formData.bloodChemistry?.bloodUricAcid && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.bloodChemistry.bloodUricAcid <
                                  3.5 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.bloodUricAcid >
                                    7.2 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.bloodChemistry.bloodUricAcid <
                                  2.6 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.bloodUricAcid >
                                    6.0 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            MEN: 3.5 - 7.2 mg/dL <br />
                            WOMEN: 2.6 - 6.0 mg/dL
                          </div>

                          {/* Blood Urea Nitrogen */}
                          <div className="col-span-1">Blood Urea Nitrogen</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="bloodUreaNitrogen"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "bloodUreaNitrogen"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.bloodUreaNitrogen || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "bloodUreaNitrogen"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "bloodUreaNitrogen"
                                )
                              }
                              required
                            />
                            {!formData.bloodChemistry?.bloodUreaNitrogen &&
                              errorMessage.bloodUreaNitrogen && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.bloodUreaNitrogen}
                                </p>
                              )}
                            {formData.bloodChemistry?.bloodUreaNitrogen && (
                              <>
                                {formData.bloodChemistry?.bloodUreaNitrogen <
                                4.67 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.bloodChemistry?.bloodUreaNitrogen >
                                  23.35 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">4.67 - 23.35 mg/dL</div>

                          {/* Creatinine */}
                          <div className="col-span-1">Creatinine</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="creatinine"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("creatinine")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.bloodChemistry?.creatinine || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "creatinine"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("creatinine")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.creatinine &&
                              errorMessage.creatinine && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.creatinine}
                                </p>
                              )}
                            {formData.bloodChemistry?.creatinine && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.bloodChemistry.creatinine < 0.7 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.creatinine >
                                    1.2 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.bloodChemistry.creatinine < 0.6 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.creatinine >
                                    1.1 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            MEN: 0.7 - 1.2 mg/dL <br />
                            WOMEN: 0.6 - 1.1 mg/dL
                          </div>

                          {/* AST/SGOT */}
                          <div className="col-span-1">AST/SGOT</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="SGOT_AST"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("SGOT_AST")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.bloodChemistry?.SGOT_AST || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "SGOT_AST"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("SGOT_AST")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.SGOT_AST &&
                              errorMessage.SGOT_AST && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.SGOT_AST}
                                </p>
                              )}
                            {formData.bloodChemistry?.SGOT_AST && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.bloodChemistry.SGOT_AST > 40 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.bloodChemistry.SGOT_AST > 33 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            MEN: UP TO 40 U/L <br />
                            WOMEN: UP TO 33 U/L
                          </div>

                          {/* ALT/SGPT */}
                          <div className="col-span-1">ALT/SGPT</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="SGPT_ALT"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("SGPT_ALT")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.bloodChemistry?.SGPT_ALT || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "SGPT_ALT"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("SGPT_ALT")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.SGPT_ALT &&
                              errorMessage.SGPT_ALT && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.SGPT_ALT}
                                </p>
                              )}
                            {formData.bloodChemistry?.SGPT_ALT && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.bloodChemistry.SGPT_ALT > 41 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.bloodChemistry.SGPT_ALT > 32 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            MEN: UP TO 41 U/L <br />
                            WOMEN: UP TO 32 U/L
                          </div>

                          {/* Direct HDL */}
                          <div className="col-span-1">Direct HDL</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="HDL_cholesterol"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("HDL_cholesterol")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.HDL_cholesterol || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "HDL_cholesterol"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("HDL_cholesterol")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.HDL_cholesterol &&
                              errorMessage.HDL_cholesterol && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.HDL_cholesterol}
                                </p>
                              )}
                            {formData.bloodChemistry?.HDL_cholesterol && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.bloodChemistry.HDL_cholesterol <
                                  0.7 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.HDL_cholesterol >
                                    1.2 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.bloodChemistry.HDL_cholesterol <
                                  0.6 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.bloodChemistry.HDL_cholesterol >
                                    1.1 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            MEN: 40 - 50 mg/dL <br />
                            WOMEN: 45 - 60 mg/dL
                          </div>

                          {/* Direct LDL */}
                          <div className="col-span-1">Direct LDL</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="LDL_cholesterol"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes("LDL_cholesterol")
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.bloodChemistry?.LDL_cholesterol || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "bloodChemistry",
                                  "LDL_cholesterol"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes("LDL_cholesterol")
                              }
                              required
                            />
                            {!formData.bloodChemistry?.LDL_cholesterol &&
                              errorMessage.LDL_cholesterol && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.LDL_cholesterol}
                                </p>
                              )}
                            {formData.bloodChemistry?.LDL_cholesterol && (
                              <>
                                {formData.bloodChemistry?.LDL_cholesterol >
                                130 ? (
                                  <span className="text-red-500">Above</span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">{"<130 mg/dL"}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hematology Section */}
                  {requestedCategories.includes("Hematology") && (
                    <div className="mb-0">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={toggleHematologyVisibility}
                      >
                        <h3 className="text-lg font-semibold my-0 py-2">
                          II. Hematology
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

                          {/* Red Blood Cell Count */}
                          <div className="col-span-1">Red Blood Cell Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="redBloodCellCount"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.redBloodCellCount || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "redBloodCellCount"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.redBloodCellCount &&
                              errorMessage.redBloodCellCount && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.redBloodCellCount}
                                </p>
                              )}
                            {formData.Hematology?.redBloodCellCount && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.Hematology.redBloodCellCount <
                                  4.0 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.redBloodCellCount >
                                    5.5 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.Hematology.redBloodCellCount <
                                  3.5 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.redBloodCellCount >
                                    5.0 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            Male: 4.0 - 5.5 x10^12/L; Female: 3.5 - 5.0 x10^12/L
                          </div>

                          <div className="col-span-1">Hemoglobin</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="hemoglobin"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.Hematology?.Hemoglobin || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "Hemoglobin")
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.Hemoglobin &&
                              errorMessage.Hemoglobin && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.Hemoglobin}
                                </p>
                              )}
                            {formData.Hematology?.Hemoglobin && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.Hematology.Hemoglobin < 140 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.Hemoglobin > 180 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.Hematology.Hemoglobin < 120 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.Hemoglobin > 180 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            Male: 140 - 180 g/L; Female: 120 - 180 g/L
                          </div>

                          <div className="col-span-1">Hematocrit</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="hematocrit"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.Hematology?.Hematocrit || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "Hematocrit")
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.Hematocrit &&
                              errorMessage.Hematocrit && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.Hematocrit}
                                </p>
                              )}
                            {formData.Hematology?.Hemoglobin && (
                              <>
                                {formData.sex === "Male" ? (
                                  formData.Hematology.Hemoglobin < 0.4 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.Hemoglobin > 0.54 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : formData.sex === "Female" ? (
                                  formData.Hematology.Hemoglobin < 0.37 ? (
                                    <span className="text-red-500 text-sm">
                                      Below Reference Range
                                    </span>
                                  ) : formData.Hematology.Hemoglobin > 0.47 ? (
                                    <span className="text-red-500 text-sm">
                                      Above Reference Range
                                    </span>
                                  ) : null
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">
                            Male: 0.40 - 0.54; Female: 0.37 - 0.47
                          </div>

                          <div className="col-span-1">Leukocyte Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="leukocyteCount"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.Hematology?.LeukocyteCount || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "LeukocyteCount"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.LeukocyteCount &&
                              errorMessage.LeukocyteCount && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.LeukocyteCount}
                                </p>
                              )}
                            {formData.Hematology?.LeukocyteCount && (
                              <>
                                {formData.Hematology?.LeukocyteCount < 5.0 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.LeukocyteCount >
                                  10.0 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
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
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount
                                  ?.segmenters || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "segmenters"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.DifferentialCount
                              ?.segmenters &&
                              errorMessage["DifferentialCount.segmenters"] && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage["DifferentialCount.segmenters"]}
                                </p>
                              )}
                            {formData.Hematology?.DifferentialCount
                              ?.segmenters && (
                              <>
                                {formData.Hematology?.DifferentialCount
                                  ?.segmenters < 0.5 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.DifferentialCount
                                    ?.segmenters > 0.7 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">0.50 - 0.70</div>

                          <div className="col-span-1 ml-9">Lymphocytes</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="lymphocytes"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount
                                  ?.lymphocytes || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "lymphocytes"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.DifferentialCount
                              ?.lymphocytes &&
                              errorMessage["DifferentialCount.lymphocytes"] && (
                                <p className="text-red-500 text-sm">
                                  {
                                    errorMessage[
                                      "DifferentialCount.lymphocytes"
                                    ]
                                  }
                                </p>
                              )}
                            {formData.Hematology?.DifferentialCount
                              ?.lymphocytes && (
                              <>
                                {formData.Hematology?.DifferentialCount
                                  ?.lymphocytes < 0.2 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.DifferentialCount
                                    ?.lymphocytes > 0.4 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">0.20 - 0.40</div>

                          <div className="col-span-1 ml-9">Monocytes</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="monocytes"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount
                                  ?.monocytes || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "monocytes"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.DifferentialCount
                              ?.monocytes &&
                              errorMessage["DifferentialCount.monocytes"] && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage["DifferentialCount.monocytes"]}
                                </p>
                              )}
                            {formData.Hematology?.DifferentialCount
                              ?.monocytes && (
                              <>
                                {formData.Hematology?.DifferentialCount
                                  ?.monocytes < 0.0 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.DifferentialCount
                                    ?.monocytes > 0.07 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">0.00 - 0.07</div>

                          <div className="col-span-1 ml-9">Eosinophils</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="eosinophils"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount
                                  ?.eosinophils || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "eosinophils"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                            />
                            {!formData.Hematology?.DifferentialCount
                              ?.eosinophils &&
                              errorMessage["DifferentialCount.eosinophils"] && (
                                <p className="text-red-500 text-sm">
                                  {
                                    errorMessage[
                                      "DifferentialCount.eosinophils"
                                    ]
                                  }
                                </p>
                              )}
                            {formData.Hematology?.DifferentialCount
                              ?.eosinophils && (
                              <>
                                {formData.Hematology?.DifferentialCount
                                  ?.eosinophils < 0.0 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.DifferentialCount
                                    ?.eosinophils > 0.05 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">0.00 - 0.05</div>

                          <div className="col-span-1 ml-9">Basophils</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="basophils"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount
                                  ?.basophils || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "basophils"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.basophils &&
                              errorMessage["DifferentialCount.basophils"] && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage["DifferentialCount.basophils"]}
                                </p>
                              )}
                          </div>
                          <div className="col-span-1">0.00 - 0.01</div>

                          <div className="col-span-1 ml-9">Total</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="total"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={
                                formData.Hematology?.DifferentialCount?.total ||
                                ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "DifferentialCount",
                                  "total"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.total &&
                              errorMessage["DifferentialCount.total"] && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage["DifferentialCount.total"]}
                                </p>
                              )}
                          </div>
                          <div className="col-span-1"></div>

                          <div className="col-span-1">Platelet Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="plateletCount"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "completeBloodCount"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.Hematology?.PlateletCount || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "PlateletCount"
                                )
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "completeBloodCount"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.PlateletCount &&
                              errorMessage.PlateletCount && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.PlateletCount}
                                </p>
                              )}
                            {formData.Hematology?.PlateletCount && (
                              <>
                                {formData.Hematology?.PlateletCount < 150 ? (
                                  <span className="text-red-500 text-sm">
                                    Below Reference Range
                                  </span>
                                ) : formData.Hematology?.PlateletCount > 400 ? (
                                  <span className="text-red-500 text-sm">
                                    Above Reference Range
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <div className="col-span-1">150 - 400 x10^9/L</div>

                          <div className="col-span-1">Others</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="others"
                              className={`w-full px-3 py-1 border rounded bg-gray-100 ${
                                requestedCategories.includes(
                                  "bleedingTimeClottingTime"
                                )
                                  ? "border-green-400"
                                  : ""
                              }`}
                              value={formData.Hematology?.others || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "others")
                              }
                              readOnly={
                                !requestedCategories.includes(
                                  "bleedingTimeClottingTime"
                                )
                              }
                              required
                            />
                            {!formData.Hematology?.others &&
                              errorMessage.others && (
                                <p className="text-red-500 text-sm">
                                  {errorMessage.others}
                                </p>
                              )}
                          </div>
                          <div className="col-span-1"></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clinical Microscopy and Parasitology Section */}
                  {requestedCategories.includes(
                    "Clinical Microscopy and Parasitology"
                  ) && (
                    <div className="mb-0">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={toggleClinicalMicroscopyVisibility}
                      >
                        <h3 className="text-lg font-semibold mb-0 py-2">
                          III. Clinical Microscopy and Parasitology
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
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.LMP || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                null,
                                "LMP"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage["routineUrinalysis.LMP"] && (
                            <p className="text-red-500 text-sm">
                              {errorMessage["routineUrinalysis.LMP"]}
                            </p>
                          )}
                          <h4 className="col-span-6 font-semibold">
                            Macroscopic Examination
                          </h4>
                          <label className="col-span-1">Color</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.macroscopicExam?.color ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "macroscopicExam",
                                "color"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                          />
                          {errorMessage[
                            "routineUrinalysis.macroscopicExam.color"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.macroscopicExam.color"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Appearance</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.macroscopicExam
                                ?.appearance || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "macroscopicExam",
                                "appearance"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.macroscopicExam.appearance"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.macroscopicExam.appearance"
                                ]
                              }
                            </p>
                          )}

                          {/* Routine Urinalysis - Chemical Examination */}
                          <h4 className="col-span-6 font-semibold mt-4">
                            Chemical Examination
                          </h4>
                          <label className="col-span-1">Sugar</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.sugar || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "sugar"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.sugar"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.sugar"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Urobilinogen</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam
                                ?.urobilinogen || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "urobilinogen"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.urobilinogen"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.urobilinogen"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Albumin</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.albumin || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "albumin"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.albumin"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.albumin"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Ketones</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.ketones || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "ketones"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.ketones"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.ketones"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Blood</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.blood || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "blood"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.blood"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.blood"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Nitrite</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.nitrites ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "nitrites"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.nitrites"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.nitrites"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Bilirubin</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.bilirubin ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "bilirubin"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.bilirubin"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.bilirubin"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Leukocyte</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.leukocytes ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "leukocytes"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.leukocytes"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.leukocytes"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Reaction</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam?.reaction ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "reaction"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.reaction"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.reaction"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Specific Gravity</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.chemicalExam
                                ?.specificGravity || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "chemicalExam",
                                "specificGravity"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.chemicalExam.specificGravity"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.chemicalExam.specificGravity"
                                ]
                              }
                            </p>
                          )}

                          {/* Routine Urinalysis - Microscopic Examination */}
                          <h4 className="col-span-6 font-semibold mt-4">
                            Microscopic Examination
                          </h4>
                          <label className="col-span-1">Pus Cells</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/hpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.pusCells || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "pusCells"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.pusCells"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.pusCells"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Epithelial Cells</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/lpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.epithelialCells || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "epithelialCells"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.epithelialCells"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.epithelialCells"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Red Blood Cells</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/hpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam?.RBC || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "RBC"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.RBC"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.RBC"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Mucus Threads</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/lpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.mucusThreads || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "mucusThreads"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.mucusThreads"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.mucusThreads"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Bacteria</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/hpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.bacteria || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "bacteria"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.bacteria"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.bacteria"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Crystals</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/lpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.crystals || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "crystals"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.crystals"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.crystals"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Yeast Cells</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/hpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.yeastCells || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "yeastCells"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.yeastCells"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.yeastCells"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Amorphous</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/lpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam
                                ?.amorphous || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "amorphous"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.amorphous"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.amorphous"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Cast</label>
                          <input
                            type="text"
                            className={`col-span-1 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            placeholder="/lpf"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam?.casts ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "casts"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.casts"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.casts"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Others</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("routineUrinalysis")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineUrinalysis?.microscopicExam?.others ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineUrinalysis",
                                "microscopicExam",
                                "others"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("routineUrinalysis")
                            }
                            required
                          />
                          {errorMessage[
                            "routineUrinalysis.microscopicExam.others"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineUrinalysis.microscopicExam.others"
                                ]
                              }
                            </p>
                          )}

                          {/* Routine Fecalysis */}
                          <h4 className="col-span-6 font-semibold mt-4">
                            Routine Fecalysis
                          </h4>
                          <label className="col-span-1">Color</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "routineStoolExamination"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.color || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                null,
                                "color"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "routineStoolExamination"
                              )
                            }
                            required
                          />
                          {errorMessage["routineFecalysis.color"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["routineFecalysis.color"]}
                            </p>
                          )}
                          <label className="col-span-1">Consistency</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "routineStoolExamination"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.consistency || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                null,
                                "consistency"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "routineStoolExamination"
                              )
                            }
                            required
                          />
                          {errorMessage["routineFecalysis.color"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["routineFecalysis.color"]}
                            </p>
                          )}

                          {/* Microscopic Examination for Fecalysis */}
                          <h4 className="col-span-6 font-semibold mt-4">
                            Microscopic Examination
                          </h4>
                          <label className="col-span-1">
                            Direct Fecal Smear
                          </label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes("katoThickSmear")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.microscopicExam
                                ?.directFecalSmear || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                "microscopicExam",
                                "directFecalSmear"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("katoThickSmear")
                            }
                            required
                          />
                          {errorMessage[
                            "routineFecalysis.microscopicExam.directFecalSmear"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineFecalysis.microscopicExam.directFecalSmear"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Kato Thick Smear</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes("katoThickSmear")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.microscopicExam
                                ?.katoThickSmear || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                "microscopicExam",
                                "katoThickSmear"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("katoThickSmear")
                            }
                            required
                          />
                          {errorMessage[
                            "routineFecalysis.microscopicExam.katoThickSmear"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "routineFecalysis.microscopicExam.katoThickSmear"
                                ]
                              }
                            </p>
                          )}

                          <label className="col-span-1">Others</label>
                          <input
                            type="text"
                            className={`col-span-2 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "fecalOccultBloodTest"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.others || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                null,
                                "others"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "fecalOccultBloodTest"
                              )
                            }
                            required
                          />
                          {errorMessage["routineFecalysis.others"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["routineFecalysis.others"]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Serology Section */}
                  {requestedCategories.includes("Serology") && (
                    <div className="mb-0">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={toggleSerologyVisibility}
                      >
                        <h3 className="text-lg font-semibold mb-0 py-2">
                          IV. Serology
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
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.hepatitisBSurfaceAntigen?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "hepatitisBSurfaceAntigen",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                            }
                            required
                          />
                          {errorMessage[
                            "hepatitisBSurfaceAntigenMethodUsed"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "hepatitisBSurfaceAntigenMethodUsed"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("antiHCV")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.antiHAVTest
                                ?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "antiHAVTest",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={!requestedCategories.includes("antiHCV")}
                            required
                          />
                          {errorMessage["antiHAVTestMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["antiHAVTestMethodUsed"]}
                            </p>
                          )}

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.hepatitisBSurfaceAntigen?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "hepatitisBSurfaceAntigen",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                            }
                            required
                          />
                          {errorMessage[
                            "hepatitisBSurfaceAntigenLotNumber"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "hepatitisBSurfaceAntigenLotNumber"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("antiHCV")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.antiHAVTest
                                ?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "antiHAVTest",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={!requestedCategories.includes("antiHCV")}
                            required
                          />
                          {errorMessage["antiHAVTestLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["antiHAVTestLotNumber"]}
                            </p>
                          )}

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.hepatitisBSurfaceAntigen?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "hepatitisBSurfaceAntigen",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                            }
                            required
                          />
                          {errorMessage[
                            "hepatitisBSurfaceAntigenExpirationDate"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "hepatitisBSurfaceAntigenExpirationDate"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("antiHCV")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.antiHAVTest
                                ?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "antiHAVTest",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={!requestedCategories.includes("antiHCV")}
                            required
                          />
                          {errorMessage["antiHAVTestExpirationDate"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["antiHAVTestExpirationDate"]}
                            </p>
                          )}

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.hepatitisBSurfaceAntigen?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "hepatitisBSurfaceAntigen",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "hepatitisBSurfaceAntigen"
                              )
                            }
                            required
                          />
                          {errorMessage["hepatitisBSurfaceAntigenResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["hepatitisBSurfaceAntigenResult"]}
                            </p>
                          )}
                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("antiHCV")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.antiHAVTest
                                ?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "antiHAVTest",
                                null,
                                "result"
                              )
                            }
                            readOnly={!requestedCategories.includes("antiHCV")}
                            required
                          />
                          {errorMessage["antiHAVTestResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["antiHAVTestResult"]}
                            </p>
                          )}

                          {/* Serum Pregnancy and Test for Treponema pallidum / Syphilis */}
                          <h4 className="col-span-6 font-semibold">
                            Test for Treponema pallidum / Syphilis
                          </h4>
                          <h4 className="col-span-6 font-semibold">
                            Serum Pregnancy
                          </h4>
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.treponemaPallidumTest?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "treponemaPallidumTest",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                            }
                            required
                          />
                          {errorMessage["treponemaPallidumTestMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["treponemaPallidumTestMethodUsed"]}
                            </p>
                          )}

                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("pregnancyTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.serumPregnancy
                                ?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "serumPregnancy",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("pregnancyTest")
                            }
                            required
                          />
                          {errorMessage["serumPregnancyMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["serumPregnancyMethodUsed"]}
                            </p>
                          )}

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.treponemaPallidumTest?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "treponemaPallidumTest",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                            }
                            required
                          />
                          {errorMessage["treponemaPallidumTestLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["treponemaPallidumTestLotNumber"]}
                            </p>
                          )}

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("pregnancyTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.serumPregnancy
                                ?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "serumPregnancy",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("pregnancyTest")
                            }
                            required
                          />
                          {errorMessage["serumPregnancyLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["serumPregnancyLotNumber"]}
                            </p>
                          )}

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.treponemaPallidumTest?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "treponemaPallidumTest",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                            }
                            required
                          />
                          {errorMessage[
                            "treponemaPallidumTestExpirationDate"
                          ] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {
                                errorMessage[
                                  "treponemaPallidumTestExpirationDate"
                                ]
                              }
                            </p>
                          )}
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("pregnancyTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.serumPregnancy
                                ?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "serumPregnancy",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("pregnancyTest")
                            }
                            required
                          />
                          {errorMessage["serumPregnancyExpirationDate"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["serumPregnancyExpirationDate"]}
                            </p>
                          )}

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology
                                ?.treponemaPallidumTest?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "treponemaPallidumTest",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "antiTreponemaPallidum"
                              )
                            }
                            required
                          />
                          {errorMessage["treponemaPallidumTestResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["treponemaPallidumTestResult"]}
                            </p>
                          )}
                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("pregnancyTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.serumPregnancy
                                ?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "serumPregnancy",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("pregnancyTest")
                            }
                            required
                          />
                          {errorMessage["serumPregnancyResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["serumPregnancyResult"]}
                            </p>
                          )}

                          {/* Salmonella typhi and Blood Typing */}
                          <h4 className="col-span-6 font-semibold">
                            Salmonella typhi
                          </h4>
                          <h4 className="col-span-6 font-semibold">
                            Blood Typing
                          </h4>

                          <label className="col-span-1  ">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.salmonellaTyphi
                                ?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "salmonellaTyphi",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                            }
                            required
                          />
                          {errorMessage["salmonellaTyphiMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["salmonellaTyphiMethodUsed"]}
                            </p>
                          )}
                          <label className="col-span-1">ABO Type</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("bloodTyping")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.bloodTyping
                                ?.ABOType || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "bloodTyping",
                                null,
                                "ABOType"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("bloodTyping")
                            }
                            required
                          />
                          {errorMessage["bloodTypingABOType"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["bloodTypingABOType"]}
                            </p>
                          )}

                          <label className="col-span-1  ">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.salmonellaTyphi
                                ?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "salmonellaTyphi",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                            }
                            required
                          />
                          {errorMessage["salmonellaTyphiLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["salmonellaTyphiLotNumber"]}
                            </p>
                          )}
                          <label className="col-span-1">Rh Type</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("bloodTyping")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.bloodTyping
                                ?.RhType || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "bloodTyping",
                                null,
                                "RhType"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("bloodTyping")
                            }
                            required
                          />
                          {errorMessage["bloodTypingRhType"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["bloodTypingRhType"]}
                            </p>
                          )}

                          <label className="col-span-1  ">
                            Expiration Date
                          </label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.salmonellaTyphi
                                ?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "salmonellaTyphi",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                            }
                            required
                          />
                          {errorMessage["salmonellaTyphiExpirationDate"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["salmonellaTyphiExpirationDate"]}
                            </p>
                          )}

                          <label className="col-span-6"></label>

                          <label className="col-span-1  ">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.salmonellaTyphi
                                ?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "salmonellaTyphi",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes(
                                "testForSalmonellaTyphi"
                              )
                            }
                            required
                          />
                          {errorMessage["salmonellaTyphiResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["salmonellaTyphiResult"]}
                            </p>
                          )}
                          <label className="col-span-6"></label>

                          {/* Test for Dengue and Others */}
                          <h4 className="col-span-6 font-semibold">
                            Test for Dengue
                          </h4>
                          <h4 className="col-span-6 font-semibold">Others</h4>

                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("dengueTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.testDengue
                                ?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "testDengue",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("dengueTest")
                            }
                            required
                          />
                          {errorMessage["testDengueMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["testDengueMethodUsed"]}
                            </p>
                          )}
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("HIVElsa") ||
                              requestedCategories.includes("HIVRapidTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.others
                                ?.methodUsed || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "others",
                                null,
                                "methodUsed"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("HIVElsa") &&
                              !requestedCategories.includes("HIVRapidTest")
                            }
                            required
                          />
                          {errorMessage["othersMethodUsed"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["othersMethodUsed"]}
                            </p>
                          )}

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("dengueTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.testDengue
                                ?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "testDengue",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("dengueTest")
                            }
                            required
                          />
                          {errorMessage["testDengueLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["testDengueLotNumber"]}
                            </p>
                          )}
                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("HIVElsa") ||
                              requestedCategories.includes("HIVRapidTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.others
                                ?.lotNumber || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "others",
                                null,
                                "lotNumber"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("HIVElsa") &&
                              !requestedCategories.includes("HIVRapidTest")
                            }
                            required
                          />
                          {errorMessage["othersLotNumber"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["othersLotNumber"]}
                            </p>
                          )}

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("dengueTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.testDengue
                                ?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "testDengue",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("dengueTest")
                            }
                            required
                          />
                          {errorMessage["testDengueExpirationDate"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["testDengueExpirationDate"]}
                            </p>
                          )}
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("HIVElsa") ||
                              requestedCategories.includes("HIVRapidTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.others
                                ?.expirationDate || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "others",
                                null,
                                "expirationDate"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("HIVElsa") &&
                              !requestedCategories.includes("HIVRapidTest")
                            }
                            required
                          />
                          {errorMessage["othersExpirationDate"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["othersExpirationDate"]}
                            </p>
                          )}

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("dengueTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.testDengue
                                ?.result || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "testDengue",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("dengueTest")
                            }
                            required
                          />
                          {errorMessage["testDengueResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["testDengueResult"]}
                            </p>
                          )}

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className={`col-span-5 border rounded px-3 py-1 ${
                              requestedCategories.includes("HIVElsa") ||
                              requestedCategories.includes("HIVRapidTest")
                                ? "border-green-400"
                                : ""
                            }`}
                            value={
                              formData.bloodBankingSerology?.others?.result ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "bloodBankingSerology",
                                "others",
                                null,
                                "result"
                              )
                            }
                            readOnly={
                              !requestedCategories.includes("HIVElsa") &&
                              !requestedCategories.includes("HIVRapidTest")
                            }
                            required
                          />
                          {errorMessage["othersResult"] && (
                            <p className="text-red-500 text-sm col-span-6">
                              {errorMessage["othersResult"]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                      checked={
                        formReqData.bloodBankingSerology.dengueTest !== ""
                      }
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
                      checked={
                        formReqData.bloodBankingSerology.HIVRapidTest !== ""
                      }
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
