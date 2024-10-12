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
  const { id } = useParams();
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
                              <button className="text-custom-red">View</button>
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
              <div className="flex justify-between items-center mt-4">
                {/* Left Side: Doctor-Specific Button Group */}
                {role === "doctor" && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300">
                      <SlChemistry className="mr-2" /> Lab Request
                    </button>
                    <button className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300">
                      <FaXRay className="mr-2" /> X-Ray Request
                    </button>
                    <button className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300">
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
    </div>
  );
}

export default Clinic;
