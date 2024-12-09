import React, { useState, useEffect } from "react";
import { BiSearch, BiChevronDown } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function LaboratoryPathologistVerification() {
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
    fetchPathologistSignature();
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
          .filter(
            (record) => record.labResult === "for pathologist verification"
          )
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
        `${apiUrl}/api/laboratory-results/by-request/${laboratoryId}`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
      if (response.status === 200 && response.data) {
        setLabDetails(response.data); // Set lab details

        // Determine requested categories
        const categories = [];

        if (
          response.data.bloodChemistry &&
          hasNonEmptyFields(response.data.bloodChemistry)
        ) {
          categories.push("Blood Chemistry");
        }

        if (
          response.data.Hematology &&
          hasNonEmptyFields(response.data.Hematology)
        ) {
          categories.push("Hematology");
        }

        if (
          response.data.clinicalMicroscopyParasitology &&
          hasNonEmptyFields(response.data.clinicalMicroscopyParasitology)
        ) {
          categories.push("Clinical Microscopy and Parasitology");
        }

        if (
          response.data.bloodBankingSerology &&
          hasNonEmptyFields(response.data.bloodBankingSerology)
        ) {
          categories.push("Serology");
        }

        setRequestedCategories(categories);

        // Set visibility states
        setIsBloodChemistryVisible(categories.includes("Blood Chemistry"));
        setHematologyVisible(categories.includes("Hematology"));
        setClinicalMicroscopyVisible(
          categories.includes("Clinical Microscopy and Parasitology")
        );
        setSerologyVisible(categories.includes("Serology"));

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
          }
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
  const verifyLabResult = async () => {
    if (!labDetails) {
      alert("Lab details not found. Unable to verify.");
      return;
    }

    const employeeId = localStorage.getItem("userId"); // Get the logged-in pathologist's ID

    // Fetch signature if not already available
    if (!pathologistSignatureUrl) {
      console.log("Fetching pathologist signature before verification...");
      await fetchPathologistSignature();
    }

    // Ensure pathologistSignatureUrl is set
    console.log("Pathologist Signature URL:", pathologistSignatureUrl); // Debug log

    const updatedLabResultData = {
      ...labDetails,
      verifiedByPathologist: employeeId,
      pathologistSignature: pathologistSignatureUrl, // Use the fetched signature URL
      verificationDate: new Date(),
      status: "verified",
    };

    try {
      const response = await axios.put(
        `${apiUrl}/api/laboratory-results/update/${labDetails._id}`,
        updatedLabResultData,
        {
          headers: {
            "api-key": api_Key,
          }
        }
      );

      if (response.status === 200) {
        const labUpdateResponse = await axios.put(
          `${apiUrl}/api/laboratory/${labDetails.laboratoryId}`,
          { labResult: "verified" },
          {
            headers: {
              "api-key": api_Key,
            }
          }
        );

        if (labUpdateResponse.status === 200) {
          // Trigger success modal after verification
          setShowVerificationModal(true);  // Show modal that verification is complete
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

  // Fetch the pathologist's signature
  const fetchPathologistSignature = async () => {
    const userId = localStorage.getItem("userId"); // Get the logged-in user ID from localStorage
    console.log("Fetching pathologist signature for userId:", userId); // Debug log

    try {
      const response = await axios.get(
        `${apiUrl}/api/pathologist-signature/${userId}`,
        {
          headers: {
            "api-key": api_Key,
          }
        }
      );
      console.log("Pathologist signature response:", response.data); // Debug log

      if (response.data && response.data.signature) {
        setPathologistSignatureUrl(response.data.signature); // Save the signature URL
      } else {
        console.error("No pathologist signature found in response.");
      }
    } catch (error) {
      console.error("Error fetching pathologist signature:", error);
    }
  };

  useEffect(() => {
    fetchPathologistSignature();
  }, []);

  useEffect(() => {
    console.log("Pathologist Signature URL updated:", pathologistSignatureUrl); // Debug log
  }, [pathologistSignatureUrl]);

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
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500"
                      >
                        No laboratory request for verification found.
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
                  className={`px-4 py-2 mr-2 rounded-lg border ${currentPage === 1
                    ? "bg-gray-300"
                    : "bg-custom-red text-white hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={paginateNext}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border ${currentPage === totalPages
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
              {/* Blood Chemistry Section */}
              {requestedCategories.includes("Blood Chemistry") && (
                <div className="mb-0">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={toggleBloodChemistryVisibility}
                  >
                    <h3 className="text-lg font-semibold my-0 py-2">
                      I. Blood Chemistry
                    </h3>
                    <BiChevronDown
                      className={`transform transition-transform duration-300 ${isBloodChemistryVisible ? "rotate-180" : ""
                        }`}
                      size={24}
                    />
                  </div>
                  <div className="w-full h-px bg-gray-300 my-0"></div>

                  {isBloodChemistryVisible && (
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div className="col-span-1 font-semibold">Test</div>
                      <div className="col-span-1 font-semibold">Result</div>
                      <div className="col-span-1 font-semibold">
                        Reference Range
                      </div>

                      {/* FBS */}
                      <div className="col-span-1">FBS</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="bloodSugar"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.bloodSugar || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                bloodSugar: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">70 - 105 mg/dL</div>

                      {/* Total Cholesterol */}
                      <div className="col-span-1">Total Cholesterol</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="totalCholesterol"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={
                            labDetails.bloodChemistry?.totalCholesterol || ""
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                totalCholesterol: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">140 - 200 mg/dL</div>

                      {/* Triglycerides */}
                      <div className="col-span-1">Triglycerides</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="triglyceride"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.triglyceride || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                triglyceride: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">{"<200 mg/dL"}</div>

                      {/* Blood Uric Acid */}
                      <div className="col-span-1">Blood Uric Acid</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="bloodUricAcid"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.bloodUricAcid || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                bloodUricAcid: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        MEN: 3.5 - 7.2 mg/dL <br />
                        WOMEN: 2.6 - 6.0 mg/dL
                      </div>

                      {/* Blood Urea Nitrogen */}
                      <div className="col-span-1">Blood Urea Nitrogen</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="bloodUreaNitrogen"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={
                            labDetails.bloodChemistry?.bloodUreaNitrogen || ""
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                bloodUreaNitrogen: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">4.67 - 23.35 mg/dL</div>

                      {/* Creatinine */}
                      <div className="col-span-1">Creatinine</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="creatinine"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.creatinine || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                creatinine: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        MEN: 0.7 - 1.2 mg/dL <br />
                        WOMEN: 0.6 - 1.1 mg/dL
                      </div>

                      {/* AST/SGOT */}
                      <div className="col-span-1">AST/SGOT</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="SGOT_AST"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.SGOT_AST || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                SGOT_AST: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        MEN: UP TO 40 U/L <br />
                        WOMEN: UP TO 33 U/L
                      </div>

                      {/* ALT/SGPT */}
                      <div className="col-span-1">ALT/SGPT</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="SGPT_ALT"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={labDetails.bloodChemistry?.SGPT_ALT || ""}
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                SGPT_ALT: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        MEN: UP TO 41 U/L <br />
                        WOMEN: UP TO 32 U/L
                      </div>

                      {/* Direct HDL */}
                      <div className="col-span-1">Direct HDL</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="HDL_cholesterol"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={
                            labDetails.bloodChemistry?.HDL_cholesterol || ""
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                HDL_cholesterol: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        MEN: 40 - 50 mg/dL <br />
                        WOMEN: 45 - 60 mg/dL
                      </div>

                      {/* Direct LDL */}
                      <div className="col-span-1">Direct LDL</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          name="LDL_cholesterol"
                          className="w-full px-3 py-1 border rounded bg-gray-100"
                          value={
                            labDetails.bloodChemistry?.LDL_cholesterol || ""
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              bloodChemistry: {
                                ...labDetails.bloodChemistry,
                                LDL_cholesterol: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1">{"<130 mg/dL"}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Hematology Section */}
              {requestedCategories.includes("Hematology") && (
                <div className="mb-0">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={toggleHematologyVisibility}
                  >
                    <h3 className="text-lg font-semibold my-0 py-2">
                      II. Hematology
                    </h3>
                    <BiChevronDown
                      className={`transform transition-transform duration-300 ${isHematologyVisible ? "rotate-180" : ""
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
                          onChange={(e) => {
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                redBloodCellCount: e.target.value,
                              },
                            });
                          }}
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
                          onChange={(e) => {
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                Hemoglobin: e.target.value,
                              },
                            });
                          }}
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
                          onChange={(e) => {
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                Hematocrit: e.target.value,
                              },
                            });
                          }}
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
                          onChange={(e) => {
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                LeukocyteCount: e.target.value,
                              },
                            });
                          }}
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  segmenters: e.target.value,
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  lymphocytes: e.target.value,
                                },
                              },
                            })
                          }
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
                            labDetails.Hematology?.DifferentialCount
                              ?.monocytes || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  monocytes: e.target.value,
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  eosinophils: e.target.value,
                                },
                              },
                            })
                          }
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
                            labDetails.Hematology?.DifferentialCount
                              ?.basophils || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  basophils: e.target.value,
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                DifferentialCount: {
                                  ...labDetails.Hematology?.DifferentialCount,
                                  total: e.target.value,
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                PlateletCount: e.target.value,
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              Hematology: {
                                ...labDetails.Hematology,
                                others: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-span-1"></div>
                      <div className="col-span-1"></div>

                      <div className="col-span-3 flex justify-end">
                        {/* {!hematologySignatureUrl && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevents the page refresh
                            fetchSignature("hematology");
                          }}
                        >
                          Attach Signature
                        </button>
                      )} */}

                        {/* Display fetched signature image */}
                        {hematologySignatureUrl && (
                          <div className="flex justify-end">
                            <img
                              src={hematologySignatureUrl}
                              alt="Signature"
                              className="w-24 h-auto border border-gray-300 rounded-lg shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clinical Microscopy and Parasitology Section */}
              {requestedCategories.includes(
                "Clinical Microscopy and Parasitology"
              ) && (
                  <div className="mb-0">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={toggleClinicalMicroscopyVisibility}
                    >
                      <h3 className="text-lg font-semibold mb-0 py-2">
                        III. Clinical Microscopy and Parasitology
                      </h3>
                      <BiChevronDown
                        className={`transform transition-transform duration-300 ${isClinicalMicroscopyVisible ? "rotate-180" : ""
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  LMP: e.target.value,
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  macroscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.macroscopicExam,
                                    color: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  macroscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.macroscopicExam,
                                    appearance: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    sugar: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Urobilinogen</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.urobilinogen ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    urobilinogen: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Albumin</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.albumin || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    albumin: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Ketones</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.ketones || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    ketones: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Blood</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.blood || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    blood: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Nitrite</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.nitrites || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    nitrites: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Bilirubin</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.bilirubin ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    bilirubin: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Leukocyte</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.leukocytes ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    leukocytes: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Reaction</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam?.reaction || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    reaction: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Specific Gravity</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.chemicalExam
                              ?.specificGravity || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  chemicalExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.chemicalExam,
                                    specificGravity: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                              ?.routineUrinalysis?.microscopicExam?.pusCells ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    pusCells: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Epithelial Cells</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam
                              ?.epithelialCells || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    epithelialCells: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    RBC: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Mucus Threads</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam
                              ?.mucusThreads || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    mucusThreads: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Bacteria</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/hpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.bacteria ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    bacteria: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Crystals</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.crystals ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    crystals: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    yeastCells: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Amorphous</label>
                        <input
                          type="text"
                          className="col-span-1 border rounded px-3 py-1"
                          placeholder="/lpf"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.amorphous ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    amorphous: e.target.value,
                                  },
                                },
                              },
                            })
                          }
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    casts: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Others</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineUrinalysis?.microscopicExam?.others ||
                            "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineUrinalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineUrinalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineUrinalysis?.microscopicExam,
                                    others: e.target.value,
                                  },
                                },
                              },
                            })
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
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineFecalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineFecalysis,
                                  color: e.target.value,
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Consistency</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.consistency || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineFecalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineFecalysis,
                                  consistency: e.target.value,
                                },
                              },
                            })
                          }
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
                              ?.routineFecalysis?.microscopicExam
                              ?.directFecalSmear || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineFecalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineFecalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineFecalysis?.microscopicExam,
                                    directFecalSmear: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />
                        <label className="col-span-1">Kato Thick Smear</label>
                        <input
                          type="text"
                          className="col-span-2 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.microscopicExam
                              ?.katoThickSmear || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineFecalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineFecalysis,
                                  microscopicExam: {
                                    ...labDetails.clinicalMicroscopyParasitology
                                      ?.routineFecalysis?.microscopicExam,
                                    katoThickSmear: e.target.value,
                                  },
                                },
                              },
                            })
                          }
                        />

                        <label className="col-span-1">Others</label>
                        <input
                          type="text"
                          className="col-span-5 border rounded px-3 py-1"
                          value={
                            labDetails.clinicalMicroscopyParasitology
                              ?.routineFecalysis?.others || "N/A"
                          }
                          onChange={(e) =>
                            setLabDetails({
                              ...labDetails,
                              clinicalMicroscopyParasitology: {
                                ...labDetails.clinicalMicroscopyParasitology,
                                routineFecalysis: {
                                  ...labDetails.clinicalMicroscopyParasitology
                                    ?.routineFecalysis,
                                  others: e.target.value,
                                },
                              },
                            })
                          }
                        />
                        {/* Signature Button for Clinical Microscopy */}
                        <div className="col-span-6 flex justify-end">
                          {/* {!clinicalMicroscopySignatureUrl && (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevents the page refresh
                          fetchSignature("clinicalMicroscopy");
                        }}
                      >
                        Attach Signature
                      </button>
                    )} */}

                          {clinicalMicroscopySignatureUrl && (
                            <div className="flex justify-end">
                              <img
                                src={clinicalMicroscopySignatureUrl}
                                alt="Signature"
                                className="w-24 h-auto border border-gray-300 rounded-lg shadow-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              {/* Serology Section */}
              {requestedCategories.includes("Serology") && (
                <div className="mb-0">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={toggleSerologyVisibility}
                  >
                    <h3 className="text-lg font-semibold mb-0 py-2">
                      IV. Serology
                    </h3>
                    <BiChevronDown
                      className={`transform transition-transform duration-300 ${isSerologyVisible ? "rotate-180" : ""
                        }`}
                      size={24}
                    />
                  </div>
                  <div className="w-full h-px bg-gray-300 my-0"></div>

                  {isSerologyVisible && (
                    <div className="grid grid-cols-12 gap-4 p-4">
                      {/* Hepatitis B Surface Antigen Determination and Anti-HAV Test */}
                      <h4 className="col-span-6 font-semibold">
                        Hepatitis B Surface Antigen Determination (Screening
                        Test Only)
                      </h4>
                      <h4 className="col-span-6 font-semibold">
                        Anti-HAV Test (Screening Test Only)
                      </h4>

                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology
                            ?.hepatitisBSurfaceAntigen?.methodUsed || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              hepatitisBSurfaceAntigen: {
                                ...labDetails.bloodBankingSerology
                                  ?.hepatitisBSurfaceAntigen,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.antiHAVTest
                            ?.methodUsed || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              antiHAVTest: {
                                ...labDetails.bloodBankingSerology?.antiHAVTest,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology
                            ?.hepatitisBSurfaceAntigen?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              hepatitisBSurfaceAntigen: {
                                ...labDetails.bloodBankingSerology
                                  ?.hepatitisBSurfaceAntigen,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.antiHAVTest
                            ?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              antiHAVTest: {
                                ...labDetails.bloodBankingSerology?.antiHAVTest,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology
                            ?.hepatitisBSurfaceAntigen?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.hepatitisBSurfaceAntigen.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              hepatitisBSurfaceAntigen: {
                                ...labDetails.bloodBankingSerology
                                  ?.hepatitisBSurfaceAntigen,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.antiHAVTest
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.antiHAVTest.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              antiHAVTest: {
                                ...labDetails.bloodBankingSerology?.antiHAVTest,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology
                            ?.hepatitisBSurfaceAntigen?.result || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              hepatitisBSurfaceAntigen: {
                                ...labDetails.bloodBankingSerology
                                  ?.hepatitisBSurfaceAntigen,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.antiHAVTest
                            ?.result || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              antiHAVTest: {
                                ...labDetails.bloodBankingSerology?.antiHAVTest,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      {/* Serum Pregnancy and Test for Treponema pallidum / Syphilis */}
                      <h4 className="col-span-6 font-semibold">
                        Serum Pregnancy
                      </h4>
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
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              serumPregnancy: {
                                ...labDetails.bloodBankingSerology
                                  ?.serumPregnancy,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.treponemaPallidumTest
                            ?.methodUsed || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              treponemaPallidumTest: {
                                ...labDetails.bloodBankingSerology
                                  ?.treponemaPallidumTest,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.serumPregnancy
                            ?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              serumPregnancy: {
                                ...labDetails.bloodBankingSerology
                                  ?.serumPregnancy,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.treponemaPallidumTest
                            ?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              treponemaPallidumTest: {
                                ...labDetails.bloodBankingSerology
                                  ?.treponemaPallidumTest,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.serumPregnancy
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.serumPregnancy.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              serumPregnancy: {
                                ...labDetails.bloodBankingSerology
                                  ?.serumPregnancy,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.treponemaPallidumTest
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.treponemaPallidumTest.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              treponemaPallidumTest: {
                                ...labDetails.bloodBankingSerology
                                  ?.treponemaPallidumTest,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.serumPregnancy
                            ?.result || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              serumPregnancy: {
                                ...labDetails.bloodBankingSerology
                                  ?.serumPregnancy,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.treponemaPallidumTest
                            ?.result || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              treponemaPallidumTest: {
                                ...labDetails.bloodBankingSerology
                                  ?.treponemaPallidumTest,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      {/* Salmonella typhi and Blood Typing */}
                      <h4 className="col-span-6 font-semibold">
                        Salmonella typhi
                      </h4>
                      <h4 className="col-span-6 font-semibold">Blood Typing</h4>

                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.salmonellaTyphi
                            ?.methodUsed || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              salmonellaTyphi: {
                                ...labDetails.bloodBankingSerology
                                  ?.salmonellaTyphi,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">ABO Type</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.bloodTyping
                            ?.ABOType || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              bloodTyping: {
                                ...labDetails.bloodBankingSerology?.bloodTyping,
                                ABOType: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.salmonellaTyphi
                            ?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              salmonellaTyphi: {
                                ...labDetails.bloodBankingSerology
                                  ?.salmonellaTyphi,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Rh Type</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.bloodTyping
                            ?.RhType || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              bloodTyping: {
                                ...labDetails.bloodBankingSerology?.bloodTyping,
                                RhType: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.salmonellaTyphi
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.salmonellaTyphi.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              salmonellaTyphi: {
                                ...labDetails.bloodBankingSerology
                                  ?.salmonellaTyphi,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
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
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              salmonellaTyphi: {
                                ...labDetails.bloodBankingSerology
                                  ?.salmonellaTyphi,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-6"></label>

                      {/* Test for Dengue and Others */}
                      <h4 className="col-span-6 font-semibold">
                        Test for Dengue
                      </h4>
                      <h4 className="col-span-6 font-semibold">Others</h4>

                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.testDengue
                            ?.methodUsed || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              testDengue: {
                                ...labDetails.bloodBankingSerology?.testDengue,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Method Used</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.others?.methodUsed ||
                          "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              others: {
                                ...labDetails.bloodBankingSerology?.others,
                                methodUsed: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.testDengue
                            ?.lotNumber || "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              testDengue: {
                                ...labDetails.bloodBankingSerology?.testDengue,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Lot No.</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.others?.lotNumber ||
                          "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              others: {
                                ...labDetails.bloodBankingSerology?.others,
                                lotNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.testDengue
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.testDengue.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              testDengue: {
                                ...labDetails.bloodBankingSerology?.testDengue,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Expiration Date</label>
                      <input
                        type="date"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.others
                            ?.expirationDate
                            ? new Date(
                              labDetails.bloodBankingSerology.others.expirationDate
                            )
                              .toISOString()
                              .split("T")[0]
                            : "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              others: {
                                ...labDetails.bloodBankingSerology?.others,
                                expirationDate: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.testDengue?.result ||
                          "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              testDengue: {
                                ...labDetails.bloodBankingSerology?.testDengue,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <label className="col-span-1">Result</label>
                      <input
                        type="text"
                        className="col-span-5 border rounded px-3 py-1"
                        value={
                          labDetails.bloodBankingSerology?.others?.result ||
                          "N/A"
                        }
                        onChange={(e) =>
                          setLabDetails({
                            ...labDetails,
                            bloodBankingSerology: {
                              ...labDetails.bloodBankingSerology,
                              others: {
                                ...labDetails.bloodBankingSerology?.others,
                                result: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      {/* Signature Button for Clinical Microscopy */}
                      <div className="col-span-12 flex justify-end space-x-6 items-center">
                        {/* {!serologySignatureUrl && (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevents the page refresh
                          fetchSignature("serology");
                        }}
                      >
                        Attach Signature
                      </button>
                    )} */}

                        {serologySignatureUrl && (
                          <div className="flex flex-col items-center">
                            <img
                              src={serologySignatureUrl}
                              alt="Signature"
                              className="w-24 h-auto border border-gray-300 rounded-lg shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold text-green-600">Laboratory Result Verified</h2>
            <p className="mt-4 text-gray-700">
              The laboratory result has been successfully verified .
            </p>
            <div className="flex justify-end mt-6">
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
