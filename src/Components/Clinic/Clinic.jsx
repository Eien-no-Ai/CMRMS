import React, { useState, useEffect, useRef, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate
import { FaXRay } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { GiBiceps } from "react-icons/gi";

function Clinic() {
  const [selectedXray, setSelectedXray] = useState(null);
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [clinicRecords, setClinicRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const clinicRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);
  const navigate = useNavigate(); // Initialize navigate

  // Modal state for viewing records
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedXrayRecords, setSelectedXrayRecords] = useState([]);
  const [role, setRole] = useState(null); // Store the user role
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [showEmergencyTreatmentInput, setShowEmergencyTreatmentInput] =
    useState(false);
  const [clinicalRecords, setClinicalRecords] = useState([]);

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole); // Store the role in state
    }
  }, []);

  useEffect(() => {
    fetchClinicRecords(); // Fetch clinic records on component mount
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

  const fetchClinicRecords = () => {
    axios
      .get("http://localhost:3001/api/clinicalRecords")
      .then((response) => {
        const sortedRecords = response.data.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setClinicRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the clinic records!", error);
      });
  };

  const indexOfLastRecord = currentPage * clinicRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - clinicRecordsPerPage;

  // Filter records based on search query
  const filteredClinicRecords = clinicRecords.filter((record) => {
    const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();
    return (
      record.patient &&
      (record.patient.firstname
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        record.patient.lastname
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber?.includes(searchQuery) ||
        formattedDate.includes(searchQuery))
    );
  });

  const currentClinicRecords = filteredClinicRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(
    filteredClinicRecords.length / clinicRecordsPerPage
  );

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

  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleViewRecord = async (record) => {
    setSelectedRecord(record);

    try {
      const labResponse = await axios.get(
        `http://localhost:3001/api/laboratory?clinicId=${record._id}`
      );
      setSelectedLabTests(labResponse.data);

      const xrayResponse = await axios.get(
        `http://localhost:3001/api/xrayResults?clinicId=${record._id}`
      );
      setSelectedXrayRecords(xrayResponse.data);
    } catch (error) {
      console.error("Error fetching lab or X-ray records:", error);
    }

    setIsViewModalOpen(true);
    setDropdownIndex(null); // Close the dropdown when viewing a record
  };

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

  const updateClinicalRecord = async (selectedRecord) => {
    fetchClinicRecords();

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
///////////////////////////////////////////////////////////////////////////////////////////////////////
const [laboratoryRecords, setLaboratoryRecords] = useState([]);
const [xrayRecords, setXrayRecords] = useState([]);
const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);


const fetchLabRecords = useCallback(async (patientId) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/laboratory/${patientId}`
    );
    const sortedLabRecords = response.data.sort(
      (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
    );
    setLaboratoryRecords(sortedLabRecords);
  } catch (error) {
    console.error("There was an error fetching the laboratory records!", error);
  }
}, []);  

const fetchXrayRecords = useCallback(async (patientId) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/xrayResults/${patientId}`
    );
    const sortedXrayRecords = response.data.sort(
      (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
    );
    setXrayRecords(sortedXrayRecords);
  } catch (error) {
    console.error("There was an error fetching the X-ray records!", error);
  }
}, []);  

// Fetch Physical Therapy Records
const fetchPhysicalTherapyRecords = useCallback(async (patientId) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/physicalTherapy/${patientId}`
    );
    const sortedPhysicalTherapyRecords = response.data.sort(
      (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
    );
    setPhysicalTherapyRecords(sortedPhysicalTherapyRecords);
  } catch (error) {
    console.error("There was an error fetching the Physical Therapy records!", error);
  }
}, []);  

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

  // Ensure that selectedRecord and selectedRecord.patient exist
  const patientId = selectedRecord?.patient?._id;
  if (!patientId) {
    console.error("Patient ID is missing or invalid.");
    return; // Exit if patient ID is not available
  }

  try {
    // Prepare data to send to the server
    const dataToSend = {
      ...formData,
      patient: patientId, // Use the patient ID from selectedRecord
      labResult: "pending",
    };

    // Include clinicId if available
    if (clinicId) {
      dataToSend.clinicId = clinicId;
    }

    console.log("Sending data:", dataToSend);

    // Post the data to your backend API
    const result = await axios.post(
      "http://localhost:3001/api/laboratory",
      dataToSend
    );

    if (result.data.message === "Laboratory request created successfully") {
      console.log("Form submitted successfully:", result.data);
      setFormData(initialFormData); // Reset form data
      handleModalClose(); // Close the modal
      fetchLabRecords(patientId); // Refresh lab records

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

const [newXrayRecord, setNewXrayRecord] = useState({
  date: new Date().toLocaleDateString(),
  xrayResult: "",
  xrayType: "",
  xrayDescription: "",
  xrayFindings: "",
});


const handleNewXraySubmit = async (e) => {
  e.preventDefault();

  const patientId = selectedRecord?.patient?._id;
  if (!patientId) {
    console.error("Patient ID is missing or invalid.");
    return; // Exit if patient ID is not available
  }

  try {
    const dataToSend = {
      ...newXrayRecord,
      patient: patientId,
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
      fetchXrayRecords(patientId); // Refresh the main X-ray records list

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

const [newTherapyRecord, setNewTherapyRecord] = useState({
  date: new Date().toLocaleDateString(),
  ChiefComplaints: "",
  HistoryOfPresentIllness: "",
  Diagnosis: "",
  Precautions: "",
  SOAPSummary: "",
});

const handleNewTherapySubmit = async (e) => {
  e.preventDefault();

  const patientId = selectedRecord?.patient?._id;
  if (!patientId) {
    console.error("Patient ID is missing or invalid.");
    return; // Exit if patient ID is not available
  }

  try {
    const response = await axios.post(
      "http://localhost:3001/api/physicalTherapy", // Fix the spelling here
      {
        ...newTherapyRecord,
        patient: patientId,
      }
    );
    if (response.status === 200) {
      handleNewTherapyRecordClose();
      fetchPhysicalTherapyRecords(patientId);
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

const handleNewTherapyRecordChange = (e) => {
  const { name, value } = e.target;
  setNewTherapyRecord((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const [isLabModalOpen, setIsLabModalOpen] = useState(false);
const [clinicId, setClinicId] = useState(null); // Added state for clinicId
const [isNewXrayModalOpen, setIsNewXrayModalOpen] = useState(false);
const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] =
useState(false);
const [selectedXrayRecord, setSelectedXrayRecord] = useState(null);



const handleLabModalOpen = (record) => {
  setIsLabModalOpen(true);
  setClinicId(record._id);
  console.log(record.patient._id);
};

const handleModalClose = () => {
  setIsLabModalOpen(false);
};


const handleNewXrayModalOpen = (record) => {
  setClinicId(record._id);
  setIsNewXrayModalOpen(true);
};

const handleNewXrayModalClose = () => {
  setIsNewXrayModalOpen(false);
};


const handleNewTherapyRecordOpen = (xray) => {
  setSelectedXrayRecord(xray);
  setIsNewTherapyRecordModalOpen(true);
};

const handleNewTherapyRecordClose = () => {
  setIsNewTherapyRecordModalOpen(false);
};


///////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Clinic Records</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredClinicRecords.length}
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
                    <th className="py-3 w-1/4">Complaint</th>
                    <th className="py-3 w-1/4">Treatment</th>
                    <th className="py-3 w-1/4">Diagnosis</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentClinicRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No clinic records found.
                      </td>
                    </tr>
                  ) : (
                    currentClinicRecords.map((record, index) => (
                      <tr key={record._id} className="border-b">
                        <td className="py-4">
                          {record.patient ? (
                            <>
                              <p className="font-semibold">
                                {record.patient.lastname},{" "}
                                {record.patient.firstname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(record.isCreatedAt).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No patient data available
                            </p>
                          )}
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.complaints || "No complaints available"}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.treatments || "No treatment available"}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.diagnosis || "No diagnosis available"}
                          </p>
                        </td>
                        <td className="py-4 relative">
                          <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current[index] = el)}
                          >
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(index);
                              }}
                            >
                              <BsThreeDots size={20} />
                            </button>

                            {dropdownIndex === index && (
                              <div className="absolute right-0 w-40 bg-white rounded-md shadow-lg border z-10">
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={() =>
                                    navigate(`/patients/${record.patient._id}`)
                                  }
                                >
                                  View Patient
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={() => handleViewRecord(record)}
                                >
                                  View Record
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
                <span className="mr-2">&#9432;</span> Full clinic record list is
                not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Clinic Records
              </button>
            </div>
          </div>
        )}
        {isViewModalOpen && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col">
              <div className="mb-4">
                <h2 className="text-lg font-bold">
                  {selectedRecord.complaints}
                </h2>
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
                    <p className="text-gray-500 py-4">
                      No treatments available.
                    </p>
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
                    <p className="text-gray-500 py-4">
                      No diagnosis available.
                    </p>
                  )}
                </div>
                {role === "doctor" &&
                  (selectedLabTests && selectedLabTests.length > 0 ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-4">
                        Lab Tests
                      </label>
                      <div className="mb-4 max-h-48 overflow-y-auto">
                        <ul className="space-y-4">
                          {selectedLabTests
                            .sort(
                              (a, b) =>
                                new Date(b.isCreatedAt) -
                                new Date(a.isCreatedAt)
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
                                    <button className="text-custom-red">
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
                  ))}
                {role === "doctor" &&
                  (selectedXrayRecords && selectedXrayRecords.length > 0 ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-4">
                        X-Ray Records
                      </label>
                      <div className="mb-4 max-h-48 overflow-y-auto">
                        <ul className="space-y-4">
                          {selectedXrayRecords
                            .sort(
                              (a, b) =>
                                new Date(b.isCreatedAt) -
                                new Date(a.isCreatedAt)
                            )
                            .map((xray, index) => (
                              <li
                                key={index}
                                className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                              >
                                <div className="col-span-1">
                                  <p className="text-gray-500 text-sm">
                                    {new Date(
                                      xray.isCreatedAt
                                    ).toLocaleString()}
                                  </p>
                                  <p className="font-semibold">
                                    {xray.xrayType}
                                  </p>
                                </div>
                                <div className="col-span-1 flex justify-center items-center">
                                  <p className="text-gray-500">
                                    {xray.xrayResult || "pending"}
                                  </p>
                                </div>
                                <div className="col-span-1 flex justify-end items-center">
                                  <button className="text-custom-red">
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
                  ))}
              </div>

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

                  {/* Conditionally Render the PT Refer Button Once */}
                  {/* Only Show BUTTON that is DONE */}
                  {selectedXrayRecords && selectedXrayRecords.length > 0 && selectedRecord && selectedXrayRecords.some((xray) => xray.xrayResult === "done") && (
                      <button
                        className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                        onClick={() => handleNewTherapyRecordOpen(selectedXrayRecords)} // Pass all X-ray records
                      >
                        <GiBiceps className="mr-2" /> Refer to PT
                      </button>
                    )
                  }

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
      </div>

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
      {isNewTherapyRecordModalOpen && selectedXrayRecords && selectedXrayRecords.length > 0 && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-50 max-w-3xl w-full overflow-auto h-auto max-h-[90vh]">
            {/* Form Title */}
            <h2 className="text-xl font-semibold mb-4 text-center">Result Form</h2>

            {/* Main Form Content */}
            <div className="flex flex-wrap mb-4 gap-4">
              <form className="flex flex-row items-start gap-4 w-full">
                {/* X-ray Result Image - Left Side */}
                <div className="w-full md:w-1/2">
                  <label className="block text-gray-700">X-ray Results</label>

                  {/* Dropdown to select X-ray record */}
                  {/* Only Show Xray Result that is DONE */}
                  <select 
                    className="w-full px-3 py-2 border rounded mb-4"
                    onChange={(e) => setSelectedXray(e.target.value)}
                  >
                    <option value="">Select X-ray</option>
                    {selectedXrayRecords
                      .filter((xray) => xray.xrayResult === "done") // Filter for xrayResult === "done"
                      .map((xray, index) => (
                        <option key={index} value={index}>
                          X-ray {index + 1} - {new Date(xray.isCreatedAt).toLocaleDateString()}
                        </option>
                      ))}
                  </select>

                  {/* Display selected X-ray record */}
                  {selectedXray !== null && selectedXrayRecords[selectedXray] && (
                    <div>
                      <img
                        src={selectedXrayRecords[selectedXray].imageFile}
                        alt="X-ray"
                        className="w-full h-auto object-contain cursor-pointer mb-4 max-h-[60vh] overflow-hidden mx-auto" // Modified styles
                      />
                    </div>
                  )}
                </div>

                {/* Patient Details Section - Right Side */}
                <div className="w-full md:w-1/2">
                  {/* Patient Information */}
                  <div className="flex mb-4 gap-2">
                    <div className="w-1/2">
                      <label className="block text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={`${selectedRecord.patient?.firstname} ${selectedRecord.patient?.lastname}` || "N/A"}
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                      />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-gray-700">Age</label>
                      <input
                        type="text"
                        name="age"
                        value={calculateAge(selectedRecord.patient?.birthdate)}
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                      />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-gray-700">Sex</label>
                      <input
                        type="text"
                        name="sex"
                        value={selectedRecord.patient?.sex || "N/A"}
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Course/Dept. or Position */}
                  <div className="mb-4">
                    <label className="block text-gray-700">
                      {selectedRecord.patient?.patientType === "Student" ? "Course/Dept." : "Position"}
                    </label>
                    <input
                      type="text"
                      name="courseDept"
                      value={selectedRecord.patient?.patientType === "Student" ? selectedRecord.patient?.course || "N/A" : selectedRecord.patient?.position || "N/A"}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>

                  {/* X-ray Information (OR No., Case No., Date, Interpretation) */}
                  <div className="mb-4">
                    <div className="flex mb-4 gap-2">
                      <div className="w-1/3">
                        <label className="block text-gray-700">OR No.</label>
                        <input
                          type="text"
                          name="XrayNo"
                          value={selectedXray !== null && selectedXrayRecords[selectedXray] ? selectedXrayRecords[selectedXray].ORNumber || "N/A" : "N/A"}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-gray-700">Case No.</label>
                        <input
                          type="text"
                          name="XrayNo"
                          value={selectedXray !== null && selectedXrayRecords[selectedXray] ? selectedXrayRecords[selectedXray].XrayNo || "N/A" : "N/A"}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-gray-700">Date</label>
                        <input
                          type="text"
                          name="date"
                          value={selectedXray !== null && selectedXrayRecords[selectedXray] ? new Date(selectedXrayRecords[selectedXray].isCreatedAt).toLocaleString() : "N/A"}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="w-full">
                      <label className="block text-gray-700">Interpretation</label>
                      <textarea
                        name="diagnosis"
                        className="w-full px-3 py-2 border rounded"
                        rows="4"
                        placeholder="No Interpretation available."
                        value={selectedXray !== null && selectedXrayRecords[selectedXray] ? selectedXrayRecords[selectedXray].diagnosis || "" : ""}
                        readOnly
                      />
                    </div>

                    {/*X-ray Findings*/}
                    <div className="w-full">
                      <label className="block text-gray-700">X-ray Findings</label>
                      <textarea
                        name="xrayFindings"
                        className="w-full px-3 py-2 border rounded"
                        rows="4"
                        placeholder="No X-ray findings available."
                        value={selectedXray !== null && selectedXrayRecords[selectedXray] ? selectedXrayRecords[selectedXray].xrayFindings || "" : ""}
                        required
                      />
                    </div>

                  </div>
                </div>
              </form>
            </div>

            {/* New Physical Therapy Record Section */}
            <h2 className="text-lg font-bold mb-4 text-center">New Physical Therapy Record</h2>
            <form onSubmit={handleNewTherapySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tentative Diagnosis</label>
                <textarea
                  type="text"
                  name="Diagnosis"
                  value={newTherapyRecord.Diagnosis}
                  onChange={handleNewTherapyRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />

                <label className="block text-sm font-medium">Chief Complaints</label>
                <textarea
                  type="text"
                  name="ChiefComplaints"
                  value={newTherapyRecord.ChiefComplaints}
                  onChange={handleNewTherapyRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />

                <label className="block text-sm font-medium">History Of Present Illness</label>
                <textarea
                  type="text"
                  name="HistoryOfPresentIllness"
                  value={newTherapyRecord.HistoryOfPresentIllness}
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


    </div>
  );
}

export default Clinic;
