import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi"; // Import arrow icon
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function Laboratory() {
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
        macroscopicExam: {
          color: "",
          appearance: "",
        },
        LMP: "",
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
          `http://localhost:3001/patients/${record.patient._id}`
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
  const handleSaveResult = async () => {
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
        "http://localhost:3001/api/laboratory-results",
        dataToSend
      );

      if (response.status === 200) {
        console.log("Laboratory result saved successfully:", response.data);

        // Step 2: Update labResult to "complete" in Laboratory after successful save
        await axios.put(
          `http://localhost:3001/api/laboratory/${laboratoryId}`,
          {
            labResult: "for verification",
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
      .get("http://localhost:3001/api/laboratory")
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
        "http://localhost:3001/add-patient",
        patientData
      );
      const patientId = patientResponse.data.patient._id; // Extract the patient ID

      // Step 2: Create the lab request data including selected tests
      const labRequestData = {
        patient: patientId,
        ...formReqData, // Include selected laboratory tests
        labResult: "pending", // Initial status of the lab request
        referredBy,
      };

      await axios.post("http://localhost:3001/api/laboratory", labRequestData);

      // Close modal and reset form
      fetchLabRecords();

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
                  />
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
                  />
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
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
                                  : ""
                              }`}                              value={
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
                            />
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
                                  ? "border-red-500"
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
                            />
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
                                requestedCategories.includes("bloodUreaNitrogen")
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
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
                            />
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
                                  ? "border-red-500"
                                  : ""
                              }`}  
                              value={formData.bloodChemistry?.HDL_cholesterol || ""}
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
                            />
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
                                  ? "border-red-500"
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
                            />
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

                          <div className="col-span-1">Red Blood Cell Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="redBloodCellCount"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
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
                              value={formData.Hematology?.Hemoglobin || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "Hemoglobin")
                              }
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
                              value={formData.Hematology?.Hematocrit || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "Hematocrit")
                              }
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
                              value={formData.Hematology?.LeukocyteCount || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "LeukocyteCount"
                                )
                              }
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
                            />
                          </div>
                          <div className="col-span-1"></div>

                          <div className="col-span-1">Platelet Count</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="plateletCount"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={formData.Hematology?.PlateletCount || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  "Hematology",
                                  "PlateletCount"
                                )
                              }
                            />
                          </div>
                          <div className="col-span-1">150 - 400 x10^9/L</div>

                          <div className="col-span-1">Others</div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              name="others"
                              className="w-full px-3 py-1 border rounded bg-gray-100"
                              value={formData.Hematology?.others || ""}
                              onChange={(e) =>
                                handleInputChange(e, "Hematology", "others")
                              }
                            />
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
                            className="col-span-2 border rounded px-3 py-1"
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
                          />
                          <h4 className="col-span-6 font-semibold">
                            Macroscopic Examination
                          </h4>
                          <label className="col-span-1">Color</label>
                          <input
                            type="text"
                            className="col-span-2 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Appearance</label>
                          <input
                            type="text"
                            className="col-span-2 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Urobilinogen</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Albumin</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Ketones</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Blood</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Nitrite</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Bilirubin</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Leukocyte</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Reaction</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Specific Gravity</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Epithelial Cells</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Red Blood Cells</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Mucus Threads</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Bacteria</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Crystals</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Yeast Cells</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Amorphous</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Cast</label>
                          <input
                            type="text"
                            className="col-span-1 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Others</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.color || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                "color"
                              )
                            }
                          />
                          <label className="col-span-1">Consistency</label>
                          <input
                            type="text"
                            className="col-span-2 border rounded px-3 py-1"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.consistency || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                "consistency"
                              )
                            }
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
                          />
                          <label className="col-span-1">Kato Thick Smear</label>
                          <input
                            type="text"
                            className="col-span-2 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Others</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
                            value={
                              formData.clinicalMicroscopyParasitology
                                ?.routineFecalysis?.others || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                "clinicalMicroscopyParasitology",
                                "routineFecalysis",
                                "others"
                              )
                            }
                          />
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
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">ABO Type</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Rh Type</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-6"></label>

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Method Used</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Lot No.</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Expiration Date</label>
                          <input
                            type="date"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />

                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
                          <label className="col-span-1">Result</label>
                          <input
                            type="text"
                            className="col-span-5 border rounded px-3 py-1"
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
                          />
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
                    <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-2xl max-w-5xl overflow-y-auto flex flex-col justify-between relative">
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
    </div>
  );
}

export default Laboratory;
