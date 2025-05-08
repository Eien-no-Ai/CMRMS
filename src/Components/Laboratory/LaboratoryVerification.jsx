import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function LaboratoryVerification() {
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
  const [requestedCategories, setRequestedCategories] = useState([]);

  // Separate signature URLs for each section
  const [hematologySignatureUrl, setHematologySignatureUrl] = useState(null);
  const [clinicalMicroscopySignatureUrl, setClinicalMicroscopySignatureUrl] =
    useState(null);
  const [serologySignatureUrl, setSerologySignatureUrl] = useState(null);
  const userId = localStorage.getItem("userId"); // Get the user ID from local storage
  const [pathologistSignatureUrl, setPathologistSignatureUrl] = useState(null);

  useEffect(() => {
    fetchLabRecords();
    fetchPathologistSignature();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get("http://localhost:3001/api/laboratory")
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => record.labResult === "for verification")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

// Helper to check if a test has any filled result or subfields
const hasNonEmptyTest = (test) => {
  if (!test || typeof test !== "object") return false;
  return Object.values(test).some((value) => {
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "object") {
      return Object.values(value).some(
        (subValue) => typeof subValue === "string" && subValue.trim() !== ""
      );
    }
    return false;
  });
};

const fetchLabResultByRequestId = async (laboratoryId) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/laboratory-results/by-request/${laboratoryId}`
    );
    console.log("✅ Lab Result fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching lab result:", error.response?.data || error);
    return null;
  }
};



const openModal = async (laboratoryId) => {
  const result = await fetchLabResultByRequestId(laboratoryId);
  console.log("📄 Lab result fetched:", result);
  setLabDetails(result);      // ✅ update correct state
  setIsModalOpen(true);       // ✅ open modal
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

  const fetchSignature = async (section) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/signature/user/${userId}`
      );
      if (response.data && response.data.signature) {
        switch (section) {
          case "hematology":
            setHematologySignatureUrl(response.data.signature);
            break;
          case "clinicalMicroscopy":
            setClinicalMicroscopySignatureUrl(response.data.signature);
            break;
          case "serology":
            setSerologySignatureUrl(response.data.signature);
            break;
          default:
            break;
        }
      } else {
        console.error("No signature found.");
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
    }
  };

