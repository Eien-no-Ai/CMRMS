import React, { useState, useEffect, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function Xray() {
  const [xrayRecords, setXrayRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const xrayRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isPatientAdded, setIsPatientAdded] = useState(false); // State for confirmation modal
  const [isResultAdded, setIsResultAdded] = useState(false); // Track result submission success
  const [isErrorImageModalOpen, setIsErrorImageModalOpen] = useState(false); // Error modal state
  const [formData, setFormData] = useState({
    ORNumber: "",
    XrayNo: "",
    date: "",
    name: "",
    age: "",
    sex: "",
    courseDept: "",
    patientType: "",
    diagnosis: "",
    xrayFindings: "", // New state for X-ray findings
    imageFile: "",
  });
  const fetchXrayRecords = useCallback(() => {
    axios
      .get("https://cmrms-backend.onrender.com/api/xrayResults")
      .then((response) => {
        // Filter only pending records without any role-based or type-based restrictions
        const filteredRecords = response.data.filter(
          (record) => record.xrayResult === "pending"
        );

        // Sort the records by creation date, most recent first
        const sortedRecords = filteredRecords.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );

        setXrayRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the X-ray records!", error);
      });
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchXrayRecords();
    }
  }, [userRole, fetchXrayRecords]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

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

  const [selectedRecord, setSelectedRecord] = useState(null); // Add this to your state

  const handleAddResult = (record) => {
    setSelectedRecord(record); // Store the selected record

    // Set formData to include the necessary fields, pulling values from selectedRecord
    setFormData({
      ORNumber: record.ORNumber || "",
      XrayNo: record.XrayNo || "", // Use record's XrayNo if available
      date: new Date().toISOString().split("T")[0],
      name: `${record.patient.lastname}, ${record.patient.firstname}`,
      age: getAge(record.patient.birthdate),
      sex: record.patient.sex,
      courseDept: record.patient.course || record.patient.position,
      patientType: record.patient.patientType,
      diagnosis: record.diagnosis || "", // If there's an existing diagnosis
      xrayFindings: record.xrayFindings || "", // If there's an existing xrayFindings
      imageFile: record.imageFile || "", // If there's an existing image file
    });
    setIsModalOpen(true); // Open the modal
  };

 
const handleSubmitResult = async () => {
  // Ensure selectedRecord exists and has an _id
  if (!selectedRecord || !selectedRecord._id ) {
    console.error(
      "No record selected or selected record doesn't have an _id."
    );
    return;
  }
  if (!imageFile) {
    setIsErrorImageModalOpen(true); // Open the error modal
    return;  // Don't proceed with form submission
  }
  // Prepare the form data to send via axios
  const formDataToSubmit = new FormData();
  formDataToSubmit.append("ORNumber", formData.ORNumber);
  formDataToSubmit.append("XrayNo", formData.XrayNo);
  formDataToSubmit.append("diagnosis", formData.diagnosis);
  formDataToSubmit.append("xrayFindings", formData.xrayFindings);
  formDataToSubmit.append("patientId", selectedRecord.patient._id);
  formDataToSubmit.append("clinicId", selectedRecord.clinicId);

  if (imageFile) {
    formDataToSubmit.append("imageFile", imageFile); // Append image file if exists
  }


  try {
    // Step 1: Update the existing X-ray record by ID
    const updateResponse = await axios.put(
      `https://cmrms-backend.onrender.com/api/xrayResults/${selectedRecord._id}`,
      formDataToSubmit,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Set the proper content type for file uploads
        },
      }
    );

    console.log("Response from backend:", updateResponse.data);

    if (updateResponse.data.success) {
      console.log(
        "X-ray result submitted successfully:",
        updateResponse.data.updatedRecord
      );
      // Set the confirmation modal state to true
      setIsResultAdded(true);
      setIsModalOpen(false);
      setResult("");
      setImageFile(null);
      fetchXrayRecords();
    } else {
      console.error(
        "Failed to update X-ray record:",
        updateResponse.data.message
      );
    }
  } catch (error) {
    console.error(
      "Error in submission process:",
      error.response ? error.response.data : error.message
    );
  }
};

