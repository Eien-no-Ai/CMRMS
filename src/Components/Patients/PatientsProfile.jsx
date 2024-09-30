import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";

function PatientsProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [selectedTab, setSelectedTab] = useState("");
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toLocaleDateString(),
    complaints: "",
    treatments: "",
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
  });

  const [role, setRole] = useState(null); // Store the user role
  // Retrieve the role from localStorage and set default tab based on role
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);

      // Automatically set the default tab based on the role
      if (storedRole === "clinic staff") {
        setSelectedTab("clinical");
      } else if (storedRole === "laboratory staff") {
        setSelectedTab("laboratory");
      } else if (storedRole === "xray staff") {
        setSelectedTab("xray");
      } else if (storedRole === "doctor") {
        setSelectedTab("clinical"); // Doctor should see all records starting with clinical
      }
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

  useEffect(() => {
    fetchLabRecords();
    fetchXrayRecords();
    fetchClinicalRecords();

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
  }, [id, fetchLabRecords, fetchXrayRecords, fetchClinicalRecords]);

  const handleNewRecordOpen = () => {
    setIsNewRecordModalOpen(true);
  };

  const handleNewRecordClose = () => {
    setIsNewRecordModalOpen(false);
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
    try {
      const response = await axios.post(
        "http://localhost:3001/api/clinicalRecords",
        {
          ...newRecord,
          patient: id,
        }
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
      const newXrayData = {
        ...newXrayRecord,
        patient: id,
        xrayResult: "pending",
      };
      const response = await axios.post(
        "http://localhost:3001/api/xrayResults",
        newXrayData
      );
      if (response.status === 200) {
        handleNewXrayModalClose();
        await fetchXrayRecords();
      }
    } catch (error) {
      console.error("Error adding new X-ray record:", error.response || error);
    }
  };

  const handleNewXrayChange = (e) => {
    const { name, value } = e.target;
    setNewXrayRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewXrayModalOpen = () => {
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

  const handleModalOpen = () => {
    setIsLabModalOpen(true);
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
      const dataToSend = { ...formData, patient: id, labResult: "pending" };
      console.log("Submitting data:", dataToSend);

      const result = await axios.post(
        "http://localhost:3001/api/laboratory",
        dataToSend
      );

      if (result.data.message === "Laboratory request created successfully") {
        console.log("Form submitted successfully:", result.data);
        setFormData(initialFormData);
        handleModalClose();
        fetchLabRecords();
      } else {
        console.error("Error submitting form:", result.data);
      }
    } catch (err) {
      console.error("An error occurred:", err);
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
                          15
                        </p>
                        <p className="text-gray-500">Clinical</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">2</p>
                        <p className="text-gray-500">Laboratory</p>
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">2</p>
                        <p className="text-gray-500">X-ray</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {role !== "xray staff" && (
                        <button
                          className={`mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full ${
                            role === "clinic staff" ? "col-span-4" : ""
                          }`}
                          onClick={handleNewRecordOpen}
                        >
                          New Record
                        </button>
                      )}

                      {role === "xray staff" && (
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full col-span-4"
                          onClick={handleNewXrayModalOpen}
                        >
                          X-ray
                        </button>
                      )}

                      {role !== "clinic staff" && role !== "xray staff" && (
                        <div className="relative" ref={dropdownRef}>
                          <button
                            className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                            onClick={handleMakeRequest}
                          >
                            Make a Request
                          </button>

                          {/* Request options dropdown */}
                          {showRequestOptions && (
                            <div className="absolute mt-2 bg-white border rounded-lg shadow-lg">
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                onClick={handleModalOpen} // Open modal for Laboratory
                              >
                                Laboratory
                              </button>
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                onClick={handleNewXrayModalOpen} // Open modal for X-ray
                              >
                                X-ray
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-semibold">{patient.sex}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birthday</p>
                      <p className="font-semibold">
                        {new Date(patient.birthdate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Street Address</p>
                      <p className="font-semibold">{patient.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">City</p>
                      <p className="font-semibold">{patient.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-semibold">{patient.phonenumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ZIP Code</p>
                      <p className="font-semibold">{patient.postalcode}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-semibold">{patient.idnumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emergency Contact</p>
                      <p className="font-semibold">
                        {patient.emergencycontact}
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
                {(role === "clinic staff" || role === "doctor") && (
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
                )}

                {(role === "laboratory staff" || role === "doctor") && (
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
                )}

                {(role === "xray staff" || role === "doctor") && (
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
                )}
              </div>
            </div>

            <div className="mt-4">
              <ul className="space-y-4">
                {selectedTab === "clinical" &&
                  (role === "clinic staff" || role === "doctor") &&
                  (displayedRecords.length > 0 ? (
                    <ul className="space-y-2">
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
                            {records.treatments}
                          </div>
                          <div className="flex-1 text-gray-500">
                            {records.diagnosis}
                          </div>
                          <button className="text-custom-red">Edit</button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No clinical records found.
                    </p>
                  ))}

                {selectedTab === "laboratory" &&
                  (role === "laboratory staff" || role === "doctor") &&
                  (displayedRecords.length > 0 ? (
                    displayedRecords.map((records, index) => {
                      const allTests = [
                        ...Object.entries(records.bloodChemistry)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(records.hematology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(
                          records.clinicalMicroscopyParasitology
                        )
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(records.bloodBankingSerology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                        ...Object.entries(records.microbiology)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => value),
                      ]
                        .filter(Boolean)
                        .join(", ");

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
                            <button className="text-custom-red">Edit</button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No lab records available.
                    </p>
                  ))}

                {selectedTab === "xray" &&
                  (role === "xray staff" || role === "doctor") &&
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
                          <p className="font-semibold">{records.xrayType}</p>
                        </div>
                        <div className="text-gray-500">
                          {records.xrayResult}
                        </div>
                        <button className="text-custom-red">Edit</button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No X-ray records available.
                    </p>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">
              New Clinical Record
            </h2>
            <form onSubmit={handleNewRecordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Complaints</label>
                <input
                  type="text"
                  name="complaints"
                  value={newRecord.complaints}
                  onChange={handleNewRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Treatment</label>
                <input
                  type="text"
                  name="treatments"
                  value={newRecord.treatments}
                  onChange={handleNewRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={newRecord.diagnosis}
                  onChange={handleNewRecordChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>
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
                  <option value="panoramic">Panoramic</option>
                  <option value="chest">Chest</option>
                </select>
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
