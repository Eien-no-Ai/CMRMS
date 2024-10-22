import Navbar from "../Navbar/Navbar";
import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaXRay } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { GiBiceps } from "react-icons/gi";
import { BiChevronDown } from "react-icons/bi";
import { BiSearch } from "react-icons/bi";

function XrayResult() {
  const [xrayRecords, setXrayRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const xrayRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // New state for image modal
  const [fullImageSrc, setFullImageSrc] = useState("");

  const [formData, setFormData] = useState({
    ORNumber: "",
    XrayNo: "",
    date: "",
    name: "",
    age: "",
    sex: "",
    courseDept: "",
    patientType: "",
    diagnosis: "",
    imageFile: "",
  });

  const fetchXrayRecords = useCallback(() => {
    axios
      .get("http://localhost:3001/api/xrayResults")
      .then((response) => {
        // If userRole is 'doctor', display all records
        let filteredRecords;
        if (userRole === "doctor") {
          filteredRecords = response.data.filter(
            (record) => record.xrayResult === "done"
          );
        } else {
          // Filter records based on user role and X-ray type
          filteredRecords = response.data.filter((record) => {
            return (
              record.xrayResult === "done" &&
              ((userRole === "radiologist" && record.xrayType === "medical") ||
                (userRole === "radiologic technologist" &&
                  record.xrayType === "medical") ||
                (userRole === "dentist" && record.xrayType === "dental"))
            );
          });
        }

        const sortedRecords = filteredRecords.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );

        setXrayRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the X-ray records!", error);
      });
  }, [userRole]);

  useEffect(() => {
    if (userRole) {
      fetchXrayRecords();
    }
  }, [userRole, fetchXrayRecords]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

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

  const [selectedRecord, setSelectedRecord] = useState(null); // Add this to your state

  const handleAddResult = (record) => {
    setSelectedRecord(record); // Store the selected record
    console.log("Selected Patient ID:", record._id);
    // Set formData to include the necessary fields, pulling values from selectedRecord
    setFormData({
      ORNumber: record.ORNumber || "",
      XrayNo: record.XrayNo || "", // Use record's XrayNo if available
      date: new Date().toISOString().split("T")[0],
      name: `${record.patient.lastname}, ${record.patient.firstname}`,
      age: getAge(record.patient.birthdate),
      sex: record.patient.sex,
      courseDept: record.patient.course || record.patient.position,
      patientType: record.patient.patientType,
      diagnosis: record.diagnosis || "", // If there's an existing diagnosis
      imageFile: record.imageFile || "", // If there's an existing image file
    });
    setIsModalOpen(true); // Open the modal
  };

  const handleSubmitResult = async () => {
    // Ensure selectedRecord exists and has an _id
    if (!selectedRecord || !selectedRecord._id) {
      console.error(
        "No record selected or selected record doesn't have an _id."
      );
      return;
    }

    // Prepare the form data to send via axios
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("ORNumber", formData.ORNumber);
    formDataToSubmit.append("XrayNo", formData.XrayNo);
    formDataToSubmit.append("diagnosis", formData.diagnosis);
    formDataToSubmit.append("patientId", selectedRecord.patient._id);
    formDataToSubmit.append("clinicId", selectedRecord.clinicId);

    if (imageFile) {
      formDataToSubmit.append("imageFile", imageFile); // Append image file if exists
    }

    try {
      // Step 1: Update the existing X-ray record by ID
      const updateResponse = await axios.put(
        `http://localhost:3001/api/xrayResults/${selectedRecord._id}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the proper content type for file uploads
          },
        }
      );

      console.log("Response from backend:", updateResponse.data);

      if (updateResponse.data.success) {
        console.log(
          "X-ray result submitted successfully:",
          updateResponse.data.updatedRecord
        );
        setIsModalOpen(false);
        setResult("");
        setImageFile(null);
        fetchXrayRecords();
      } else {
        console.error(
          "Failed to update X-ray record:",
          updateResponse.data.message
        );
      }
    } catch (error) {
      console.error(
        "Error in submission process:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file); // Log the file to ensure it's being set
    setImageFile(file);
  };

  const indexOfLastRecord = currentPage * xrayRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - xrayRecordsPerPage;

  const filteredXrayRecords = xrayRecords.filter((record) => {
    const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();
    return (
      record.patient &&
      (record.patient.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        record.patient.lastname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber?.includes(searchQuery) ||
        formattedDate.includes(searchQuery))
    );
  });

  const currentXrayRecords = filteredXrayRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredXrayRecords.length / xrayRecordsPerPage);

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

  const handleImageClick = (imageSrc) => {
    setFullImageSrc(imageSrc);
    setIsImageModalOpen(true);
  };
  //------------------------------------------------------OTHERSSSS--------------------------------------------------------------------------------------
  const [id, setId] = useState(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [clinicId, setClinicId] = useState(null); // Added state for clinicId
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] = useState(false);
  const [isNewXrayModalOpen, setIsNewXrayModalOpen] = useState(false);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedXrayRecords, setSelectedXrayRecords] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [labRecords, setLabRecords] = useState([]);
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);

  const [newXrayRecord, setNewXrayRecord] = useState({
    date: new Date().toLocaleDateString(),
    xrayResult: "",
    xrayType: "",
    xrayDescription: "",
  });


  //------------------------------------------------------LABORATORY REQUEST--------------------------------------------------------------------------------------
  const initialFormDataa = {
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

  const [formDataa, setFormDataa] = useState(initialFormDataa);


  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get("http://localhost:3001/api/laboratory")
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => record.labResult === "complete")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };
  const handleLabModalOpen = () => {
    if (selectedRecord && selectedRecord._id) {
      setIsLabModalOpen(true);
      setClinicId(selectedRecord._id);
      setId(selectedRecord.patient._id); // Assuming patient ID is stored in selectedRecord.patient._id
      console.log("Lab modal opened, patient ID:", selectedRecord.patient._id);
    } else {
      console.error("No selected record available or missing _id");
    }
  };
  const handleModalClose = () => {
    setIsLabModalOpen(false);
  };

  const handleInputChange = (section, field) => {
    setFormDataa((prevData) => ({
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
        ...formDataa,
        patient: id,
        labResult: "pending",
      };
  
      // Include clinicId if available
      if (clinicId) {
        dataToSend.clinicId = clinicId;
      }
  
      console.log("Submitting lab request for patient ID:", id);
  
      const result = await axios.post(
        "http://localhost:3001/api/laboratory",
        dataToSend
      );
  
      console.log("Server response:", result.data);
  
      if (result.data.message === "Laboratory request created successfully") {
        setFormDataa(initialFormDataa); // Reset form data
        handleModalClose(); // Close the modal
        fetchLabRecords(); // Refresh lab records
  
        // Refresh lab tests in the view modal for the specific record
        if (clinicId) {
          const updatedLabTests = await axios.get(
            `http://localhost:3001/api/laboratory?clinicId=${clinicId}`
          );
          setSelectedLabTests(updatedLabTests.data);
        }
      }
    } catch (err) {
      console.error("An error occurred while submitting the form:", err);
    } finally {
      setClinicId(null); // Clear clinicId explicitly
    }
  };
  //------------------------------------------------------PHYSICAL THERAPY REQUEST--------------------------------------------------------------------------------------
  const handleNewTherapyRecordOpen = () => {
    if (selectedRecord && selectedRecord._id) {
      setIsNewTherapyRecordModalOpen(true);
      setClinicId(selectedRecord._id);
      setId(selectedRecord.patient._id);
      console.log("Therapy record modal opened, patient ID:", selectedRecord.patient._id);
    } else {
      console.error("No selected record available or missing _id");
    }
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

  const [newTherapyRecord, setNewTherapyRecord] = useState({
    date: new Date().toLocaleDateString(),
    Diagnosis: "",
    Precautions: "",
    SOAPSummary: "",
  });

  const fetchPhysicalTherapyRecords = useCallback(async () => {
    try {
      if (!selectedRecord || !selectedRecord.patient) {
        console.error("No patient data available");
        return;
      }
  
      // Ensure we're using the correct patient ID
      const patientId = typeof selectedRecord.patient === 'object' ? selectedRecord.patient._id : selectedRecord.patient;
  
      if (!patientId) {
        console.error("Invalid patient ID");
        return;
      }
  
      console.log("Fetching physical therapy records for patient ID:", patientId);
  
      const response = await axios.get(
        `http://localhost:3001/api/physicalTherapy/${patientId}`
      );
      const sortedPhysicalTherapyRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setPhysicalTherapyRecords(sortedPhysicalTherapyRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the Physical Therapy records! ",
        error
      );
    }
  }, [selectedRecord]);
  const handleNewTherapySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedRecord || !selectedRecord.patient) {
        console.error("No patient data available");
        return;
      }
  
      const dataToSend = {
        ...newTherapyRecord,
        patient: selectedRecord.patient._id,
        status: "pending", // Assuming you want to add a status field
      };
  
      if (clinicId) {
        dataToSend.clinicId = clinicId;
      }
  
      console.log("Submitting Physical Therapy request:", dataToSend);
  
      const response = await axios.post(
        "http://localhost:3001/api/physicalTherapy",
        dataToSend
      );
  
      if (response.data.success) {
        console.log("Physical Therapy submitted successfully:", response.data);
        setNewTherapyRecord({
          date: new Date().toLocaleDateString(),
          Diagnosis: "",
          Precautions: "",
          SOAPSummary: "",
        });
        handleNewTherapyRecordClose();
        fetchPhysicalTherapyRecords();
  
        if (clinicId) {
          const updatedPhysicalTherapyRecords = await axios.get(
            `http://localhost:3001/api/physicalTherapy?clinicId=${clinicId}`
          );
          setPhysicalTherapyRecords(updatedPhysicalTherapyRecords.data);
        }
      } else {
        console.error("Error submitting Physical Therapy form:", response.data);
      }
    } catch (error) {
      console.error("An error occurred while submitting the Physical Therapy form:", error);
    } finally {
      setClinicId(null);
    }
  };  

  //------------------------------------------------------X-RAY REQUEST--------------------------------------------------------------------------------------
  const handleNewXrayModalOpen = () => {
    if (selectedRecord && selectedRecord._id) {
      setIsNewXrayModalOpen(true);
      setClinicId(selectedRecord._id);
      setId(selectedRecord.patient._id);
      console.log("X-ray modal opened, patient ID:", selectedRecord.patient._id);
    } else {
      console.error("No selected record available or missing _id");
    }
  };

  const handleNewXrayModalClose = () => {
    setIsNewXrayModalOpen(false);
  };

  const handleNewXraySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedRecord || !selectedRecord.patient) {
        console.error("No patient data available");
        return;
      }

      const dataToSend = {
        ...newXrayRecord,
        patient: selectedRecord.patient._id,
        xrayResult: "pending",
      };

      if (clinicId) {
        dataToSend.clinicId = clinicId;
      }

      console.log("Submitting X-ray request:", dataToSend);

      const response = await axios.post(
        "http://localhost:3001/api/xrayResults",
        dataToSend
      );

      if (response.data.success) {
        console.log("X-ray submitted successfully:", response.data);
        setNewXrayRecord({});
        handleNewXrayModalClose();
        fetchXrayRecords();

        if (clinicId) {
          const updatedXrayRecords = await axios.get(
            `http://localhost:3001/api/xrayResults?clinicId=${clinicId}`
          );
          setSelectedXrayRecords(updatedXrayRecords.data);
        }
      } else {
        console.error("Error submitting X-ray form:", response.data);
      }
    } catch (error) {
      console.error("An error occurred while submitting the X-ray form:", error);
    } finally {
      setClinicId(null);
    }
  };  

  const handleNewXrayChange = (e) => {
      const { name, value } = e.target;
      setNewXrayRecord((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    // const fetchXrayRecords = useCallback(async () => {
    //   try {
    //     if (!selectedRecord || !selectedRecord.patient) {
    //       console.error("No patient data available");
    //       return;
    //     }
    
    //     const patientId = selectedRecord.patient._id || selectedRecord.patient;
    
    //     if (!patientId) {
    //       console.error("Invalid patient ID");
    //       return;
    //     }
    
    //     const response = await axios.get(
    //       `http://localhost:3001/api/xrayResults/${patientId}`
    //     );
    //     const sortedXrayRecords = response.data.sort(
    //       (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
    //     );
    //     setXrayRecords(sortedXrayRecords);
    //     console.log("Fetched X-ray Records:", sortedXrayRecords);
    //   } catch (error) {
    //     console.error("There was an error fetching the X-ray records! ", error);
    //   }
    // }, [selectedRecord]);

  {/* -------------------------------------------------------------------------------------------------------------------------------------------- */}

  
  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">X-ray Records</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {/* Display total X-ray requests if user is a doctor */}
            {userRole === "doctor" && filteredXrayRecords.length >= 0 && (
              <>
                <span className="font-bold text-4xl text-custom-red">
                  {filteredXrayRecords.length}
                </span>{" "}
                records
              </>
            )}

            {/* Display Dental requests if user is a dentist and dental records count is non-negative */}
            {userRole === "dentist" &&
              filteredXrayRecords.filter(
                (record) => record.xrayType === "dental"
              ).length >= 0 && (
                <>
                  <span className="font-bold text-4xl text-custom-red">
                    {
                      filteredXrayRecords.filter(
                        (record) => record.xrayType === "dental"
                      ).length
                    }
                  </span>{" "}
                  Dental records
                </>
              )}

            {/* Display Medical requests if user is not a dentist and medical records count is non-negative */}
            {userRole !== "dentist" &&
              userRole !== "doctor" &&
              filteredXrayRecords.filter(
                (record) => record.xrayType === "medical"
              ).length >= 0 && (
                <>
                  <span className="font-bold text-4xl text-custom-red">
                    {
                      filteredXrayRecords.filter(
                        (record) => record.xrayType === "medical"
                      ).length
                    }
                  </span>{" "}
                  Medical records
                </>
              )}
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
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/5">Patient Info</th>
                    <th className="py-3 w-1/5">X-Ray Type</th>
                    <th className="py-3 w-1/4">Description</th>
                    <th className="py-3 w-1/5">Status</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>

                <tbody>
                  {/* Check for dental and medical records separately */}
                  {userRole === "dentist" &&
                    currentXrayRecords.filter(
                      (record) => record.xrayType === "dental"
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-gray-500"
                        >
                          No Dental X-ray records found.
                        </td>
                      </tr>
                    )}
                  {userRole !== "dentist" &&
                    currentXrayRecords.filter(
                      (record) => record.xrayType === "medical"
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-gray-500"
                        >
                          No Medical X-ray records found.
                        </td>
                      </tr>
                    )}

                  {/* Display records if available */}
                  {currentXrayRecords.map((record) => {
                    if (
                      userRole === "doctor" ||
                      (record.xrayType === "medical" &&
                        (userRole === "radiologist" ||
                          userRole === "radiologic technologist")) ||
                      (record.xrayType === "dental" && userRole === "dentist")
                    ) {
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
                              {record.xrayType || "No test data available"}
                            </p>
                          </td>
                          <td className="py-4">
                            <p>
                              {record.xrayDescription ||
                                "No description available"}
                            </p>
                          </td>
                          <td className="py-4">
                            <p>{record.xrayResult || "pending"}</p>
                          </td>
                          <td className="py-4">
                            <button
                              className="text-custom-red hover:underline"
                              onClick={() => handleAddResult(record)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    return null; // If the xrayType does not match the user role, skip this row
                  })}
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
                <span className="mr-2">&#9432;</span> Whole X-ray request list
                is not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All X-ray Records
              </button>
            </div>
          </div>
        )}

        {/* Modal for adding result */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
              {/* Form Title */}
              <h2 className="text-xl font-semibold mb-4">Result Form</h2>

              {/* Main Form Content */}
              <div className="flex-grow flex flex-col mb-4">
                <form className="flex flex-row items-start gap-4">
                  {/* X-ray Result Image - Left Side */}
                  <div className="w-1/2">
                    <label className="block text-gray-700">X-ray Result</label>
                    <img
                      src={`${formData.imageFile}`}
                      alt="X-ray"
                      className="w-auto h-full object-cover cursor-pointer"
                      onClick={() => handleImageClick(formData.imageFile)}
                    />
                  </div>

                  {/* Details Section - Right Side */}
                  <div className="w-1/2">
                    {/* Xray No. and Date */}
                    <div className="flex mb-4">
                      <div className="w-1/3 mr-2">
                        <label className="block text-gray-700">OR No.</label>
                        <input
                          type="text"
                          name="XrayNo"
                          value={formData.ORNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                      <div className="w-1/3 mr-2">
                        <label className="block text-gray-700">Case No.</label>
                        <input
                          type="text"
                          name="XrayNo"
                          value={formData.XrayNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>

                      <div className="w-1/3">
                        <label className="block text-gray-700">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
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

                    {/* Course/Dept. or Position */}
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        {formData.patientType === "student"
                          ? "Course/Dept."
                          : "Position"}
                      </label>
                      <input
                        type="text"
                        name="courseDept"
                        value={formData.courseDept}
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
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        readOnly={userRole === "radiologic technologist"}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Close and Save Buttons */}
              <div className="flex justify-between items-center mt-4">
                  {/* Left Area: Additional Buttons */}
                  <div className="flex space-x-4">
                    {selectedRecord?.xrayResult === "done" && (
                      <>
                        <button
                          className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                          onClick={handleLabModalOpen}
                        >
                          <SlChemistry className="mr-2" /> Lab Request
                        </button>
                        <button
                          className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                          onClick={handleNewXrayModalOpen}
                        >
                          <FaXRay className="mr-2" /> X-Ray Request
                        </button>
                        <button
                          className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                          onClick={handleNewTherapyRecordOpen}
                        >
                          <GiBiceps className="mr-2" /> Refer to PT
                        </button>
                      </>
                    )}
                  </div>

                  {/* Right Area: Close Button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    {selectedRecord?.xrayResult === "pending" ? "Cancel" : "Close"}
                  </button>
                </div>

                {/* Radiologist Save Button */}
                {userRole === "radiologist" && (
                  <button
                    onClick={handleSubmitResult}
                    className="px-4 py-2 bg-custom-red text-white rounded-md mt-2"
                  >
                    Save
                  </button>
                )}
            </div>
          </div>
        )}

        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div
              className="relative bg-white p-6 rounded-lg shadow-lg overflow-hidden flex justify-center items-center"
              style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 text-custom-red text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>

              {/* Full-size Image */}
              <img
                src={fullImageSrc}
                alt="Full-size X-ray"
                className="object-contain max-h-[90vh] max-w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------LABORATORY REQUEST MDDAL-------------------------------------------------------------------------------------- */}
      {isLabModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                          checked={formDataa.bloodChemistry.bloodSugar !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "bloodSugar")
                          }
                        />{" "}
                        Blood Sugar (Fasting / Random)
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.bloodUreaNitrogen !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "bloodUreaNitrogen")
                          }
                        />{" "}
                        Blood Urea Nitrogen
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.bloodUricAcid !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "bloodUricAcid")
                          }
                        />{" "}
                        Blood Uric Acid
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.creatinine !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "creatinine")
                          }
                        />{" "}
                        Creatinine
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.SGOT_AST !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "SGOT_AST")
                          }
                        />{" "}
                        SGOT / AST
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.SGPT_ALT !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "SGPT_ALT")
                          }
                        />{" "}
                        SGPT / ALT
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.totalCholesterol !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "totalCholesterol")
                          }
                        />{" "}
                        Total Cholesterol
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.triglyceride !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "triglyceride")
                          }
                        />{" "}
                        Triglyceride
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.HDL_cholesterol !== ""}
                          onChange={() =>
                            handleInputChange("bloodChemistry", "HDL_cholesterol")
                          }
                        />{" "}
                        HDL Cholesterol
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodChemistry.LDL_cholesterol !== ""}
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
                            formDataa.hematology.bleedingTimeClottingTime !== ""
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
                          checked={formDataa.hematology.completeBloodCount !== ""}
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
                            formDataa.hematology.hematocritAndHemoglobin !== ""
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
                            formDataa.clinicalMicroscopyParasitology
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
                            formDataa.clinicalMicroscopyParasitology
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
                            formDataa.clinicalMicroscopyParasitology
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
                            formDataa.clinicalMicroscopyParasitology
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
                            formDataa.bloodBankingSerology.antiTreponemaPallidum !==
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
                          checked={formDataa.bloodBankingSerology.antiHCV !== ""}
                          onChange={() =>
                            handleInputChange("bloodBankingSerology", "antiHCV")
                          }
                        />{" "}
                        Anti-HCV
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.bloodBankingSerology.bloodTyping !== ""}
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
                            formDataa.bloodBankingSerology
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
                            formDataa.bloodBankingSerology.pregnancyTest !== ""
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
                          checked={formDataa.bloodBankingSerology.dengueTest !== ""}
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
                            formDataa.bloodBankingSerology.HIVRapidTest !== ""
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
                          checked={formDataa.bloodBankingSerology.HIVElsa !== ""}
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
                            formDataa.bloodBankingSerology.testForSalmonellaTyphi !==
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
                          checked={formDataa.microbiology.gramsStain !== ""}
                          onChange={() =>
                            handleInputChange("microbiology", "gramsStain")
                          }
                        />{" "}
                        Gram's Stain
                      </label>

                      <label className="block">
                        <input
                          type="checkbox"
                          checked={formDataa.microbiology.KOH !== ""}
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

  {/* -----------------------------------------------------PHYSICAL THERAPY REQUEST MDDAL-------------------------------------------------------------------------------------- */}
        {isNewTherapyRecordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

  {/* ------------------------------------------------------XRAY REQUEST MDDAL-------------------------------------------------------------------------------------- */}      
      {isNewXrayModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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


      {/* ------------------------------------------------------DON'T DELETE THE FOLLOWING-------------------------------------------------------------------------------------- */}
    </div>
  );
}

export default XrayResult;