const closeErrorImageModal = () => {
  setIsErrorImageModalOpen(false); // Close the error modal
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);  // Store the selected file
    } else {
      setImageFile(null);  // Reset the state if no file selected
    }
  };
  

  const indexOfLastRecord = currentPage * xrayRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - xrayRecordsPerPage;

  const filteredXrayRecords = xrayRecords.filter((record) => {
    const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();
    return (
      record.patient &&
      (record.patient.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        record.patient.lastname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber?.includes(searchQuery) ||
        formattedDate.includes(searchQuery))
    );
  });

  const currentXrayRecords = filteredXrayRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredXrayRecords.length / xrayRecordsPerPage);

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
  const [isAddOPDModalOpen, setIsAddOPDModalOpen] = useState(false);

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
  const [xrayType, setXrayType] = useState(""); // New state for X-ray type
  const [xrayDescription, setXrayDescription] = useState(""); // New state for X-ray description
  const [referredBy, setReferredBy] = useState(""); // State for "Referred by"

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
        "https://cmrms-backend.onrender.com/add-patient",
        patientData
      );
      const patientId = patientResponse.data.patient._id; // Extract the patient ID

      // Step 2: Wait for the patient ID and use it to create the associated X-ray request
      const xrayRequestData = {
        patient: patientId, // Pass the patient ID here
        xrayType,
        xrayDescription,
        xrayResult: "pending", // Initial status of the X-ray request
        referredBy,
      };

      await axios.post(
        "https://cmrms-backend.onrender.com/api/xrayResults",
        xrayRequestData
      );

      // Close modal and reset form
      setIsPatientAdded(true);
      setIsAddOPDModalOpen(false);
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
          <h1 className="text-3xl font-semibold">X-ray Requests</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredXrayRecords.length}
            </span>{" "}
            requests
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
                    <th className="py-3 w-1/5">Patient Info</th>
                    <th className="py-3 w-1/5">X-Ray Type</th>
                    <th className="py-3 w-1/4">Description</th>
                    <th className="py-3 w-1/5">Status</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>

                <tbody>
                  {/* Show message if no X-ray requests are found */}
                  {currentXrayRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No X-ray requests found.
                      </td>
                    </tr>
                  )}

                  {/* Display all records */}
                  {currentXrayRecords.map((record) => (
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
                            No patient data
                          </p>
                        )}
                      </td>
                      <td className="py-4">
                        <p className="font-semibold">
                          {record.xrayType || "No test data available"}
                        </p>
                      </td>
                      <td className="py-4">
                        <p>
                          {record.xrayDescription || "No description available"}
                        </p>
                      </td>
                      <td className="py-4">
                        <p>{record.xrayResult || "pending"}</p>
                      </td>
                      <td className="py-4">
                        <button
                          className="text-custom-red hover:underline"
                          onClick={() => handleAddResult(record)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
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
                <span className="mr-2">&#9432;</span> Whole X-ray request list
                is not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All X-ray Records
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
              <h2 className="text-xl font-semibold mb-4">Result Form</h2>

              {/* Main Form Content */}
              <form className="flex-grow">
                <div className="flex mb-4">
                  <div className="w-3/4 mr-2">
                    <label className="block text-gray-700">OR No.</label>
                    <input
                      type="text"
                      name="ORNumber" // Changed name to match the formData key
                      value={formData.ORNumber} // Keep this as is
                      onChange={(e) =>
                        handleInputChange(e, null, null, null, "ORNumber")
                      } // Adjusted the onChange handler
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="w-3/4 mr-2">
                    <label className="block text-gray-700">Case No.</label>
                    <input
                      type="text"
                      name="XrayNo"
                      value={formData.XrayNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div className="w-1/4">
                    <label className="block text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                {/* Conditionally Render Other Fields */}

                <div className="flex mb-4">
                  <div className="w-1/2 mr-2">
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div className="w-1/4 mr-2">
                    <label className="block text-gray-700">Age</label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-gray-700">Sex</label>
                    <input
                      type="text"
                      name="sex"
                      value={formData.sex}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">
                    {formData.patientType === "Student"
                      ? "Course/Dept."
                      : "Position"}
                  </label>
                  <input
                    type="text"
                    name="courseDept"
                    value={formData.courseDept}
                    readOnly
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
                {formData.ORNumber && (
                  <>
                    {/* Image Upload */}
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Upload X-ray Image
                      </label>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    {/* Diagnosis Input - only visible if userRole is 'dentist' */}
                    {userRole === "dentist" && (
                      <div className="mb-4">
                        <label className="block text-gray-700">
                          Interpretation
                        </label>
                        <textarea
                          name="diagnosis"
                          className="w-full px-3 py-2 border rounded"
                          rows="4"
                          placeholder="Enter a diagnosis..."
                          value={formData.diagnosis}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    {/* Diagnosis Input - only visible if userRole is 'dentist' */}
                    {userRole === "radiologic technologist" && (
                      <div className="mb-4">
                        <label className="block text-gray-700">
                          X-ray Findings
                        </label>
                        <textarea
                          name="xrayFindings"
                          className="w-full px-3 py-2 border rounded"
                          rows="4"
                          placeholder="Enter Findings..."
                          value={formData.xrayFindings}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </form>

              {/* Close and Submit Buttons */}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  {selectedRecord?.xrayResult === "pending"
                    ? "Cancel"
                    : "Close"}
                </button>

                {selectedRecord?.xrayResult === "pending" && (
                  <button
                    onClick={handleSubmitResult}
                    className="px-4 py-2 bg-custom-red text-white rounded-md"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
          {isErrorImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl text-red-600">Error</h2>
              <p className="text-center text-gray-600 mb-4">Please upload the X-ray image before submitting.</p>
              <div className="flex justify-center">
                <button
                 onClick={closeErrorImageModal}
                  className="bg-custom-red text-white px-4 py-2 rounded-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation Modal for Result Submission */}
        {isResultAdded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">Result Submitted</h2>
              <p className="text-center text-gray-600 mb-4">The X-ray result has been successfully submitted.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsResultAdded(false); // Close the confirmation modal
                    setIsModalOpen(false); // Optionally close the add result modal
                  }}
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
            <div className="bg-white py-4 px-6 rounded-lg w-1/2 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Add OPD Patient</h2>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    X-ray Type
                  </label>
                  <select
                    name="xrayType"
                    value={xrayType}
                    onChange={(e) => setXrayType(e.target.value)}
                    className="border rounded-lg w-full p-2 mt-1"
                    required
                  >
                    <option value="" disabled>
                      Select X-ray Type
                    </option>
                    <option value="medical">Medical X-Ray</option>
                    <option value="dental">Dental X-ray</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="xrayDescription"
                    value={xrayDescription}
                    onChange={(e) => setXrayDescription(e.target.value)}
                    className="border rounded-lg w-full p-2 mt-1"
                    placeholder="Enter X-ray description or details"
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
        )}
        {/* Confirmation Modal */}
        {isPatientAdded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-1/3 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">Patient Added</h2>
              <p className="text-center text-gray-600 mb-4">The patient has been successfully added.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsPatientAdded(false); // Close the confirmation modal
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

export default Xray;
