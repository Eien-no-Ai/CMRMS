import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function XrayResult() {
  const [xrayRecords, setXrayRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const xrayRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    XrayNo: "",
    date: "",
    name: "",
    age: "",
    sex: "",
    courseDept: "",
    patientType: "",
    diagnosis: "",
    imageFile: "",
  });

  useEffect(() => {
    fetchXrayRecords();
  }, []);

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const fetchXrayRecords = () => {
    axios
      .get("http://localhost:3001/api/xrayResults")
      .then((response) => {
        // Filter records where xrayResult is "pending"
        const pendingRecords = response.data.filter(
          (record) => record.xrayResult === "done"
        );
        const sortedRecords = pendingRecords.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setXrayRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the X-ray records!", error);
      });
  };

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
      XrayNo: record.XrayNo || "", // Use record's XrayNo if available
      date: new Date().toISOString().split("T")[0],
      name: `${record.patient.lastname}, ${record.patient.firstname}`,
      age: getAge(record.patient.birthdate),
      sex: record.patient.sex,
      courseDept: record.patient.course || record.patient.position,
      patientType: record.patient.patientType,
      diagnosis: record.diagnosis || "", // If there's an existing diagnosis
      imageFile: record.imageFile || "", // If there's an existing image file
    });
    setIsModalOpen(true); // Open the modal
  };

  const handleSubmitResult = async () => {
    // Ensure selectedRecord exists and has an _id
    if (!selectedRecord || !selectedRecord._id) {
      console.error(
        "No record selected or selected record doesn't have an _id."
      );
      return;
    }

    // Prepare the form data to send via axios
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("XrayNo", formData.XrayNo);
    formDataToSubmit.append("diagnosis", formData.diagnosis);
    formDataToSubmit.append("patientId", selectedRecord.patient._id);
    formDataToSubmit.append("clinicId", selectedRecord.clinicId);

    if (imageFile) {
      formDataToSubmit.append("imageFile", imageFile); // Append image file if exists
    }

    try {
      // Step 1: Update the existing X-ray record by ID
      const updateResponse = await axios.put(
        `http://localhost:3001/api/xrayResults/${selectedRecord._id}`,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file); // Log the file to ensure it's being set
    setImageFile(file);
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
                  {currentXrayRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No X-ray records found.
                      </td>
                    </tr>
                  ) : (
                    currentXrayRecords.map((record) => {
                      // Conditional rendering based on xrayType and userRole
                      if (
                        (record.xrayType === "medical" &&
                          (userRole === "radiologist" ||
                            userRole === "radiologic technologist")) ||
                        (record.xrayType === "dental" && userRole === "dentist")
                      ) {
                        return (
                          <tr key={record._id} className="border-b">
                            <td className="py-4 px-4">
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
                            <td className="py-4 px-4">
                              <p className="font-semibold">
                                {record.xrayType || "No test data available"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p>
                                {record.xrayDescription ||
                                  "No description available"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p>{record.xrayResult || "pending"}</p>
                            </td>
                            <td className="py-4 px-4">
                              {record.xrayResult === "pending" ? (
                                <button
                                  className="text-custom-red hover:underline"
                                  onClick={() => handleAddResult(record)}
                                >
                                  Add Result
                                </button>
                              ) : (
                                <button
                                  className="text-custom-red hover:underline"
                                  onClick={() => handleAddResult(record)}
                                >
                                  View Result
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      }
                      return null; // If the xrayType does not match the user role, skip this row
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
                <span className="mr-2">&#9432;</span> Whole X-ray request list
                is not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All X-ray Requests
              </button>
            </div>
          </div>
        )}

        {/* Modal for adding result */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
              <h2 className="text-xl font-semibold mb-4">Result Form</h2>

              <div className="flex flex-col mb-4">
                <form className="flex-grow">
                  {/* Input Fields for Pending Status */}
                  <div className="flex mb-4">
                    <div className="w-3/4 mr-2">
                      <label className="block text-gray-700">Xray No.</label>
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
                      {formData.patientType === "student"
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

                  {/* Diagnosis input */}
                  <div className="mb-4">
                    <label className="block text-gray-700">Diagnosis</label>
                    <textarea
                      name="diagnosis" // Ensure the name attribute is present
                      className="w-full px-3 py-2 border rounded"
                      rows="4"
                      placeholder="Enter a diagnosis..."
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>

                {formData.imageFile && (
                  <div className="mb-4">
                    <label className="block text-gray-700">Xray - Result</label>
                    <img
                      src={`${formData.imageFile}`} // Assuming image is stored on the server
                      alt="X-ray"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  {selectedRecord?.xrayResult === "pending"
                    ? "Cancel"
                    : "Close"}
                </button>

                {selectedRecord?.xrayResult === "pending" ? (
                  <button
                    onClick={handleSubmitResult}
                    className="px-4 py-2 bg-custom-red text-white rounded-md"
                  >
                    Submit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default XrayResult;
