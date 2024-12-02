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
        `http://localhost:3001/api/physicalTherapy/${therapyRecordId}`,
        {
          SOAPSummary: newTherapyRecord.SOAPSummary,
          verifiedBy: "",
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

  const handleGenerateReport = () => {
    const pdf = new jsPDF();

    // Set the title of the report
    pdf.text("Physical Therapy Report", 20, 20);

    // Table headers
    const headers = ["Date", "Diagnosis", "SOAP Summary"];

    // Use filteredPhysicalTherapyRecords instead of currentPhysicalTherapyRecords
    const tableData = filteredPhysicalTherapyRecords.map((record) => [
      new Date(record.isCreatedAt).toLocaleString(),
      record.Diagnosis,
      record.SOAPSummary,
    ]);

    // Generate the table using autoTable
    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: 30, // Start table below the title
    });

    // Save the PDF with a dynamic filename
    pdf.save("Physical_Therapy_Report.pdf");
  };

  useEffect(() => {
    fetchPhysicalTherapyRecords(); // Fetch physical therapy records on component mount
  }, []);

  const fetchPhysicalTherapyRecords = () => {
    axios
      .get("http://localhost:3001/api/physicalTherapy")
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
    try {
      const response = await axios.put(
        `http://localhost:3001/api/physicalTherapy/${recordId}/soapSummary/${summaryId}`,
        {
          updatedSOAPSummary: editSummary,
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
      fetch(`http://localhost:3001/user/${userId}`)
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

  // Handle checkbox change for individual summary selection
  const handleCheckboxChange = (summaryId) => {
    setSelectedSummaries(
      (prevSelected) =>
        prevSelected.includes(summaryId)
          ? prevSelected.filter((id) => id !== summaryId) // Unselect if already selected
          : [...prevSelected, summaryId] // Select if not selected
    );
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (selectedSummaries.length === selectedRecord?.SOAPSummaries?.length) {
      // If all are already selected, unselect all
      setSelectedSummaries([]);
    } else {
      // Select all summaries
      const allSummaryIds = selectedRecord?.SOAPSummaries?.map(
        (entry) => entry._id
      );
      setSelectedSummaries(allSummaryIds);
    }
  };

  const handleBatchVerify = async () => {
    if (selectedSummaries.length === 0) {
      console.error("Please select at least one SOAP summary to verify.");
      return;
    }

    try {
      // Create a copy of the current SOAP summaries to update
      const updatedSOAPSummaries = [...selectedRecord.SOAPSummaries];

      // Loop through each selected summary and verify it
      for (const summaryId of selectedSummaries) {
        const entry = selectedRecord.SOAPSummaries.find(
          (entry) => entry._id === summaryId
        );
        if (entry) {
          const response = await axios.put(
            `http://localhost:3001/api/physicalTherapyVerification/${selectedRecord._id}/soapSummary/${summaryId}`,
            {
              updatedSOAPSummary: {
                firstname: userData.firstname,
                lastname: userData.lastname,
              },
            }
          );

          if (response.status === 200) {
            // Update the verifiedBy field for the selected entry
            const index = updatedSOAPSummaries.findIndex(
              (item) => item._id === entry._id
            );
            if (index !== -1) {
              updatedSOAPSummaries[index] = {
                ...updatedSOAPSummaries[index],
                verifiedBy: `${userData.firstname} ${userData.lastname}`,
              };
            }
          }
        }
      }

      // After all summaries have been processed, update the selectedRecord state
      fetchPhysicalTherapyRecords();
      setSelectedRecord({
        ...selectedRecord,
        SOAPSummaries: updatedSOAPSummaries,
      });

      console.log("All selected SOAP summaries verified successfully.");
    } catch (error) {
      console.error("Error verifying SOAP summaries:", error.response || error);
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

      // Step 2: Wait for the patient ID and use it to create the associated X-ray request
      const ptOPD = {
        patient: patientId, // Pass the patient ID here
        referredBy,
        ChiefComplaints,
        HistoryOfPresentIllness,
        Diagnosis,
      };

      await axios.post("http://localhost:3001/api/physicalTherapy", ptOPD);
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
          <h1 className="text-3xl font-semibold">Physical Therapy Records</h1>
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
                    required
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
        {isViewRecordModalOpen && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
              <h2 className="text-xl font-semibold mb-4">Record Details</h2>

              {/* Main Form Content */}
              <form className="flex-grow">
                <div className="flex mb-4">
                  <div className="w-1/2 mr-2">
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={`${selectedRecord.patient?.lastname}, ${selectedRecord.patient?.firstname} `}
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div className="w-1/4 mr-2">
                    <label className="block text-gray-700">Age</label>
                    <input
                      type="text"
                      name="age"
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-gray-700">Sex</label>
                    <input
                      type="text"
                      name="sex"
                      value={selectedRecord.patient?.sex}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex mb-4">
                  <div className="w-1/2 mr-2">
                    <label className="block text-gray-700">
                      Tentative Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={selectedRecord.Diagnosis}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-gray-700">
                      History of Present Illness
                    </label>
                    <input
                      type="text"
                      name="chiefcomplaints"
                      value={selectedRecord.HistoryOfPresentIllness}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">
                    Chief Complaints
                  </label>
                  <input
                    type="text"
                    name="chiefcomplaints"
                    value={selectedRecord.ChiefComplaints}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Referred By:</label>
                  <input
                    type="text"
                    name="chiefcomplaints"
                    value={selectedRecord.referredBy}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
              </form>

              <p>
                {selectedRecord.record && (
                  <>
                    <strong>X-ray Image:</strong>
                    <button
                      className="bg-custom-red text-white px-4 py-2 rounded-lg mt-2"
                      onClick={() => setShowXray(!showXray)}
                    >
                      {showXray ? "Hide X-ray" : "View X-ray"}
                    </button>
                  </>
                )}
              </p>
              {/* X-ray Image */}
              {showXray && selectedRecord.record && (
                <div className="mt-4">
                  <img
                    src={selectedRecord.record}
                    alt="X-ray"
                    className="w-full h-auto object-contain max-h-[60vh] mx-auto"
                  />
                </div>
              )}

              {/* Date and SOAP Summary Table */}
              <div className="mt-4 overflow-x-auto max-h-60">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        SOAP Summary
                      </th>
                      {userRole !== "special trainee" && (
                        <th className="border border-gray-300 px-4 py-2"></th>
                      )}
                      <th className="border border-gray-300 px-4 py-2">
                        Verification Checklist
                        {selectedRecord?.SOAPSummaries?.length > 0 &&
                          !selectedRecord.SOAPSummaries.every(
                            (entry) => entry.verifiedBy
                          ) && (
                            <button
                              onClick={handleSelectAll}
                              className="bg-custom-red text-white px-2 py-1 rounded-lg"
                            >
                              Select All
                            </button>
                          )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord?.SOAPSummaries?.map((entry) => (
                      <tr key={entry._id}>
                        <td className="border border-gray-300 px-4 py-2 text-left">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-left break-words max-w-xs">
                          {editingEntryId === entry._id ? (
                            <textarea
                              value={editSummary}
                              onChange={(e) => setEditSummary(e.target.value)}
                              className="w-full h-24 border border-gray-300 px-2 py-1 resize-none"
                              placeholder="Edit SOAP Summary"
                            />
                          ) : (
                            entry.summary
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                          {entry.verifiedBy ? (
                            <span className="text-gray-500 text-sm"></span>
                          ) : editingEntryId === entry._id ? (
                            <>
                              <button
                                className="bg-green-500 text-white px-2 py-1 rounded-lg"
                                onClick={() =>
                                  handleSaveEdit(selectedRecord._id, entry._id)
                                }
                              >
                                Save
                              </button>
                              <button
                                className="bg-gray-500 text-white px-2 py-1 rounded-lg"
                                onClick={() => setEditingEntryId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="bg-custom-red text-white px-2 py-1 rounded-lg"
                              onClick={() =>
                                handleEdit(entry._id, entry.summary)
                              }
                            >
                              Edit
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {entry.verifiedBy ? (
                            <span className="text-green-500 text-sm">
                              Verified by {entry.verifiedBy}
                            </span>
                          ) : userRole === "special trainee" ? (
                            <span className="text-red-500 text-sm">
                              Not yet verified
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedSummaries.includes(entry._id)}
                              onChange={() => handleCheckboxChange(entry._id)}
                              className="mr-2"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-4">
                {/* Left-aligned "Print SOAP Summary" button - only shown if all summaries are verified */}
                <div className="flex-1 text-left">
                  {selectedRecord.SOAPSummaries?.length > 0 &&
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

                {/* Right-aligned "Close" and "Verify" buttons */}
                <div className="flex items-center space-x-2 text-right">
                  <button
                    className="bg-custom-red text-white px-4 py-2 rounded-lg"
                    onClick={closeViewRecordModal}
                  >
                    Close
                  </button>

                  {selectedRecord?.SOAPSummaries?.some(
                    (entry) => !entry.verifiedBy
                  ) && (
                    <button
                      className="bg-custom-red text-white px-4 py-2 rounded-lg"
                      onClick={() => {
                        // Handle verify for all non-verified entries
                        selectedRecord?.SOAPSummaries.forEach((entry) => {
                          if (!entry.verifiedBy) {
                            handleBatchVerify(
                              selectedRecord._id,
                              entry._id,
                              entry
                            );
                          }
                        });
                      }}
                    >
                      Verify
                    </button>
                  )}
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
                      required
                      className="border rounded-lg w-full p-2 mt-1"
                    />

                    <label className="block text-sm font-medium">
                      Chief Complaints
                    </label>
                    <textarea
                      type="text"
                      name="ChiefComplaints"
                      value={ChiefComplaints}
                      onChange={(e) => setChiefComplaints(e.target.value)}
                      required
                      className="border rounded-lg w-full p-2 mt-1"
                    />

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
                      required
                      className="border rounded-lg w-full p-2 mt-1"
                    />
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
      </div>
    </div>
  );
}

export default PhysicalTherapy;
