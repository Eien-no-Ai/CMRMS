import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function LaboratoryPathologistVerification() {
        const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  useEffect(() => {
    fetchLabRecords();
    // fetchPathologistSignature();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get(`${apiUrl}/api/laboratory`, {
        headers: {
          "api-key": api_Key,
        },
      })
      .then((response) => {
        const completeRecords = response.data
          .filter(
            (record) => record.labResult === "for verification"
          )
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

const fetchLabResultByRequestId = async (laboratoryId) => {
  const id = laboratoryId._id;

  try {
    const response = await axios.get(
      `${apiUrl}/api/laboratory-results/by-request/${id}`,
      {
        headers: {
          "api-key": api_Key,
        },
      }
    );

    if (response.status === 200 && response.data) {
      const result = response.data;

      // ✅ Log the entire result
      console.log("✅ Full Lab Result Fetched:", result);

      // ✅ Log just the extracted test results
if (result.results && result.results.length > 0) {
  console.log("🧪 Extracted Test Results:");
  result.results.forEach((test, index) => {
    console.log(`Test #${index + 1}:`);
    console.log(`- Category: ${test.category}`);
    console.log(`- Name: ${test.testName}`);

    if (test.referenceRange) {
      console.log(`- Reference Range: ${test.referenceRange}`);
    }

    if (test.additionalTests && test.additionalTests.length > 0) {
      console.log(`- Additional Tests:`);
      test.additionalTests.forEach((included, i) => {
        console.log(`   • Test ${i + 1}:`);
        console.log(`     - Name: ${included.testName || "Unnamed"}`);
        console.log(`     - Result: ${included.result?.result ?? "N/A"}`);
        console.log(`     - Reference Range: ${included.referenceRange || "N/A"}`);
      });
    }

    // Main test result
    if (test.result && test.result.result !== undefined) {
      console.log(`- Result: ${test.result.result}`);
    }
  });
} else {
  console.warn("⚠️ No test results found in 'results' field.");
}


      // Save to state
      setLabDetails(result);

      // Determine requested categories
      const categories = [];

      if (result.bloodChemistry && hasNonEmptyFields(result.bloodChemistry)) {
        categories.push("Blood Chemistry");
      }
      if (result.Hematology && hasNonEmptyFields(result.Hematology)) {
        categories.push("Hematology");
      }
      if (result.clinicalMicroscopyParasitology && hasNonEmptyFields(result.clinicalMicroscopyParasitology)) {
        categories.push("Clinical Microscopy and Parasitology");
      }
      if (result.bloodBankingSerology && hasNonEmptyFields(result.bloodBankingSerology)) {
        categories.push("Serology");
      }

      setRequestedCategories(categories);
      setIsBloodChemistryVisible(categories.includes("Blood Chemistry"));
      setHematologyVisible(categories.includes("Hematology"));
      setClinicalMicroscopyVisible(categories.includes("Clinical Microscopy and Parasitology"));
      setSerologyVisible(categories.includes("Serology"));

      setIsModalOpen(true);
    } else {
      alert("No laboratory result found for this request ID.");
    }
  } catch (error) {
    console.error("❌ Error fetching laboratory result by request ID:", error);
    alert("Failed to load laboratory result. Please check the request ID and try again.");
  }
};

  const openModal = (laboratoryId) => {
    fetchLabResultByRequestId(laboratoryId);
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
        `${apiUrl}/api/signature/user/${userId}`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
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

  // Verify button handler
  // const verifyLabResult = async () => {
  //   if (!labDetails) {
  //     alert("Lab details not found. Unable to verify.");
  //     return;
  //   }

  //   const employeeId = localStorage.getItem("userId"); // Get the logged-in pathologist's ID

  //   // Fetch signature if not already available
  //   if (!pathologistSignatureUrl) {
  //     console.log("Fetching pathologist signature before verification...");
  //     await fetchPathologistSignature();
  //   }

  //   // Ensure pathologistSignatureUrl is set
  //   console.log("Pathologist Signature URL:", pathologistSignatureUrl); // Debug log

  //   const updatedLabResultData = {
  //     ...labDetails,
  //     verifiedByPathologist: employeeId,
  //     pathologistSignature: pathologistSignatureUrl, // Use the fetched signature URL
  //     verificationDate: new Date(),
  //     status: "verified",
  //   };

  //   try {
  //     const response = await axios.put(
  //       `${apiUrl}/api/laboratory-results/update/${labDetails._id}`,
  //       updatedLabResultData,
  //       {
  //         headers: {
  //           "api-key": api_Key,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       const labUpdateResponse = await axios.put(
  //         `${apiUrl}/api/laboratory/${labDetails.laboratoryId}`,
  //         { labResult: "verified" },
  //         {
  //           headers: {
  //             "api-key": api_Key,
  //           },
  //         }
  //       );

  //       if (labUpdateResponse.status === 200) {
  //         // Trigger success modal after verification
  //         setShowVerificationModal(true); // Show modal that verification is complete
  //         setIsModalOpen(false);
  //         fetchLabRecords();
  //       } else {
  //         console.error(
  //           "Failed to update lab result status in LaboratoryModel. Please try again."
  //         );
  //       }
  //     } else {
  //       console.error(
  //         "Failed to verify the lab result in LaboratoryResultsModel. Please try again."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error verifying lab result:", error);
  //   }
  // };

  const verifyLabResult = async () => {
  if (!labDetails) {
    alert("Lab details not found. Unable to verify.");
    return;
  }

  const employeeId = localStorage.getItem("userId"); // Get the logged-in pathologist's ID

  const updatedLabResultData = {
    ...labDetails,
    verifiedByPathologist: employeeId,
    verificationDate: new Date(),
    status: "verified",
    // Remove pathologistSignature field completely
  };

  try {
    const response = await axios.put(
      `${apiUrl}/api/laboratory-results/update/${labDetails._id}`,
      updatedLabResultData,
      {
        headers: {
          "api-key": api_Key,
        },
      }
    );

    if (response.status === 200) {
      const labUpdateResponse = await axios.put(
        `${apiUrl}/api/laboratory/${labDetails.laboratoryId}`,
        { labResult: "verified" },
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      if (labUpdateResponse.status === 200) {
        setShowVerificationModal(true);
        setIsModalOpen(false);
        fetchLabRecords();
      } else {
        console.error(
          "Failed to update lab result status in LaboratoryModel. Please try again."
        );
      }
    } else {
      console.error(
        "Failed to verify the lab result in LaboratoryResultsModel. Please try again."
      );
    }
  } catch (error) {
    console.error("Error verifying lab result:", error);
  }
};


  // // Fetch the pathologist's signature
  // const fetchPathologistSignature = async () => {
  //   const userId = localStorage.getItem("userId"); // Get the logged-in user ID from localStorage
  //   console.log("Fetching pathologist signature for userId:", userId); // Debug log

  //   try {
  //     const response = await axios.get(
  //       `${apiUrl}/api/pathologist-signature/${userId}`,
  //       {
  //         headers: {
  //           "api-key": api_Key,
  //         },
  //       }
  //     );
  //     console.log("Pathologist signature response:", response.data); // Debug log

  //     if (response.data && response.data.signature) {
  //       setPathologistSignatureUrl(response.data.signature); // Save the signature URL
  //     } else {
  //       console.error("No pathologist signature found in response.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching pathologist signature:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchPathologistSignature();
  // }, []);

  // useEffect(() => {
  //   console.log("Pathologist Signature URL updated:", pathologistSignatureUrl); // Debug log
  // }, [pathologistSignatureUrl]);

  const hasNonEmptyFields = (obj) => {
    return Object.values(obj).some((value) => {
      if (value && typeof value === "object") {
        return hasNonEmptyFields(value);
      } else {
        return value !== "" && value !== null && value !== undefined;
      }
    });
  };

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
            <th className="py-3 w-1/4">Lab Test Req</th>
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
            currentLabRecords.map((record) => {
              // If record.tests exists and is array, use it for test names
              let testNames = "No test data available";

              if (Array.isArray(record.tests) && record.tests.length > 0) {
                testNames = record.tests
                  .map((test) => test.name)
                  .filter(Boolean)
                  .join(", ");
              } else {
                // fallback: flatten nested categories (your existing method)
                const nestedTests = [
                  ...Object.entries(record.bloodChemistry || {})
                    .filter(([key, value]) => value)
                    .map(([key, value]) => value),
                  ...Object.entries(record.hematology || {})
                    .filter(([key, value]) => value)
                    .map(([key, value]) => value),
                  ...Object.entries(record.clinicalMicroscopyParasitology || {})
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
                  .map((test) => (test.name ? test.name : test)) // if test object has a name property
                  .join(", ");

                if (nestedTests) testNames = nestedTests;
              }

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
                  <td className="py-4 ">
                    <button
                      onClick={() => {
                        console.log("Clicked record ID:", record);
                        openModal(record);
                      }}
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
                <span className="mr-2">&#9432;</span> Whole laboratory request
                for verification list is not shown to save initial load time.
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
<div>
  <h2 className="text-xl font-bold mb-4">Laboratory Results</h2>

  {labDetails && labDetails.results && labDetails.results.length > 0 ? (
    labDetails.results.map((test, i) => (
      <div key={i} className="mb-6 border p-4 rounded shadow-sm">
        <h3 className="font-semibold text-lg mb-2">{test.category}</h3>

        <p><strong>Test Name:</strong> {test.testName}</p>

        {/* Main result */}
        {test.result && test.result.result !== undefined && test.result.result !== null && (
          <p><strong>Result:</strong> {test.result.result.toString()}</p>
        )}

        {/* Display additionalTests if any */}
        {test.additionalTests && test.additionalTests.length > 0 && (
          <div className="mt-3 ml-4 border-l-2 border-gray-300 pl-3">
            <strong>Additional Tests:</strong>
            {test.additionalTests.map((includedItem, idx) => (
              <div key={idx} className="mt-2">
                <p>
                  <strong>Test Name:</strong> {includedItem.testName || "Unnamed Test"}
                </p>
                <p>
                  <strong>Result:</strong>{" "}
                  {includedItem.result && includedItem.result.result !== undefined
                    ? includedItem.result.result.toString()
                    : "N/A"}
                </p>
                {includedItem.referenceRange && (
                  <p>
                    <strong>Reference Range:</strong> {includedItem.referenceRange}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main reference range if available */}
        {test.referenceRange && (
          <p className="mt-2">
            <strong>Reference Range:</strong> {test.referenceRange}
          </p>
        )}
      </div>
    ))
  ) : (
    <p>No laboratory test results available.</p>
  )}
</div>


            </form>

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
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Laboratory Result Verified
            </h2>
            <p className="text-center text-gray-600 mb-4">
              The laboratory result has been successfully verified .
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowVerificationModal(false)} // Close the modal
                className="px-6 py-2 text-white bg-custom-red rounded hover:bg-red-600 transition duration-300 ease-in-out"
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

export default LaboratoryPathologistVerification;