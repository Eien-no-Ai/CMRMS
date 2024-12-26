import React, { useState, useEffect, useRef, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useParams } from "react-router-dom";
import PTCertificate from "../certificatesReports/PTCertificate.jsx";
function PhysicalTherapy() {
  const [isPTCertificateOpen, setIsPTCertificate] = useState(false);
  const { id } = useParams();
  const [isOPDPatientAdded, setIsOPDPatientAdded] = useState(false); // Tracks OPD patient submission success
  const [isSOAPSummaryAdded, setIsSOAPSummaryAdded] = useState(false);
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const physicalTherapyRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [isXrayModalOpen, setIsXrayModalOpen] = useState(false);
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] =
    useState(false);
  // New state for the modal
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newTherapyRecord, setNewTherapyRecord] = useState({
    SOAPSummaries: {
      summary: "",
      date: Date.now(),
      verifiedBy: "",
    },
  });
  const [editingEntryId, setEditingEntryId] = useState(null); // ID of the SOAP summary being edited
  const [editSummary, setEditSummary] = useState(""); // Text for the current edit
  const [selectedTherapyId, setSelectedTherapyId] = useState(null);
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  // Set the selected ID when a record is clicked
  const handleSelectRecord = (id) => {
    setSelectedTherapyId(id);
  };

  // Function to close the view record modal
  const closeViewRecordModal = () => {
    setIsViewRecordModalOpen(false);
    setSelectedRecord(null);
  };

  // Function to open the view record modal
  const openViewRecordModal = (record) => {
    setSelectedRecord(record);
    setIsViewRecordModalOpen(true);
  };

  // Use selectedTherapyId in handleNewTherapySubmit
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);
  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleNewTherapyRecordOpen = () => {
    setIsNewTherapyRecordModalOpen(true);
  };

  const handleNewTherapyRecordClose = () => {
    setIsNewTherapyRecordModalOpen(false);
    setNewTherapyRecord({ SOAPSummary: "" }); // Reset form on close
  };

  // Handler for input change
  const handleNewTherapyRecordChange = (e) => {
    setNewTherapyRecord({
      ...newTherapyRecord,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenPTCertificate = (selectedRecord) => {
    setIsPTCertificate(true);
  };

  const handleClosePTCertificate = () => {
    setIsPTCertificate(false); // Close the modal
  };

  const handleNewTherapySubmit = async (e) => {
    e.preventDefault();

    const therapyRecordId = selectedTherapyId;

    if (!therapyRecordId) {
      console.error("Error: ID is undefined. Cannot update record.");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/physicalTherapy/${therapyRecordId}`,
        {
          SOAPSummary: newTherapyRecord.SOAPSummary,
          verifiedBy: "",
        },
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      if (response.status === 200) {
        setIsSOAPSummaryAdded(true);
        handleNewTherapyRecordClose();
        fetchPhysicalTherapyRecords();
        setNewTherapyRecord({ SOAPSummary: "" });
      }
    } catch (error) {
      console.error("Error updating therapy record:", error.response || error);
    }
  };

  const openNewTherapyModal = (id) => {
    setSelectedTherapyId(id); // Set the selected therapy ID when opening the modal
    setNewTherapyRecord({ SOAPSummary: "" }); // Reset the form fields
    setIsNewTherapyRecordModalOpen(true); // Open the modal
  };


  useEffect(() => {
    fetchPhysicalTherapyRecords(); // Fetch physical therapy records on component mount
  }, []);

  const fetchPhysicalTherapyRecords = () => {
    axios
      .get(`${apiUrl}/api/physicalTherapy`,
      {
        headers: {
          "api-key": api_Key,
        },
      }
      )
      .then((response) => {
        console.log(response.data && response.data.records); // Add this line to inspect the response
        const sortedRecords = response.data.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setPhysicalTherapyRecords(sortedRecords);
        setRecords(response.data.records);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the physical therapy records!",
          error
        );
      });
  };

  const indexOfLastRecord = currentPage * physicalTherapyRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - physicalTherapyRecordsPerPage;

  // Filter records based on search query
  const filteredPhysicalTherapyRecords = physicalTherapyRecords.filter(
    (record) => {
      const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();

      // Check if patient exists and has firstname, lastname, and idnumber properties
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
    }
  );

  const currentPhysicalTherapyRecords = filteredPhysicalTherapyRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(
    filteredPhysicalTherapyRecords.length / physicalTherapyRecordsPerPage
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

  // Function to enable editing mode
  const handleEdit = (summaryId, summaryText) => {
    setEditingEntryId(summaryId);
    setEditSummary(summaryText);
  };

  const handleSaveEdit = async (recordId, summaryId) => {
    fetchPhysicalTherapyRecords();

    try {
      const response = await axios.put(
        `${apiUrl}/api/physicalTherapy/${recordId}/soapSummary/${summaryId}`,
        {
          updatedSOAPSummary: editSummary,
        },
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      if (response.data.success) {
        // Optimistically update the local state immediately to reflect the edit
        const updatedSOAPSummaries = selectedRecord.SOAPSummaries.map((entry) =>
          entry._id === summaryId ? { ...entry, summary: editSummary } : entry
        );

        // Update the selectedRecord state with the new SOAP summary
        setSelectedRecord((prevRecord) => ({
          ...prevRecord,
          SOAPSummaries: updatedSOAPSummaries,
        }));

        // Exit editing mode
        setEditingEntryId(null);
        fetchPhysicalTherapyRecords();

        // Optionally show success notification or modal
        setIsEditSuccess(true);
      }
    } catch (error) {
      console.error("Error updating SOAP summary:", error);
    }
  };

  const [records, setRecords] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({}); // State to store the user's data
  const [showXray, setShowXray] = useState(false); // State to toggle X-ray visibility

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`${apiUrl}/user/${userId}`,
      {
        headers: {
          "api-key": api_Key,
        },
      }
      )
        .then((response) => response.json())
        .then((data) => {
          setUserRole(data.role);
          setUserData(data); // Store the full user data including _id
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);
  const [selectedSummaries, setSelectedSummaries] = useState([]);

  // Handle individual verification
  const handleVerify = async (recordId, entryId, index) => {
    // Ensure all previous summaries are verified
    const allPreviousVerified = selectedRecord.SOAPSummaries
      .slice(0, index)
      .every((entry) => entry.verifiedBy);

    if (!allPreviousVerified) {
      alert('Please verify all previous SOAP summaries before verifying this one.');
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/physicalTherapyVerification/${recordId}/soapSummary/${entryId}`,
        {
          updatedSOAPSummary: {
            firstname: userData.firstname,
            lastname: userData.lastname,
          },
        },
        {
          headers: {
            'api-key': api_Key,
          },
        }
      );
      setSelectedRecord((prevRecord) => {
        const updatedSummaries = [...prevRecord.SOAPSummaries];
        updatedSummaries[index] = {
          ...updatedSummaries[index],
          verifiedBy: `${userData.firstname} ${userData.lastname}`,
        };
        return {
          ...prevRecord,
          SOAPSummaries: updatedSummaries,
        };
      });
      if (response.status === 200) {
        // Update the selectedRecord state with the verified summary
        fetchPhysicalTherapyRecords();
        alert('SOAP summary verified successfully.');
          
      }
    } catch (error) {
      console.error('Error verifying SOAP summary:', error.response || error);
    }
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
  const [ChiefComplaints, setChiefComplaints] = useState(""); // State for "Chief Complaints"
  const [HistoryOfPresentIllness, setHistoryOfPresentIllness] = useState(""); // State for "History of Present Illness"
  const [Diagnosis, setDiagnosis] = useState(""); // State for "Diagnosis"
  const [isAddOPDModalOpen, setIsAddOPDModalOpen] = useState(false);

  const [errorMessages, setErrorMessages] = useState({
    firstname: "",
    lastname: "",
    birthdate: "",
    address: "",
    phonenumber: "",
    email: "",
    course: "",
    sex: "",
    referredBy: "",
    ChiefComplaints: "",
    HistoryOfPresentIllness: "",
    Diagnosis: "",
  });

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

    let ValidationErrors = {
      firstname: "",
      lastname: "",
      birthdate: "",
      address: "",
      phonenumber: "",
      email: "",
      course: "",
      sex: "",
      referredBy: "",
      ChiefComplaints: "",
      HistoryOfPresentIllness: "",
      Diagnosis: "",
    }

    if (!firstname) {
      ValidationErrors.firstname = "First name is ";
    }

    if (!lastname) {
      ValidationErrors.lastname = "Last name is ";
    }

    if (!phonenumber) {
      ValidationErrors.phonenumber = "Phone Number is ";
    }

    if (!email) {
      ValidationErrors.email = "Email is ";
    }

    if (!referredBy) {
      ValidationErrors.referredBy = "Referred by is ";
    }

    if (!ChiefComplaints) {
      ValidationErrors.ChiefComplaints = "Chief Complaints is ";
    }

    if (!HistoryOfPresentIllness) {
      ValidationErrors.HistoryOfPresentIllness = "History of Present Illness is ";
    }

    if (!Diagnosis) {
      ValidationErrors.Diagnosis = "Diagnosis is ";
    }

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

      // Step 2: Wait for the patient ID and use it to create the associated X-ray request
      const ptOPD = {
        patient: patientId, // Pass the patient ID here
        referredBy,
        ChiefComplaints,
        HistoryOfPresentIllness,
        Diagnosis,
      };

      await axios.post(`${apiUrl}/api/physicalTherapy`, ptOPD,
      {
        headers: {
          "api-key": api_Key,
        }
      }
      );
      // Set the confirmation modal state to true
      setIsOPDPatientAdded(true);
      // Close modal and reset form
      setIsAddOPDModalOpen(!isAddOPDModalOpen);
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

  const toggleAddOPDModal = () => {
    setIsAddOPDModalOpen(!isAddOPDModalOpen);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Physical Therapy Referrals</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredPhysicalTherapyRecords.length}
            </span>{" "}
            records
          </p>

          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* <button
              className="bg-custom-red text-white py-2 px-4 rounded-lg w-full"
              onClick={handleGenerateReport}
              >
              Generate Report
            </button> */}
            </div>
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
                    <th className="py-3 w-1/4">Tentative Diagnosis</th>
                    <th className="py-3 w-1/4">Chief Complaints</th>
                    <th className="py-3 w-1/12">Patient Type</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPhysicalTherapyRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500"
                      >
                        No physical therapy records found.
                      </td>
                    </tr>
                  ) : (
                    currentPhysicalTherapyRecords.map((record, index) => (
                      <tr key={record._id} className="border-b">
                        <td className="py-4">
                          {record.patient ? (
                            <>
                              <p className="font-semibold">
                                {record.patient.lastname || "Unknown"},{" "}
                                {record.patient.firstname || "Unknown"}
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
                            {record.Diagnosis || "No SOAP Summary available"}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.ChiefComplaints ||
                              "No SOAP Summary available"}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.patient?.patientType || "Unknown"}
                          </p>
                        </td>
                        <td></td>
                        <td className="py-4">
                          {/* Three dot button to trigger the modal
                       <button key={record._id} onClick={() => openNewTherapyModal(record._id)}>
                        Result
                       </button>
                        </td> */}
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
                                  onClick={() => {
                                    openViewRecordModal(record); // Open the therapy modal
                                    toggleDropdown(-1); // Close the dropdown after clicking
                                  }}
                                >
                                  View Records
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  key={record._id}
                                  onClick={() => {
                                    openNewTherapyModal(record._id); // Open the therapy modal
                                    toggleDropdown(-1); // Close the dropdown after clicking
                                  }}
                                >
                                  Add Summary
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
                <span className="mr-2">&#9432;</span> Full physical therapy
                record list is not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Physical Therapy Records
              </button>
            </div>
          </div>
        )}

        {/* Modal for adding SOAP summary */}
        {isNewTherapyRecordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 text-center">
                New Physical Therapy Record
              </h2>
              <form onSubmit={handleNewTherapySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    SOAP Summary
                  </label>
                  <textarea
                    type="text"
                    name="SOAPSummary"
                    value={newTherapyRecord.SOAPSummary}
                    onChange={handleNewTherapyRecordChange}
                    // onChange={(e) => handleNewTherapyRecordChange(e.target.value)}
                    
                    className="border rounded-lg w-full p-2 mt-1 h-80"
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
        {/* Confirmation Modal for SOAP Summary */}
        {isSOAPSummaryAdded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                SOAP Summary Added
              </h2>
              <p className="text-center text-gray-600 mb-4">
                The SOAP summary has been successfully added.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsSOAPSummaryAdded(false); // Close the confirmation modal
                    setIsNewTherapyRecordModalOpen(false); // Optionally close the add SOAP modal
                  }}
                  className="px-4 py-2 bg-custom-red text-white rounded-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
        {/* View Record Modal */}
      {/* View Record Modal */}
      {isViewRecordModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
            <h2 className="text-xl font-semibold mb-4">Record Details</h2>

            {/* Main Form Content */}
            <div className="flex-grow flex flex-col mb-4">
              <form className="flex flex-row items-start gap-4">
                {/* X-ray Result Image - Left Side */}
                <div className="w-1/2">
                  <label className="block text-gray-700">X-ray Result</label>
                  <img
                    src={selectedRecord.record}
                    alt="X-ray"
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                </div>

                <div className="w-1/2">
                  {/* Name, Age, and Sex */}
                  <div className="flex mb-4">
                    <div className="w-1/2 mr-2">
                      <label className="block text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                        value={`${selectedRecord.patient?.lastname}, ${selectedRecord.patient?.firstname} `}
                        readOnly
                      />
                    </div>
                    <div className="w-1/4 mr-2">
                      <label className="block text-gray-700">Age</label>
                      <input
                        type="text"
                        name="age"
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                        value={selectedRecord.patient?.age || ''}
                        readOnly
                      />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-gray-700">Sex</label>
                      <input
                        type="text"
                        name="sex"
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                        value={selectedRecord.patient?.sex}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Tentative Diagnosis */}
                  <div className="mb-4">
                    <label className="block text-gray-700">Tentative Diagnosis</label>
                    <input
                      type="text"
                      name="diagnosis"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      value={selectedRecord.Diagnosis}
                      readOnly
                    />
                  </div>

                  {/* History of Present Illness */}
                  <div className="mb-4">
                    <label className="block text-gray-700">History of Present Illness</label>
                    <input
                      type="text"
                      name="history"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      value={selectedRecord.HistoryOfPresentIllness}
                      readOnly
                    />
                  </div>

                  {/* Chief Complaints */}
                  <div className="mb-4">
                    <label className="block text-gray-700">Chief Complaints</label>
                    <input
                      type="text"
                      name="chiefComplaints"
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                      value={selectedRecord.ChiefComplaints}
                      readOnly
                    />
                  </div>
                </div>
              </form>
              <div className="mb-4">
                <label className="block text-gray-700">Referred By:</label>
                <input
                  type="text"
                  name="referredBy"
                  value={selectedRecord.referredBy}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>

              {/* SOAP Summary List */}
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">SOAP Summary</h3>
                <strong><i><p>*Verify SOAP Summaries from the first added to the latest </p></i></strong>
                {selectedRecord?.SOAPSummaries?.map((entry, index) => (
                  <div key={entry._id} className="flex flex-col relative p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        {/* Date */}
                        <p className="text-sm text-gray-500 mb-2">
                          Date: {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {entry.verifiedBy ? (
                          <span className="text-green-500 text-sm">
                            Verified by {entry.verifiedBy}
                          </span>
                        ) : (
                          userRole !== 'special trainee' &&
                          editingEntryId !== entry._id && (
                            <button
                              type="button"
                              className="bg-custom-red text-white px-3 py-1 rounded-md text-sm mr-2"
                              onClick={() => handleEdit(entry._id, entry.summary)}
                            >
                              Edit
                            </button>
                          )
                        )}

                        {/* Edit and Cancel Buttons (Visible in Edit Mode) */}
                        {editingEntryId === entry._id && (
                          <div className="flex justify-end space-x-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() =>
                                handleSaveEdit(selectedRecord._id, entry._id)
                              }
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => setEditingEntryId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SOAP Summary Content */}
                    <div>
                      {editingEntryId === entry._id ? (
                        <textarea
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          rows="4"
                          placeholder="Edit SOAP Summary"
                          className="w-full p-4 border rounded"
                        />
                      ) : (
                        <textarea
                          value={entry.summary}
                          rows="4"
                          placeholder="SOAP Summary"
                          className="w-full p-4 border rounded"
                          readOnly
                        />
                      )}
                    </div>

                    {/* Verify Button */}
                    {!entry.verifiedBy && userRole !== 'special trainee' && (
                      <div className="mt-2 flex justify-end">
                        <button
                          className={`${
                            selectedRecord.SOAPSummaries
                              .slice(0, index)
                              .every((prevEntry) => prevEntry.verifiedBy)
                              ? 'bg-custom-red hover:bg-red-600'
                              : 'bg-gray-300 cursor-not-allowed'
                          } text-white py-1 px-3 rounded-md text-sm`}
                          onClick={() =>
                            handleVerify(selectedRecord._id, entry._id, index)
                          }
                          disabled={
                            !selectedRecord.SOAPSummaries
                              .slice(0, index)
                              .every((prevEntry) => prevEntry.verifiedBy)
                          }
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex-1 text-left">
                {selectedRecord?.SOAPSummaries?.length > 0 &&
                  selectedRecord.SOAPSummaries.every(
                    (entry) => entry.verifiedBy
                  ) && (
                    <button
                      className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                      onClick={() => {
                        handleOpenPTCertificate(
                          selectedRecord,
                          newTherapyRecord
                        );
                      }}
                    >
                      Print SOAP Summary
                    </button>
                  )}
              </div>
              <PTCertificate
                isOpen={isPTCertificateOpen}
                onClose={handleClosePTCertificate}
                selectedRecord={selectedRecord}
                newTherapyRecord={newTherapyRecord}
              />

              {/* Right-aligned "Close" button */}
              <div className="flex items-center space-x-2 text-right">
                <button
                  className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                  onClick={closeViewRecordModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
        {/* Verification Success Modal */}
        {isVerificationSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                SOAP Summary Verified
              </h2>
              <p className="text-center text-gray-600 mb-4">
                The SOAP summary has been successfully verified.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsVerificationSuccess(false)} // Close the modal
                  className="px-4 py-2 bg-custom-red text-white rounded-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Success Modal */}
        {isEditSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                SOAP Summary Edited
              </h2>
              <p className="text-center text-gray-600 mb-4">
                The SOAP summary has been successfully edited.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsEditSuccess(false)} // Close the modal
                  className="px-4 py-2 bg-custom-red text-white rounded-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add OPD Patient Modal */}
        {isAddOPDModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/2 shadow-lg max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Add OPD Patient</h2>

              {/* Scrollable form container */}
              <div className="overflow-y-auto flex-1">
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
                        {errorMessages.firstname && (
                          <p className="text-red-500 text-sm">
                            {errorMessages.firstname}
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
                        {errorMessages.lastname && (
                          <p className="text-red-500 text-sm">
                            {errorMessages.lastname}
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
                          
                        />
                        {errorMessages.email && (
                          <p className="text-red-500 text-sm">
                            {errorMessages.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Referred By field */}
                  <div className="my-4">
                    <label className="block text-sm font-medium">
                      Referred by
                    </label>
                    <input
                      type="text"
                      name="referredBy"
                      value={referredBy}
                      onChange={(e) => setReferredBy(e.target.value)}
                      className="border rounded-lg w-full p-2 mt-1"
                      placeholder="Enter name of referrer"
                    />
                    {errorMessages.referredBy && (
                      <p className="text-red-500 text-sm">
                        {errorMessages.referredBy}
                      </p>
                    )}
                  </div>

                  {/* New Physical Therapy Record Section */}
                  <h2 className="text-lg font-bold mb-4 text-center">
                    New Physical Therapy Record
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Tentative Diagnosis
                    </label>
                    <textarea
                      type="text"
                      name="Diagnosis"
                      value={Diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                    {errorMessages.Diagnosis && (
                      <p className="text-red-500 text-sm">
                        {errorMessages.Diagnosis}
                      </p>
                    )}
                    <label className="block text-sm font-medium">
                      Chief Complaints
                    </label>
                    <textarea
                      type="text"
                      name="ChiefComplaints"
                      value={ChiefComplaints}
                      onChange={(e) => setChiefComplaints(e.target.value)}
                      
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                    {errorMessages.ChiefComplaints && (
                      <p className="text-red-500 text-sm">
                        {errorMessages.ChiefComplaints}
                      </p>
                    )}
                    <label className="block text-sm font-medium">
                      History Of Present Illness
                    </label>
                    <textarea
                      type="text"
                      name="HistoryOfPresentIllness"
                      value={HistoryOfPresentIllness}
                      onChange={(e) =>
                        setHistoryOfPresentIllness(e.target.value)
                      }
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                    {errorMessages.HistoryOfPresentIllness && (
                      <p className="text-red-500 text-sm">
                        {errorMessages.HistoryOfPresentIllness}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={toggleAddOPDModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-custom-red text-white rounded-md"
                    >
                      Add Patient
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation Modal for Adding OPD Patient */}
        {isOPDPatientAdded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Patient Added
              </h2>
              <p className="text-center text-gray-600 mb-4">
                The OPD patient has been successfully added.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsOPDPatientAdded(false); // Close the confirmation modal
                    setIsAddOPDModalOpen(false); // Optionally close the add OPD patient modal
                  }}
                  className="px-4 py-2 bg-custom-red text-white rounded-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
        {isXrayModalOpen && selectedRecord.record && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsXrayModalOpen(false)}
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                X-ray Image
              </h2>
              <img
                src={selectedRecord.record}
                alt="X-ray"
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhysicalTherapy;
