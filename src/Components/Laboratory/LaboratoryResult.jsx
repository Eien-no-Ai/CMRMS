  import Navbar from "../Navbar/Navbar";
  import axios from "axios";
  import React, { useState, useEffect, useRef, useCallback } from "react";
  import { useParams } from "react-router-dom";
  import { FaXRay } from "react-icons/fa6";
  import { SlChemistry } from "react-icons/sl";
  import { GiBiceps } from "react-icons/gi";
  import { BiChevronDown } from "react-icons/bi";
  import { BiSearch } from "react-icons/bi";

function LaboratoryResult() {
  const [labRecords, setLabRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const labRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labDetails, setLabDetails] = useState(null);
  const [isHematologyVisible, setHematologyVisible] = useState(false);
  const [isClinicalMicroscopyVisible, setClinicalMicroscopyVisible] =
    useState(false);
  const [isSerologyVisible, setSerologyVisible] = useState(false);
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);


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

  // Fetch lab result by laboratory request ID
  const fetchLabResultByRequestId = async (laboratoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/laboratory-results/by-request/${laboratoryId}`
      );
      if (response.status === 200 && response.data) {
        setLabDetails(response.data); // Set lab details
        setIsModalOpen(true); // Open the modal
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

  // const openModal = (laboratoryId) => {
  //   fetchLabResultByRequestId(laboratoryId);
  // };

  const openModal = (laboratoryId) => {
    fetchLabResultByRequestId(laboratoryId)
      .then(result => {
        if (result) {
          setLabDetails(result);
          setIsModalOpen(true);
        }
      })
      .catch(error => console.error("Error opening modal:", error));
  };

  const closeModal = () => {
    setLabDetails(null);
    setIsModalOpen(false);
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

  //------------------------------------------------------OTHERSSSS--------------------------------------------------------------------------------------
  const [id, setId] = useState(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [clinicId, setClinicId] = useState(null); // Added state for clinicId
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] = useState(false);
  const [isNewXrayModalOpen, setIsNewXrayModalOpen] = useState(false);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedXrayRecords, setSelectedXrayRecords] = useState([]);
  const [xrayRecords, setXrayRecords] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  const [newXrayRecord, setNewXrayRecord] = useState({
    date: new Date().toLocaleDateString(),
    xrayResult: "",
    xrayType: "",
    xrayDescription: "",
  });

  //------------------------------------------------------LABORATORY REQUEST--------------------------------------------------------------------------------------
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

  const handleLabModalOpen = () => {
    if (labDetails && labDetails._id) {
      setIsLabModalOpen(true);
      setClinicId(labDetails._id);
      setId(labDetails.patient); // Assuming patient ID is stored in labDetails.patient
      console.log("Lab modal opened, patient ID:", labDetails.patient);
    } else {
      console.error("No lab details available or missing _id");
    }
  };

  const handleModalClose = () => {
    setIsLabModalOpen(false);
  };

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
        dataToSend.clinicId = clinicId;
      }
  
      console.log("Submitting lab request for patient ID:", id);
  
      const result = await axios.post(
        "http://localhost:3001/api/laboratory",
        dataToSend
      );
  
      console.log("Server response:", result.data);
  
      if (result.data.message === "Laboratory request created successfully") {
        setFormData(initialFormData); // Reset form data
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
    if (labDetails && labDetails._id) {
      setClinicId(labDetails._id);
      setIsNewTherapyRecordModalOpen(true);
      setId(labDetails.patient);
      console.log("Therapy record modal opened, patient ID:", labDetails.patient);
    } else {
      console.error("No lab details available or missing _id");
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
      if (!labDetails || !labDetails.patient) {
        console.error("No patient data available");
        return;
      }
  
      // Ensure we're using the correct patient ID
      const patientId = typeof labDetails.patient === 'object' ? labDetails.patient._id : labDetails.patient;
  
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
  }, [labDetails]);
  const handleNewTherapySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!labDetails || !labDetails.patient) {
        console.error("No patient data available");
        return;
      }
  
      const dataToSend = {
        ...newTherapyRecord,
        patient: labDetails._id,
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
    if (labDetails && labDetails.patient) {
      setClinicId(labDetails._id);
      setIsNewXrayModalOpen(true);
      setId(labDetails.patient);
      console.log("X-ray modal opened, patient ID:", labDetails.patient);
    } else {
      console.error("No lab details available or missing _id");
    }
  };

  const handleNewXrayModalClose = () => {
    setIsNewXrayModalOpen(false);
  };

  const handleNewXraySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!labDetails || !labDetails.patient) {
        console.error("No patient data available");
        return;
      }

      const dataToSend = {
        ...newXrayRecord,
        patient: labDetails._id,
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

    const fetchXrayRecords = useCallback(async () => {
      try {
        if (!labDetails || !labDetails.patient) {
          console.error("No patient data available");
          return;
        }
    
        const patientId = labDetails.patient._id || labDetails.patient;
    
        if (!patientId) {
          console.error("Invalid patient ID");
          return;
        }
    
        const response = await axios.get(
          `http://localhost:3001/api/xrayResults/${patientId}`
        );
        const sortedXrayRecords = response.data.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setXrayRecords(sortedXrayRecords);
        console.log("Fetched X-ray Records:", sortedXrayRecords);
      } catch (error) {
        console.error("There was an error fetching the X-ray records! ", error);
      }
    }, [labDetails]);

  {/* -------------------------------------------------------------------------------------------------------------------------------------------- */}

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Laboratory Records</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredLabRecords.length}
            </span>{" "}
            records
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
                        No lab records found.
                      </td>
                    </tr>
                  ) : (
                    currentLabRecords.map((record) => {
                      const allTests = [
                        ...Object.entries(record.bloodChemistry || {})
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.hematology || {})
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(
                          record.clinicalMicroscopyParasitology || {}
                        )
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.bloodBankingSerology || {})
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(record.microbiology || {})
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
                              onClick={() => openModal(record._id)}
                              className="text-custom-red"
                            >
                              View
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
                Load All Laboratory Records
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Viewing Details */}
      {isModalOpen && labDetails && (
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
                      new Date(labDetails.isCreatedAt).toLocaleDateString() ||
                      "N/A"
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
                          labDetails.Hematology?.redBloodCellCount || "N/A"
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
                        value={labDetails.Hematology?.LeukocyteCount || "N/A"}
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
                          labDetails.Hematology?.DifferentialCount?.monocytes ||
                          "N/A"
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
                          labDetails.Hematology?.DifferentialCount?.basophils ||
                          "N/A"
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
                          labDetails.Hematology?.DifferentialCount?.total ||
                          "N/A"
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
                        value={labDetails.Hematology?.PlateletCount || "N/A"}
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
                        ?.routineUrinalysis?.macroscopicExam?.color || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Appearance</label>
                  <input
                    type="text"
                    className="col-span-2 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.macroscopicExam?.appearance ||
                      "N/A"
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
                        ?.routineUrinalysis?.chemicalExam?.urobilinogen || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Albumin</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.albumin || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Ketones</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.ketones || "N/A"
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
                        ?.routineUrinalysis?.chemicalExam?.nitrites || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Bilirubin</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.bilirubin || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Leukocyte</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.leukocytes || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Reaction</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.reaction || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Specific Gravity</label>
                  <input
                    type="text"
                    className="col-span-1 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.chemicalExam?.specificGravity ||
                      "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.pusCells || "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.epithelialCells ||
                      "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.mucusThreads ||
                      "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.bacteria || "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.crystals || "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.yeastCells ||
                      "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.amorphous || "N/A"
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
                        ?.routineUrinalysis?.microscopicExam?.casts || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Others</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineUrinalysis?.microscopicExam?.others || "N/A"
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
                        ?.routineFecalysis?.microscopicExam?.directFecalSmear ||
                      "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Kato Thick Smear</label>
                  <input
                    type="text"
                    className="col-span-2 border rounded px-3 py-1"
                    value={
                      labDetails.clinicalMicroscopyParasitology
                        ?.routineFecalysis?.microscopicExam?.katoThickSmear ||
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
                    Hepatitis B Surface Antigen Determination (Screening Test
                    Only)
                  </h4>
                  <h4 className="col-span-6 font-semibold">
                    Anti-HAV Test (Screening Test Only)
                  </h4>

                  <label className="col-span-1">Method Used</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen
                        ?.methodUsed || "N/A"
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
                      labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen
                        ?.lotNumber || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Lot No.</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.antiHAVTest?.lotNumber ||
                      "N/A"
                    }
                    readOnly
                  />

                  <label className="col-span-1">Expiration Date</label>
                  <input
                    type="date"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.hepatitisBSurfaceAntigen.expirationDate)
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
                      labDetails.bloodBankingSerology?.antiHAVTest?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.antiHAVTest.expirationDate)
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
                      labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen
                        ?.result || "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Result</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.antiHAVTest?.result ||
                      "N/A"
                    }
                    readOnly
                  />

                  {/* Serum Pregnancy and Test for Treponema pallidum / Syphilis */}
                  <h4 className="col-span-6 font-semibold">Serum Pregnancy</h4>
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
                      labDetails.bloodBankingSerology?.treponemaPallidumTest
                        ?.methodUsed || "N/A"
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
                      labDetails.bloodBankingSerology?.treponemaPallidumTest
                        ?.lotNumber || "N/A"
                    }
                    readOnly
                  />

                  <label className="col-span-1">Expiration Date</label>
                  <input
                    type="date"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.serumPregnancy?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.serumPregnancy.expirationDate)
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
                      labDetails.bloodBankingSerology?.treponemaPallidumTest?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.treponemaPallidumTest.expirationDate)
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
                      labDetails.bloodBankingSerology?.serumPregnancy?.result ||
                      "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Result</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.treponemaPallidumTest
                        ?.result || "N/A"
                    }
                    readOnly
                  />

                  {/* Salmonella typhi and Blood Typing */}
                  <h4 className="col-span-6 font-semibold">Salmonella typhi</h4>
                  <h4 className="col-span-6 font-semibold">Blood Typing</h4>

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
                      labDetails.bloodBankingSerology?.bloodTyping?.ABOType ||
                      "N/A"
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
                      labDetails.bloodBankingSerology?.bloodTyping?.RhType ||
                      "N/A"
                    }
                    readOnly
                  />

                  <label className="col-span-1">Expiration Date</label>
                  <input
                    type="date"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.salmonellaTyphi?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.salmonellaTyphi.expirationDate)
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
                  <h4 className="col-span-6 font-semibold">Test for Dengue</h4>
                  <h4 className="col-span-6 font-semibold">Others</h4>

                  <label className="col-span-1">Method Used</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.testDengue?.methodUsed ||
                      "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Method Used</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.others?.methodUsed ||
                      "N/A"
                    }
                    readOnly
                  />

                  <label className="col-span-1">Lot No.</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.testDengue?.lotNumber ||
                      "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Lot No.</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.others?.lotNumber ||
                      "N/A"
                    }
                    readOnly
                  />

                  <label className="col-span-1">Expiration Date</label>
                  <input
                    type="date"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.testDengue?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.testDengue.expirationDate)
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
                      labDetails.bloodBankingSerology?.others?.expirationDate
                        ? new Date(labDetails.bloodBankingSerology.others.expirationDate)
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
                      labDetails.bloodBankingSerology?.testDengue?.result ||
                      "N/A"
                    }
                    readOnly
                  />
                  <label className="col-span-1">Result</label>
                  <input
                    type="text"
                    className="col-span-5 border rounded px-3 py-1"
                    value={
                      labDetails.bloodBankingSerology?.others?.result || "N/A"
                    }
                    readOnly
                  />
                </div>
              )}
            </form>

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2"> 
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
                </div>
              {/* Right Side: Close and Submit Buttons */}
              <div className="flex space-x-4">

                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-md"
                  onClick={closeModal}
                  >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* ------------------------------------------------------LABORATORY REQUEST MDDAL-------------------------------------------------------------------------------------- */}
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
      


  {/* ------------------------------------------------------DON'T DELETE THE FOLLOWING-------------------------------------------------------------------------------------- */}
  </div>
  );
}

export default LaboratoryResult;
