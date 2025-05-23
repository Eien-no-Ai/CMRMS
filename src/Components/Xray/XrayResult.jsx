import React, { useState, useEffect, useCallback } from "react";
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
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
    xrayFindings: "",
    imageFile: "",
  });

  const fetchXrayRecords = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/xrayResults`, {
        headers: {
          "api-key": api_Key,
        }
      });

      // Filter records with xrayResult === "done"
      const filteredRecords = response.data.filter(
        (record) => record.xrayResult === "done"
      );

      // Sort records by creation date, most recent first
      const sortedRecords = filteredRecords.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );

      setXrayRecords(sortedRecords);
    } catch (error) {
      console.error("There was an error fetching the X-ray records!", error);
    }
  }, [apiUrl, api_Key]);

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

  const handleAddResult = async (record) => {
    setSelectedRecord(record); // Store the selected record
    setIsImageLoading(true);
    setImageError(null);

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
      imageFile: record.imageFile || "", // Use Base64 image
    });
    console.log("Selected record:", record);

    setIsImageLoading(false);
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

  const xrayData = {
      ORNumber: formData.ORNumber,
      XrayNo: formData.XrayNo,
      diagnosis: formData.diagnosis,
      xrayFindings: formData.xrayFindings,
      patientId: selectedRecord.patient._id,
      clinicId: selectedRecord.clinicId,
      imageFile: imageFile, // ← Use Cloudinary image URL if available
    };

    try {
      // Step 1: Update the existing X-ray record by ID
      const updateResponse = await axios.put(
        `${apiUrl}/api/xrayResults/${selectedRecord._id}`,
        xrayData,
        {
          headers: {
            "api-key": api_Key,
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

  const handleImageClick = (imageSrc) => {
    setFullImageSrc(imageSrc);
    setIsImageModalOpen(true);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">X-ray Records</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredXrayRecords.length}
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
                    <th className="py-3 w-1/5">Patient Info</th>
                    <th className="py-3 w-1/5">X-Ray Type</th>
                    <th className="py-3 w-1/4">Description</th>
                    <th className="py-3 w-1/5">Status</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>

                <tbody>
                  {currentXrayRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No X-ray records found.
                      </td>
                    </tr>
                  )}

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

        {/* Modal for adding result */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col relative">
              {/* Form Title */}
              <h2 className="text-xl font-semibold mb-4">Result Form</h2>

              {/* Main Form Content */}
              <div className="flex-grow flex flex-col mb-4">
                <form className="flex flex-row items-start gap-4">
                  {/* X-ray Result Image - Left Side */}
                  <div className="w-1/2">
                    <label className="block text-gray-700">X-ray Result</label>
                    {isImageLoading ? (
                      <p className="text-gray-500">Loading image...</p>
                    ) : imageError ? (
                      <p className="text-red-500">{imageError}</p>
                    ) : formData.imageFile ? (
                      <img
                        src={formData.imageFile}
                        alt="X-ray"
                        className="w-auto h-full object-cover cursor-pointer"
                        onClick={() => handleImageClick(formData.imageFile)}
                      />
                    ) : (
                      <p className="text-gray-500">No image available.</p>
                    )}
                  </div>

                  {/* Details Section - Right Side */}
                  <div className="w-1/2">
                    {/* Xray No. and Date */}
                    <div className="flex mb-4">
                      <div className="w-1/3 mr-2">
                        <label className="block text-gray-700">OR No.</label>
                        <input
                          type="text"
                          name="ORNumber"
                          value={formData.ORNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                      <div className="w-1/3 mr-2">
                        <label className="block text-gray-700">Case No.</label>
                        <input
                          type="text"
                          name="XrayNo"
                          value={formData.XrayNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>

                      <div className="w-1/3">
                        <label className="block text-gray-700">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Name, Age, and Sex */}
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

                    {/* Course/Dept. or Position */}
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

                    {/* X-ray Findings */}
                    <div className="w-full mt-4">
                      <label className="block text-gray-700">
                        X-ray Findings
                      </label>
                      <textarea
                        name="xrayFindings"
                        className="w-full px-3 py-2 border rounded"
                        rows="4"
                        value={formData.xrayFindings}
                        onChange={handleInputChange}
                        readOnly={userRole === "radiologist"}
                      />
                    </div>
                    {/* Diagnosis (Interpretation) */}
                    <div className="w-full">
                      <label className="block text-gray-700">
                        Interpretations
                      </label>
                      <textarea
                        name="diagnosis"
                        className="w-full px-3 py-2 border rounded"
                        rows="4"
                        placeholder="Enter an interpretation..."
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        readOnly={userRole === "radiologic technologist"}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Close and Save Buttons */}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  {selectedRecord?.xrayResult === "pending"
                    ? "Cancel"
                    : "Close"}
                </button>
                {userRole === "radiologist" && (
                  <button
                    onClick={handleSubmitResult}
                    className="px-4 py-2 bg-custom-red text-white rounded-md"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div
              className="relative bg-white p-6 rounded-lg shadow-lg overflow-hidden flex justify-center items-center"
              style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 text-custom-red text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>

              {/* Full-size Image */}
              <img
                src={fullImageSrc}
                alt="Full-size X-ray"
                className="object-contain max-h-[90vh] max-w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default XrayResult;
