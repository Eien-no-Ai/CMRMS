import React, { useState, useEffect ,useRef, useCallback} from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useParams } from "react-router-dom";

function PhysicalTherapy() {
  const { id } = useParams();
  
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const physicalTherapyRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] = useState(false);
  // New state for the modal
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newTherapyRecord, setNewTherapyRecord] = useState({ 
    SOAPSummary:"" 
  });
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
    setNewTherapyRecord({ SOAPSummary: '' }); // Reset form on close
  };

  // Handler for input change
  const handleNewTherapyRecordChange = (e) => {
    setNewTherapyRecord({ ...newTherapyRecord, [e.target.name]: e.target.value });
  };


  const handleNewTherapySubmit = async (e) => {
    e.preventDefault();
  
    const therapyRecordId = selectedTherapyId; // Use the selected therapy ID
  
    if (!therapyRecordId) {
      console.error("Error: ID is undefined. Cannot update record.");
      return; // Prevent further execution if the ID is not valid
    }
  
    try {
      const response = await axios.put(
        `http://localhost:3001/api/physicalTherapy/${therapyRecordId}`, // Use the defined ID here
        {
          ...newTherapyRecord,
          patient: id, // Assuming 'id' is the patient ID
        }
      );
  
      if (response.status === 200) {
        handleNewTherapyRecordClose(); // Close the modal after successful submission
        fetchPhysicalTherapyRecords(); // Fetch the updated records
        setNewTherapyRecord({
          SOAPSummary: "", // Reset the form state
        });
      }
    } catch (error) {
      console.error("Error updating therapy record:", error.response || error); // Log any errors
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
    const headers = ["Date", "Diagnosis","SOAP Summary"];
  
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
        console.log(response.data); // Add this line to inspect the response
        const sortedRecords = response.data.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setPhysicalTherapyRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the physical therapy records!", error);
      });
  };

  const indexOfLastRecord = currentPage * physicalTherapyRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - physicalTherapyRecordsPerPage;

  // Filter records based on search query
  const filteredPhysicalTherapyRecords = physicalTherapyRecords.filter((record) => {
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
  });

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
                    <th className="py-3 w-1/4">SOAP Summary</th>
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
                    currentPhysicalTherapyRecords.map((record,index) => (
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
                            {record.SOAPSummary || "No SOAP Summary available"}
                          </p>
                        </td>
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
                <span className="mr-2">&#9432;</span> Full physical therapy record list is
                not shown to save initial load time.
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
                  <input
                    type="text"
                    name="SOAPSummary"
                    value={newTherapyRecord.SOAPSummary}
                    onChange={handleNewTherapyRecordChange}
                    // onChange={(e) => handleNewTherapyRecordChange(e.target.value)}
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
                  // onClick={() => {
                  //   setSelectedRecord({
                  //     ...selectedRecord,
                  //     SOAPSummary: selectedRecord.SOAPSummary
                  //       ? `${newTherapyRecord.SOAPSummary}, ${newTherapyRecord}`
                  //       : newTherapyRecord,
                  //   });
                  //   handleNewTherapyRecordClose();
                  //   setNewTherapyRecord({ SOAPSummary: "" });
                  // }}
                >
                  Submit
                </button>

                </div>
              </form>
            </div>
          </div>
        )}
       {/* View Record Modal */}
      {isViewRecordModalOpen && selectedRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-semibold mb-4">Record Details</h2>
            <p><strong>Patient Info:</strong> {selectedRecord.patient?.firstname} {selectedRecord.patient?.lastname}</p>
            <p><strong>Tentative Diagnosis:</strong> {selectedRecord.Diagnosis}</p>
            <p><strong>Chief Complaints:</strong> {selectedRecord.ChiefComplaints}</p>
            <p><strong>History of Present Illness:</strong> {selectedRecord.HistoryOfPresentIllness}</p>
            <p><strong>Gender:</strong> {selectedRecord.patient?.sex}</p>
            {/* <p><strong>Precautions:</strong> {selectedRecord.Precautions}</p> */}

            {/* Date and SOAP Summary Table */}
            <div className="mt-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                    <th className="border border-gray-300 px-4 py-2">SOAP Summary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">{new Date(selectedRecord.isCreatedAt).toLocaleDateString()}</td>
                    <td className="border border-gray-300 px-4 py-2">{selectedRecord.SOAPSummary}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="bg-custom-red text-white px-4 py-2 rounded-lg"
                onClick={closeViewRecordModal} // Close the modal
              >
                Close
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