const verifyLabResult = async () => {
  if (!labDetails || !labDetails.testResults) {
    alert("Lab details not found. Unable to verify.");
    return;
  }

  const employeeId = localStorage.getItem("userId");

  // Prepare updated testResults object
  const updatedTestResults = {};

  for (const [category, tests] of Object.entries(labDetails.testResults)) {
    updatedTestResults[category] = {
      ...tests,
      signature: (category === "Hematology" && hematologySignatureUrl) ||
                 (category === "clinicalMicroscopyParasitology" && clinicalMicroscopySignatureUrl) ||
                 (category === "bloodBankingSerology" && serologySignatureUrl) ||
                 tests.signature || null
    };
  }

  const updatedLabResultData = {
    testResults: updatedTestResults,
    pathologistSignature: pathologistSignatureUrl || labDetails.pathologistSignature || null,
    verifiedBy: employeeId,
    verificationDate: new Date(),
  };

  console.log("Updated Data for verification:", updatedLabResultData);

  try {
    // First, update the LaboratoryResultsModel
    const response = await axios.put(
      `http://localhost:3001/api/laboratory-results/update/${labDetails._id}`,
      updatedLabResultData
    );

    console.log("Response from LaboratoryResults API:", response.data);

    if (response.status === 200) {
      // Second, update lab status
      const labUpdateResponse = await axios.put(
        `http://localhost:3001/api/laboratory/${labDetails.laboratoryId}`,
        { labResult: "vefiried" }
      );

      console.log("Response from Laboratory API:", labUpdateResponse.data);

      if (labUpdateResponse.status === 200) {
        alert("Lab result successfully verified and marked as complete.");
        console.log("Verification successful!");
        setIsModalOpen(false);
        fetchLabRecords();
        fetchVerifiedByEmployee(employeeId);
      } else {
        alert("Failed to update lab result status.");
      }
    } else {
      alert("Failed to verify the lab result.");
    }
  } catch (error) {
    console.error("Error verifying lab result:", error);
    alert("An error occurred during verification.");
  }
};


  const fetchVerifiedByEmployee = async (employeeId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/employees/${employeeId}`
      );
      if (response.status === 200 && response.data) {
        setVerifiedByEmployee(response.data); // Save the employee details who verified the record
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  // Fetch the pathologist's signature
  const fetchPathologistSignature = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/pathologist-signature"
      );
      if (response.data && response.data.signature) {
        setPathologistSignatureUrl(response.data.signature);
      } else {
        console.error("No pathologist signature found.");
      }
    } catch (error) {
      console.error("Error fetching pathologist signature:", error);
    }
  };

  const hasNonEmptyFields = (obj) => {
    return Object.values(obj).some((value) => {
      if (value && typeof value === "object") {
        return hasNonEmptyFields(value);
      } else {
        return value !== "" && value !== null && value !== undefined;
      }
    });
  };

    const [selectedRecord, setSelectedRecord] = useState(null);


  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Laboratory Verification</h1>
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
            <th className="py-3 w-1/4">Lab Test Reqss</th>
            <th className="py-3 w-1/4">Status</th>
            <th className="py-3 w-1/12"></th>
          </tr>
        </thead>
        <tbody>
          {currentLabRecords.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center text-gray-500">
                No laboratory request for verification found.
              </td>
            </tr>
          ) : (
            [...currentLabRecords]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((record) => {
                const testNames =
                  record.tests?.map((test) => test.name).filter(Boolean).join(", ") ||
                  "No test data available";


                  const categoryMappings = {
                    "Blood Chemistry": "bloodChemistry",
                    "Hematology": "Hematology",
                    "Clinical Microscopy and Parasitology": "clinicalMicroscopyParasitology",
                    "Serology": "bloodBankingSerology",
                  };
                  
                  const toggleFunctions = {
                    "Blood Chemistry": toggleBloodChemistryVisibility,
                    "Hematology": toggleHematologyVisibility,
                    "Clinical Microscopy and Parasitology": toggleClinicalMicroscopyVisibility,
                    "Serology": toggleSerologyVisibility,
                  };
                  
                  const visibilityStates = {
                    "Blood Chemistry": isBloodChemistryVisible,
                    "Hematology": isHematologyVisible,
                    "Clinical Microscopy and Parasitology": isClinicalMicroscopyVisible,
                    "Serology": isSerologyVisible,
                  };
                  
                  const categoryTitles = {
                    "Blood Chemistry": "I. Blood Chemistry",
                    "Hematology": "II. Hematology",
                    "Clinical Microscopy and Parasitology": "III. Clinical Microscopy & Parasitology",
                    "Serology": "IV. Blood Banking And Serology",
                  };

                return (
                  <tr key={record._id} className="border-b">
                    <td className="py-4">
                      {record.patient ? (
                        <>
                          <p className="font-semibold">
                            {record.patient.lastname}, {record.patient.firstname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.createdAt
                              ? new Date(record.createdAt).toLocaleString()
                              : "Unknown date"}
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
                      <p>{record.labResult || "Pending"}</p>
                    </td>
                    <td className="py-4">
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
        Page <span className="text-custom-red">{currentPage}</span> of {totalPages}
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
        <span className="mr-2">&#9432;</span> Whole laboratory request for verification list is not shown to save initial load time.
      </p>
    </div>
    <div className="flex justify-center mt-4">
      <button
        onClick={toggleListVisibility}
        className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
      >
        Load All Laboratory Requests.
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
              {labDetails?.testResults &&
        Object.entries(labDetails.testResults)
          .filter(([category, tests]) => typeof tests === "object" && tests !== null)
          .map(([category, tests], catIndex) => (
            <div key={catIndex} className="mb-6">
              <h3 className="text-lg font-bold border-b pb-1 mb-2">
                {`${catIndex + 1}. ${category}`}
              </h3>

              {Object.entries(tests).map(([testName, testValue], testIndex) => (
                <div key={testIndex} className="mb-4">
                  <div className="font-semibold mb-1">{testName}</div>

                  {typeof testValue === "object" &&
                  (testValue.result || testValue.referenceRange || Object.keys(testValue).length > 0) ? (
                    <div className="ml-4 space-y-2">
                      {testValue.result && (
                        <div className="flex items-center gap-4">
                          <div className="min-w-[150px] font-medium text-sm">Result</div>
                          <input
                            type="text"
                            readOnly
                            value={testValue.result}
                            className="flex-1 px-3 py-1 border rounded bg-gray-100"
                          />
                          {testValue.referenceRange && (
                            <div className="text-xs font-bold text-red-600 whitespace-nowrap">
                              Reference: {testValue.referenceRange}
                            </div>
                          )}
                        </div>
                      )}

                      {Object.entries(testValue)
                        .filter(([key]) => key !== "result" && key !== "referenceRange")
                        .map(([fieldName, subValue], i) => (
                          <div key={i} className="flex items-center gap-4 text-sm">
                            <div className="min-w-[150px] text-gray-800 font-semibold">
                              {fieldName}
                            </div>
                            <input
                              type="text"
                              readOnly
                              value={subValue || "N/A"}
                              className="flex-1 px-3 py-1 border rounded bg-gray-50"
                            />
                            <div className="text-sm text-gray-400">—</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="min-w-[150px] text-sm font-medium">Result</div>
                      <input
                        type="text"
                        readOnly
                        value={testValue || "N/A"}
                        className="flex-1 px-3 py-1 border rounded bg-gray-100"
                      />
                      <div className="text-sm text-gray-400">—</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}            </form>

            {/* Buttons Wrapper */}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Close
              </button>
              <button
                type="button"
                onClick={verifyLabResult} // Trigger verification on click
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaboratoryVerification;
