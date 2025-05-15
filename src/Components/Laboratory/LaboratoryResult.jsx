import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import ClinicalChemistryCertificate from '../certificatesReports/ClinicalChemistryCertificate.jsx'
import LabCompleteResultCertificate from '../certificatesReports/LabCompleteResultCertificate.jsx'
function LaboratoryResult() {
  const [labRecords, setLabRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const labRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labDetails, setLabDetails] = useState(null);
  const [isBloodChemistryVisible, setIsBloodChemistryVisible] = useState(false);
  const [isHematologyVisible, setHematologyVisible] = useState(false);
  const [isClinicalMicroscopyVisible, setClinicalMicroscopyVisible] =
    useState(false);
  const [isSerologyVisible, setSerologyVisible] = useState(false);
  const [verifiedByEmployee, setVerifiedByEmployee] = useState(null);
  const [verifiedByPathologist, setVerifiedByPathologist] = useState(null);
  const [requestedCategories, setRequestedCategories] = useState([]);
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get(`${apiUrl}/api/laboratory`,
        {
          headers: {
            "api-key": api_Key,
          }
        }
      )
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => record.labResult === "verified")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

  
  // Fetch lab result by laboratory request ID
  // const fetchLabResultByRequestId = async (laboratoryId) => {
  //   try {
  //     const response = await axios.get(
  //       `${apiUrl}/api/laboratory-results/by-request/${laboratoryId}`,
  //       {
  //         headers: {
  //           "api-key": api_Key,
  //         },
  //       }
  //     );
  //     if (response.status === 200 && response.data) {
  //       setLabDetails(response.data); // Set lab details

  //       // Determine requested categories
  //       const categories = [];

  //       if (
  //         response.data.bloodChemistry &&
  //         hasNonEmptyFields(response.data.bloodChemistry)
  //       ) {
  //         categories.push("Blood Chemistry");
  //       }

  //       if (
  //         response.data.Hematology &&
  //         hasNonEmptyFields(response.data.Hematology)
  //       ) {
  //         categories.push("Hematology");
  //       }

  //       if (
  //         response.data.clinicalMicroscopyParasitology &&
  //         hasNonEmptyFields(response.data.clinicalMicroscopyParasitology)
  //       ) {
  //         categories.push("Clinical Microscopy and Parasitology");
  //       }

  //       if (
  //         response.data.bloodBankingSerology &&
  //         hasNonEmptyFields(response.data.bloodBankingSerology)
  //       ) {
  //         categories.push("Serology");
  //       }

  //       setRequestedCategories(categories);

  //       // Set visibility states
  //       setIsBloodChemistryVisible(categories.includes("Blood Chemistry"));
  //       setHematologyVisible(categories.includes("Hematology"));
  //       setClinicalMicroscopyVisible(
  //         categories.includes("Clinical Microscopy and Parasitology")
  //       );
  //       setSerologyVisible(categories.includes("Serology"));

  //       setIsModalOpen(true); // Open the modal
  //     } else {
  //       alert("No laboratory result found for this request ID.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching laboratory result by request ID:", error);
  //     alert(
  //       "Failed to load laboratory result. Please check the request ID and try again."
  //     );
  //   }
  // };

  const fetchLabResultByRequestId = async (laboratoryId) => {
  try {
      const response = await axios.get(
        `${apiUrl}/api/laboratory-results/by-request/${laboratoryId}`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
    console.log("✅ Lab Result fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching lab result:", error.response?.data || error);
    return null;
  }
};

  // const openModal = (laboratoryId) => {
  //   fetchLabResultByRequestId(laboratoryId);
  // };

  const openModal = async (laboratoryId) => {
  const result = await fetchLabResultByRequestId(laboratoryId);
  console.log("📄 Lab result fetched:", result);

  const transformedTestResults = result.results?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = {};

    const testEntry = {};

    // If result is an object (not just a string), extract fields
    if (typeof item.result === "object" && item.result !== null) {
      for (const [key, val] of Object.entries(item.result)) {
        if (key === "result") {
          testEntry.result = val;
        } else {
          testEntry[key] = val;
        }
      }
    } else {
      testEntry.result = item.result;
    }

    testEntry.referenceRange = item.referenceRange || "";

    // Handle additional subtests
    if (item.additionalTests?.length) {
      item.additionalTests.forEach((sub) => {
        testEntry[sub.testName] = sub.result;
        if (sub.referenceRange && !testEntry.referenceRange) {
          testEntry.referenceRange = sub.referenceRange;
        }
      });
    }

    acc[item.category][item.testName] = testEntry;
    return acc;
  }, {}) || {};

  setLabDetails({
    ...result,
    testResults: transformedTestResults,
  });

  setIsModalOpen(true);
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
  const toggleBloodChemistryVisibility = () => {
    setIsBloodChemistryVisible(!isBloodChemistryVisible);
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

  useEffect(() => {
    if (labDetails && labDetails.verifiedBy) {
      // Fetch employee details when labDetails.verifiedBy is set
      fetchEmployeeDetails(labDetails.verifiedBy);
    }
  }, [labDetails]); // Runs when labDetails changes

  // Function to fetch employee details by ID
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/employees/${employeeId}`,
        {
          headers: {
            'api-key': api_Key,
          }
        }
      );
      if (response.status === 200 && response.data) {
        setVerifiedByEmployee(response.data); // Set the employee details
      } else {
        console.error("Employee not found.");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const fetchPathologistDetails = async (pathologistId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/employees/${pathologistId}`,
        {
          headers: {
            'api-key': api_Key,
          }
        }
      );
      if (response.status === 200 && response.data) {
        setVerifiedByPathologist(response.data); // Store pathologist details
      } else {
        console.error("Pathologist not found.");
      }
    } catch (error) {
      console.error("Error fetching pathologist details:", error);
    }
  };

  useEffect(() => {
    if (labDetails && labDetails.verifiedByPathologist) {
      fetchPathologistDetails(labDetails.verifiedByPathologist); // Fetch pathologist details
    }
  }, [labDetails]);

  const hasNonEmptyFields = (obj) => {
    return Object.values(obj).some((value) => {
      if (value && typeof value === "object") {
        return hasNonEmptyFields(value);
      } else {
        return value !== "" && value !== null && value !== undefined;
      }
    });
  };

  const [isChemistryCertificateOpen, setIsChemistryCertificate] = useState(false);

  const handleOpenChemistryCertificate = (labDetails, ) => {
    setIsChemistryCertificate(true);
  };

  const handleCloseChemistryCertificate = () => {
    setIsChemistryCertificate(false); // Close the modal
  };
  
  const [isLabCompleteResultCertificateOpen, setIsLabCompleteResultCertificate] = useState(false);

  const handleOpenLabCompleteResultCertificate = (labDetails, ) => {
    setIsLabCompleteResultCertificate(true);
  };

  const handleCloseLabCompleteResultCertificate = () => {
    setIsLabCompleteResultCertificate(false); // Close the modal
  };

    const [formData, setFormData] = useState({});


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
              <td colSpan="4" className="py-4 text-center text-gray-500">
                No laboratory records found.
              </td>
            </tr>
          ) : (
            currentLabRecords.map((record) => {
              const testNames = record.tests?.map((test) => test.name).join(", ") || "No test data available";
              const createdAtFormatted = record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "Unknown date";

              return (
                <tr key={record._id} className="border-b">
                  <td className="py-4">
                    {record.patient ? (
                      <>
                        <p className="font-semibold">
                          {record.patient.lastname}, {record.patient.firstname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {createdAtFormatted}
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
                <span className="mr-2">&#9432;</span> Whole laboratory records
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

{(labDetails.results || []).map((testItem, index) => (
  <div key={index} className="mb-6">
    <h3 className="text-lg font-bold border-b pb-1 mb-2">
      {`${index + 1}. ${testItem.category}`}
    </h3>

    <div className="mb-4 space-y-1">
      {/* Main Test Name */}
      <div className="text-sm font-semibold">{testItem.testName}</div>

      {/* If result is a string (simple test) */}
      {typeof testItem.result?.result === "string" && Object.keys(testItem.result).length === 1 ? (
        <div className="flex items-center gap-4 text-sm ml-4">
          <div className="min-w-[150px] font-semibold">Result</div>
          <input
            type="text"
            value={testItem.result.result}
            readOnly
            className="flex-1 px-3 py-1 border rounded bg-gray-100"
          />
        </div>
      ) : (
        // Otherwise, assume it's an object with subtests
        Object.entries(testItem.result || {}).map(([key, val], subIndex) => (
          key !== "referenceRange" && key !== "whatShouldBeIncluded" ? (
            <div key={subIndex} className="flex items-center gap-4 text-sm ml-4">
              <div className="min-w-[150px]">{key}</div>
              <input
                type="text"
                value={val}
                readOnly
                className="flex-1 px-3 py-1 border rounded bg-gray-100"
              />
            </div>
          ) : null
        ))
      )}

      {/* Optional reference range */}
      {testItem.result?.referenceRange && (
        <div className="text-xs font-bold text-red-600 ml-[150px]">
          Reference: {testItem.result.referenceRange}
        </div>
      )}

      {/* Optional whatShouldBeIncluded */}
      {testItem.result?.whatShouldBeIncluded && (
        <div className="text-xs italic text-gray-600 ml-[150px]">
          Includes: {testItem.result.whatShouldBeIncluded}
        </div>
      )}
    </div>
  </div>
))}

            </form>

            {/* <div className="flex items-center gap-8">
              {labDetails.pathologistSignature && (
                <div className="flex flex-col items-center">
                  <img
                    src={labDetails.pathologistSignature}
                    alt="Pathologist Signature"
                    className="w-24 h-auto border border-gray-300 rounded-lg shadow-lg"
                  />

                  {verifiedByPathologist ? (
                    <>
                      <p className="text-gray-600 text-xs font-semibold text-center">
                        {verifiedByPathologist.firstname}{" "}
                        {verifiedByPathologist.lastname}
                      </p>
                      <p className="text-gray-600 text-xs text-center">
                        {verifiedByPathologist.role || "Pathologist"}
                      </p>
                      <p className="text-gray-600 text-xs text-center">
                        Department: {verifiedByPathologist.department || "N/A"}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600 text-xs text-center">
                      Loading Pathologist Details...
                    </p>
                  )}
                </div>
              )}
              {verifiedByEmployee && (
                <div
                  className="flex flex-col justify-start items-center"
                  style={{ marginTop: "3.7rem" }}
                >
                  <p className="text-gray-600 text-xs font-semibold">
                    {verifiedByEmployee.firstname} {verifiedByEmployee.lastname}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {verifiedByEmployee.role}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {verifiedByEmployee.department}
                  </p>
                </div>
              )}
            </div> */}

            {/* Buttons Wrapper trial*/}
            <div className="flex justify-end space-x-4 mt-4">
              {requestedCategories.includes("Blood Chemistry") && isBloodChemistryVisible && labDetails && verifiedByPathologist &&(
                <button
                  onClick={() => handleOpenChemistryCertificate(labDetails)}
                  className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
                >
                  Clinical Chemistry Form
                </button>
              )}
                  <ClinicalChemistryCertificate isOpen={isChemistryCertificateOpen} onClose={handleCloseChemistryCertificate} labDetails={labDetails} verifiedByPathologist={verifiedByPathologist}/>

                {(
                  requestedCategories.includes("Hematology") || requestedCategories.includes("Clinical Microscopy and Parasitology") || requestedCategories.includes("Serology")
                ) && labDetails && verifiedByPathologist && (
                  <button
                    onClick={() => handleOpenLabCompleteResultCertificate(labDetails)}
                    className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
                  >
                    Laboratory Result Form
                  </button>
                )}

                <LabCompleteResultCertificate isOpen={isLabCompleteResultCertificateOpen} onClose={handleCloseLabCompleteResultCertificate} labDetails={labDetails} verifiedByPathologist={verifiedByPathologist}/>

              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaboratoryResult;