import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { FaXRay } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { GiBiceps } from "react-icons/gi";
import jsPDF from "jspdf";
import "jspdf-autotable";

function PatientsProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [selectedTab, setSelectedTab] = useState("clinical");
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isNewTherapyRecordModalOpen, setIsNewTherapyRecordModalOpen] = useState(false);
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);
  const [newTherapyRecord, setNewTherapyRecord] = useState({
    date: new Date().toLocaleDateString(),
    SOAPSummary:"",
  });
  const [newRecord, setNewRecord] = useState({
    date: new Date().toLocaleDateString(),
    complaints: "",
    treatments: "",
    emergencyTreatments: "",
    diagnosis: "",
  });
  const [laboratoryRecords, setLaboratoryRecords] = useState([]);
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [xrayRecords, setXrayRecords] = useState([]);
  const [isNewXrayModalOpen, setIsNewXrayModalOpen] = useState(false);
  const [newXrayRecord, setNewXrayRecord] = useState({
    date: new Date().toLocaleDateString(),
    xrayResult: "",
    xrayType: "",
    xrayDescription: "",
  });
  const [role, setRole] = useState(null); // Store the user role
  // Inside your component definition
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [showEmergencyTreatmentInput, setShowEmergencyTreatmentInput] =
    useState(false);
  const [clinicId, setClinicId] = useState(null); // Added state for clinicId

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole); // Store the role in state
    }
  }, []);

  const fetchLabRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/laboratory/${id}`
      );
      const sortedLabRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setLaboratoryRecords(sortedLabRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the laboratory records!",
        error
      );
    }
  }, [id]);

  const fetchXrayRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/xrayResults/${id}`
      );
      const sortedXrayRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setXrayRecords(sortedXrayRecords);
      console.log("Fetched X-ray Records:", sortedXrayRecords);
    } catch (error) {
      console.error("There was an error fetching the X-ray records!", error);
    }
  }, [id]);

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

  //Fetch Physical Therapy Records
  const fetchPhysicalTherapyRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/physicalTherapy/${id}`
      );
      const sortedPhysicalTherapyRecords = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setPhysicalTherapyRecords(sortedPhysicalTherapyRecords);
    } catch (error) {
      console.error(
        "There was an error fetching the Physical Therapy records!",
        error
      );
    }
  }, [id]);

  useEffect(() => {
  fetchLabRecords();
  fetchXrayRecords();
  fetchClinicalRecords();
  fetchPhysicalTherapyRecords();
  
  const fetchPatient = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/patients/${id}`
      );
      setPatient(response.data);
    } catch (error) {
      console.error(
        "There was an error fetching the patient details!",
        error
      );
    }
  };
  fetchPatient();
}, [id, fetchLabRecords, fetchXrayRecords, fetchClinicalRecords, fetchPhysicalTherapyRecords]);

const handleNewTherapyRecordOpen = () => {
  setIsNewTherapyRecordModalOpen(true);
};

const handleNewTherapyRecordClose = () => {
  setIsNewTherapyRecordModalOpen(false);
};

const handleNewTherapyRecordChange = (e) => {
  const { name, value } = e.target;
  setNewTherapyRecord((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleNewTherapySubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:3001/api/physicalTherapy", // Fix the spelling here
      {
        ...newTherapyRecord,
        patient: id,
      }
    );
    if (response.status === 200) {
      handleNewTherapyRecordClose();
      fetchPhysicalTherapyRecords();
      setNewTherapyRecord({
        SOAPSummary:"",
      }); 
    }
  } catch (error) {
    console.error("Error adding new record:", error.response || error);
  }
};

const handleGenerateReport = () => {
  const pdf = new jsPDF();

  // Set the title of the report
  pdf.text("Physical Therapy Report", 20, 20);

  // Table headers
  const headers = ["Date", "SOAP Summary", "Physical Therapy Result"];

  // Table data
  const tableData = displayedRecords.map((record) => [
    new Date(record.isCreatedAt).toLocaleString(),
    record.SOAPSummary,
    record.physicalTherapyResult,
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

  const handleNewRecordOpen = () => {
    setIsNewRecordModalOpen(true);
  };

  // Close the new record modal and reset form state
  const handleNewRecordClose = () => {
    setIsNewRecordModalOpen(false);
    setShowEmergencyTreatmentInput(false);
    setNewRecord({
      date: new Date().toLocaleDateString(),
      complaints: "",
      treatments: "",
      emergencyTreatments: "",
      diagnosis: "",
    });
  };

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewRecordSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId"); // Get the logged-in user's ID

    // Combine the regular treatments and the emergency treatment
    const updatedRecord = {
      ...newRecord,
      patient: id,
      createdBy: userId, // Add the logged-in user's ID as createdBy
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/clinicalRecords",
        updatedRecord
      );

      if (response.status === 200) {
        handleNewRecordClose();
        await fetchClinicalRecords();
      }
    } catch (error) {
      console.error("Error adding new record:", error.response || error);
    }
  };

  const handleNewXraySubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...newXrayRecord,
        patient: id,
        xrayResult: "pending",
      };

      // Include clinicId if available
      if (clinicId) {
        dataToSend.clinicId = clinicId; // Add clinicId to the data
      }

      const response = await axios.post(
        "http://localhost:3001/api/xrayResults",
        dataToSend
      );

      if (response.data.success) {
        console.log("X-ray submitted successfully:", response.data);
        setNewXrayRecord({}); // Reset form data
        handleNewXrayModalClose(); // Close the modal
        fetchXrayRecords(); // Refresh the main X-ray records list

        // Refresh X-ray records in the view modal for the specific record
        const updatedXrayRecords = await axios.get(
          `http://localhost:3001/api/xrayResults?clinicId=${clinicId}`
        );
        setSelectedXrayRecords(updatedXrayRecords.data);
      } else {
        console.error("Error submitting X-ray form:", response.data);
      }
    } catch (error) {
      console.error(
        "An error occurred while submitting the X-ray form:",
        error
      );
    } finally {
      setClinicId(null); // Clear clinicId explicitly
    }
  };

  const handleNewXrayChange = (e) => {
    const { name, value } = e.target;
    setNewXrayRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewXrayModalOpen = (record) => {
    setClinicId(record._id);
    setIsNewXrayModalOpen(true);
  };

  const handleNewXrayModalClose = () => {
    setIsNewXrayModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showRequestOptions &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowRequestOptions(false);
      }
    };

    if (showRequestOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRequestOptions]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleMakeRequest = () => {
    setShowRequestOptions((prev) => !prev);
  };

  const handleLabModalOpen = (record) => {
    setIsLabModalOpen(true);
    setClinicId(record._id);
  };

  const handleModalClose = () => {
    setIsLabModalOpen(false);
  };

  const displayedRecords =
  selectedTab === "clinical"
    ? clinicalRecords
    : selectedTab === "laboratory"
    ? laboratoryRecords
    : selectedTab === "xray"
    ? xrayRecords
    : selectedTab === "physical therapy"
    ? physicalTherapyRecords
    : [];

  const initialFormData = {
    bloodChemistry: {
      bloodSugar: "",
      bloodUreaNitrogen: "",
      bloodUricAcid: "",
      creatinine: "",
      SGOT_AST: "",
      SGPT_ALT: "",
      totalCholesterol: "",
      triglyceride: "",
      HDL_cholesterol: "",
      LDL_cholesterol: "",
    },
    hematology: {
      bleedingTimeClottingTime: "",
      completeBloodCount: "",
      hematocritAndHemoglobin: "",
    },
    clinicalMicroscopyParasitology: {
      routineUrinalysis: "",
      routineStoolExamination: "",
      katoThickSmear: "",
      fecalOccultBloodTest: "",
    },
    bloodBankingSerology: {
      antiTreponemaPallidum: "",
      antiHCV: "",
      bloodTyping: "",
      hepatitisBSurfaceAntigen: "",
      pregnancyTest: "",
      dengueTest: "",
      HIVRapidTest: "",
      HIVElsa: "",
      testForSalmonellaTyphi: "",
    },
    microbiology: {
      gramsStain: "",
      KOH: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (section, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: prevData[section][field] === "" ? field : "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        patient: id,
        labResult: "pending",
      };

      // Include clinicId if available
      if (clinicId) {
        dataToSend.clinicId = clinicId; // Add clinicId if it exists
      }

      const result = await axios.post(
        "http://localhost:3001/api/laboratory",
        dataToSend
      );

      if (result.data.message === "Laboratory request created successfully") {
        console.log("Form submitted successfully:", result.data);
        setFormData(initialFormData); // Reset form data
        handleModalClose(); // Close the modal
        fetchLabRecords(); // Refresh lab records

        // Refresh lab tests in the view modal for the specific record
        const updatedLabTests = await axios.get(
          `http://localhost:3001/api/laboratory?clinicId=${clinicId}`
        );
        setSelectedLabTests(updatedLabTests.data);
      } else {
        console.error("Error submitting form:", result.data);
      }
    } catch (err) {
      console.error("An error occurred while submitting the form:", err);
    } finally {
      setClinicId(null); // Clear clinicId explicitly
    }
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred this year yet
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [selectedXrayRecords, setSelectedXrayRecords] = useState([]);

  const handleViewRecord = async (record) => {
    setSelectedRecord(record);
    setClinicId(record._id);

    try {
      const labResponse = await axios.get(
        `http://localhost:3001/api/laboratory?clinicId=${record._id}`
      );
      const labTests = labResponse.data;
      setSelectedLabTests(labTests);

      // Fetch X-ray records for the specific clinic
      const xrayResponse = await axios.get(
        `http://localhost:3001/api/xrayResults?clinicId=${record._id}`
      );
      const xrayRecords = xrayResponse.data;
      setSelectedXrayRecords(xrayRecords);
    } catch (error) {
      console.error(
        "Error fetching lab or X-ray records for the clinical record:",
        error
      );
    }

    setIsViewModalOpen(true);
  };

  const updateClinicalRecord = async (selectedRecord) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/clinicalRecords/${selectedRecord._id}`,
        selectedRecord
      );
      if (response.status === 200) {
        setIsViewModalOpen(false);
        fetchClinicalRecords(); // Refresh the clinical records after updating
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
          <h1 className="text-3xl font-semibold">Patient Profile</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {patient && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="text-center">
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Placeholder"
                      className="mx-auto h-20 w-20 rounded-full"
                    />
                    <h2 className="mt-4 text-xl font-semibold">
                      {patient.firstname} {patient.lastname}
                    </h2>
                    <p className="text-gray-500">{patient.email}</p>
                    <div className="flex justify-center mt-2 space-x-6">
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {clinicalRecords.length}
                        </p>
                        <p className="text-gray-500">Clinical</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {laboratoryRecords.length}
                        </p>
                        <p className="text-gray-500">Laboratory</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {xrayRecords.length}
                        </p>
                        <p className="text-gray-500">X-ray</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <button
                        className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                        onClick={handleNewRecordOpen}
                      >
                        Check Up
                      </button>
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleNewTherapyRecordOpen}
                        >
                          New Physical Theraphy Record
                        </button>
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleGenerateReport}
                        >
                          Generate Report
                        </button>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleMakeRequest}
                        >
                          Make a Request
                        </button>
                        {/* Request options */}
                        {showRequestOptions && (
                          <div className="absolute mt-2 bg-white border rounded-lg shadow-lg">
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleLabModalOpen} // Open modal here
                            >
                              Laboratory
                            </button>
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleNewXrayModalOpen}
                            >
                              X-ray
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-semibold">{patient.idnumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Department/ Position</p>
                      <p className="font-semibold">
                        {" "}
                        {patient.patientType === "Employee"
                          ? patient.position
                          : patient.course}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age</p>
                      <p className="font-semibold">
                        {calculateAge(patient.birthdate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-semibold">{patient.sex}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-semibold">{patient.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birthday</p>
                      <p className="font-semibold">
                        {new Date(patient.birthdate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-semibold">{patient.phonenumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emergency Contact</p>
                      <p className="font-semibold">
                        {patient.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Notes</h2>
            </div>
            <ul className="mt-4 text-gray-500 space-y-2">
              <li>- This patient is lorem ipsum dolor sit amet</li>
              <li>- Lorem ipsum dolor sit amet</li>
              <li>- Has allergic history with Cataflam</li>
            </ul>
            <button className="mt-4 w-full bg-custom-red text-white p-2 rounded-lg">
              Add Note
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  className={`${
                    selectedTab === "clinical"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("clinical")}
                >
                  Clinical Records
                </button>
                <button
                  className={`${
                    selectedTab === "laboratory"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("laboratory")}
                >
                  Laboratory Records
                </button>
                <button
                  className={`${
                    selectedTab === "xray"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("xray")}
                >
                  X-ray Records
                </button>
                <button
                    className={`${
                      selectedTab === "physical therapy"
                        ? "text-custom-red font-semibold"
                        : ""
                    }`}
                    onClick={() => handleTabChange("physical therapy")}
                  >
                    Physical Therapy Records
                </button>
              </div>
            </div>

            {/* Scrollable section */}
            <div className="mt-4 max-h-72 overflow-y-auto">
              <ul className="space-y-4">
                {selectedTab === "clinical" &&
                  (displayedRecords.length > 0 ? (
                    <ul className="space-y-4">
                      {displayedRecords.map((records, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-gray-500 text-sm">
                              {new Date(records.isCreatedAt).toLocaleString()}
                            </p>
                            <p className="font-semibold">
                              {records.complaints}
                            </p>
                          </div>
                          <div className="flex-1 text-gray-500">
                            {records.treatments.length > 20
                              ? `${records.treatments.substring(0, 20)}...`
                              : records.treatments}
                            {records.emergencyTreatment && (
                              <p className="text-custom-red italic">
                                Emergency: {records.emergencyTreatment}
                              </p>
                            )}
                          </div>
                          <div className="flex-1 text-gray-500">
                            {records.diagnosis.length > 20
                              ? `${records.diagnosis.substring(0, 20)}...`
                              : records.diagnosis}
                          </div>
                          <button
                            className="text-custom-red"
                            onClick={() => handleViewRecord(records)}
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No clinical records found.
                    </p>
                  ))}

                {/* Laboratory Records */}
                {selectedTab === "laboratory" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => {
                      const allTests = [
                        ...Object.entries(records.bloodChemistry || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.hematology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(
                          records.clinicalMicroscopyParasitology || {}
                        )
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.bloodBankingSerology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                        ...Object.entries(records.microbiology || {})
                          .filter(([key, value]) => value)
                          .map(([key]) => key),
                      ].join(", ");

                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-100 rounded-lg space-x-4"
                        >
                          <div className="flex-1">
                            <p className="text-gray-500 text-sm">
                              {new Date(records.isCreatedAt).toLocaleString()}
                            </p>
                            <p className="font-semibold">
                              {allTests || "No test data available"}
                            </p>
                          </div>
                          <div className="flex-1 text-gray-500 text-center">
                            {records.labResult}
                          </div>
                          <div className="flex-1 text-right">
                            <button className="text-custom-red">View</button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No lab records available.
                    </p>
                  ))}

                {/* X-ray Records */}
                {selectedTab === "xray" &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div className="col-span-1">
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">
                            {records.xrayDescription}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-500">{records.xrayType}</p>
                        </div>
                        <div className="col-span-1 flex justify-between items-center">
                          <p className="text-gray-500">{records.xrayResult}</p>
                          <button className="text-custom-red">View</button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No X-ray records available.
                    </p>
                  ))}

                {selectedTab === "physical therapy" &&
                  (role === "special trainee" || role === "physical therapist") &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <div>
                          <p className="text-gray-500 text-sm">
                            {new Date(records.isCreatedAt).toLocaleString()}
                          </p>
                          <p className="font-semibold">{records.SOAPSummary}</p>
                        </div>
                        <div className="text-gray-500">
                          {records.physicalTherapyResult}
                        </div>
                        <button className="text-custom-red">Edit</button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No Physical Therapy records available.
                    </p>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isNewTherapyRecordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New Physical Therapy Record
            </h2>
            <form onSubmit={handleNewTherapySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">SOAP SUMMARY</label>
                <input
                  type="text"
                  name="SOAPSummary"
                  value={newTherapyRecord.SOAPSummary}
                  onChange={handleNewTherapyRecordChange}
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
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New Clinical Record
            </h2>
            <form onSubmit={handleNewRecordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Complaints/Findings
                </label>
                <input
                  type="text"
                  name="complaints"
                  value={newRecord.complaints}
                  onChange={handleNewRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>

              {/* Conditionally render Treatment and Diagnosis fields */}
              {role === "doctor" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Treatment
                    </label>
                    <input
                      type="text"
                      name="treatments"
                      value={newRecord.treatments}
                      onChange={handleNewRecordChange}
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={newRecord.diagnosis}
                      onChange={handleNewRecordChange}
                      className="border rounded-lg w-full p-2 mt-1"
                    />
                  </div>
                </>
              )}

              {role === "nurse" && (
                <>
                  {!showEmergencyTreatmentInput ? (
                    <div className="mb-4">
                      <p
                        className="text-sm italic text-custom-red cursor-pointer"
                        onClick={() => setShowEmergencyTreatmentInput(true)}
                      >
                        Add Emergency Treatment
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Emergency Treatment
                      </label>
                      <input
                        type="text"
                        name="emergencyTreatment"
                        value={newRecord.emergencyTreatment || ""}
                        onChange={handleNewRecordChange}
                        className="border rounded-lg w-full p-2 mt-1"
                        placeholder="Enter emergency treatment"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleNewRecordClose}
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
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-lg max-w-5xl overflow-y-auto flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{selectedRecord.complaints}</h2>
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
                  <p className="text-gray-500 py-4">No treatments available.</p>
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
                  <p className="text-gray-500 py-4">No diagnosis available.</p>
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
                  <button
                    className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                    onClick={() => handleLabModalOpen(selectedRecord)}
                  >
                    <SlChemistry className="mr-2" /> Lab Request
                  </button>
                  <button
                    className="px-4 py-2 bg-custom-red text-white rounded-md flex items-center border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red transition ease-in-out duration-300"
                    onClick={() => handleNewXrayModalOpen(selectedRecord)}
                  >
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

      {isLabModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">
              Laboratory Request Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* I. Blood Chemistry */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  I. Blood Chemistry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodSugar !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodSugar")
                      }
                    />{" "}
                    Blood Sugar (Fasting / Random)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodUreaNitrogen !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodUreaNitrogen")
                      }
                    />{" "}
                    Blood Urea Nitrogen
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.bloodUricAcid !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "bloodUricAcid")
                      }
                    />{" "}
                    Blood Uric Acid
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.creatinine !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "creatinine")
                      }
                    />{" "}
                    Creatinine
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.SGOT_AST !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "SGOT_AST")
                      }
                    />{" "}
                    SGOT / AST
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.SGPT_ALT !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "SGPT_ALT")
                      }
                    />{" "}
                    SGPT / ALT
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.totalCholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "totalCholesterol")
                      }
                    />{" "}
                    Total Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.triglyceride !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "triglyceride")
                      }
                    />{" "}
                    Triglyceride
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.HDL_cholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "HDL_cholesterol")
                      }
                    />{" "}
                    HDL Cholesterol
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodChemistry.LDL_cholesterol !== ""}
                      onChange={() =>
                        handleInputChange("bloodChemistry", "LDL_cholesterol")
                      }
                    />{" "}
                    LDL Cholesterol
                  </label>
                </div>
              </div>

              {/* II. Hematology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">II. Hematology</h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.hematology.bleedingTimeClottingTime !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "hematology",
                          "bleedingTimeClottingTime"
                        )
                      }
                    />{" "}
                    Bleeding Time & Clotting Time
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.hematology.completeBloodCount !== ""}
                      onChange={() =>
                        handleInputChange("hematology", "completeBloodCount")
                      }
                    />{" "}
                    Complete Blood Count with Platelet Count
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.hematology.hematocritAndHemoglobin !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "hematology",
                          "hematocritAndHemoglobin"
                        )
                      }
                    />{" "}
                    Hematocrit and Hemoglobin
                  </label>
                </div>
              </div>

              {/* III. Clinical Microscopy & Parasitology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  III. Clinical Microscopy & Parasitology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .routineUrinalysis !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "routineUrinalysis"
                        )
                      }
                    />{" "}
                    Routine Urinalysis
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .routineStoolExamination !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "routineStoolExamination"
                        )
                      }
                    />{" "}
                    Routine Stool Examination
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .katoThickSmear !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "katoThickSmear"
                        )
                      }
                    />{" "}
                    Kato Thick Smear
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.clinicalMicroscopyParasitology
                          .fecalOccultBloodTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "clinicalMicroscopyParasitology",
                          "fecalOccultBloodTest"
                        )
                      }
                    />{" "}
                    Fecal Occult Blood Test
                  </label>
                </div>
              </div>

              {/* IV. Blood Banking And Serology */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  IV. Blood Banking And Serology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.antiTreponemaPallidum !==
                        ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "antiTreponemaPallidum"
                        )
                      }
                    />{" "}
                    Anti-Treponema Pallidum
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.antiHCV !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "antiHCV")
                      }
                    />{" "}
                    Anti-HCV
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.bloodTyping !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "bloodTyping")
                      }
                    />{" "}
                    Blood Typing (ABO & Rh Grouping)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology
                          .hepatitisBSurfaceAntigen !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "hepatitisBSurfaceAntigen"
                        )
                      }
                    />{" "}
                    Hepatitis B Surface Antigen
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.pregnancyTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "pregnancyTest"
                        )
                      }
                    />{" "}
                    Pregnancy Test (Plasma/Serum)
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.dengueTest !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "dengueTest")
                      }
                    />{" "}
                    Dengue Test
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.HIVRapidTest !== ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "HIVRapidTest"
                        )
                      }
                    />{" "}
                    HIV Rapid Test Kit
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.bloodBankingSerology.HIVElsa !== ""}
                      onChange={() =>
                        handleInputChange("bloodBankingSerology", "HIVElsa")
                      }
                    />{" "}
                    HIV ELISA
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={
                        formData.bloodBankingSerology.testForSalmonellaTyphi !==
                        ""
                      }
                      onChange={() =>
                        handleInputChange(
                          "bloodBankingSerology",
                          "testForSalmonellaTyphi"
                        )
                      }
                    />{" "}
                    Test for Salmonella typhi
                  </label>
                </div>
              </div>

              {/* V. Microbiology */}
              <div className="md:col-span-3 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  V. Microbiology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.microbiology.gramsStain !== ""}
                      onChange={() =>
                        handleInputChange("microbiology", "gramsStain")
                      }
                    />{" "}
                    Gram's Stain
                  </label>

                  <label className="block">
                    <input
                      type="checkbox"
                      checked={formData.microbiology.KOH !== ""}
                      onChange={() => handleInputChange("microbiology", "KOH")}
                    />{" "}
                    KOH
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:gray-500 hover:border-gray-500 border transition duration-200"
                onClick={handleModalClose}
              >
                Cancel
              </button>

              <button
                className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isNewXrayModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New X-ray Request
            </h2>
            <form onSubmit={handleNewXraySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">X-ray Type</label>
                <select
                  name="xrayType"
                  value={newXrayRecord.xrayType}
                  onChange={handleNewXrayChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                >
                  <option value="" disabled>
                    Select X-ray Type
                  </option>
                  <option value="medical">Medical X-Ray</option>
                  <option value="dental">Dental X-ray</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="xrayDescription"
                  value={newXrayRecord.xrayDescription || ""}
                  onChange={handleNewXrayChange}
                  className="border rounded-lg w-full p-2 mt-1"
                  placeholder="Enter X-ray description or details"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleNewXrayModalClose}
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
    </div>
  );
}

export default PatientsProfile;
