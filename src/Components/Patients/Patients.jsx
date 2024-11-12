import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 4;
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [patientToEdit, setPatientToEdit] = useState(null);

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
  const [year, setYear] = useState("");
  const [sex, setSex] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [position, setPosition] = useState("");

  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchPatients();
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

  const fetchPatients = () => {
    axios
      .get("http://localhost:3001/patients")
      .then((response) => {
        const sortedPatients = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPatients(sortedPatients);
      })
      .catch((error) => {
        console.error("There was an error fetching the patients!", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const patientData = {
      firstname,
      middlename,
      lastname,
      birthdate,
      idnumber,
      address,
      phonenumber,
      email,
      course,
      year,
      sex,
      patientType,
      emergencyContact,
      position,
    };

    if (patientToEdit) {
      // Update existing patient (Edit)
      axios
        .put(`http://localhost:3001/patients/${patientToEdit._id}`, patientData)
        .then((result) => {
          console.log("Patient updated:", result);
          fetchPatients(); // Refresh the patient list after update
          handleModalClose(); // Close the modal after successful update
          setMessage("Patient updated successfully!");
          setTimeout(() => setMessage(""), 3000); // Clear the message after a timeout
        })
        .catch((err) => {
          console.log("Error updating patient:", err);
          setMessage("Error updating patient.");
          setTimeout(() => setMessage(""), 3000); // Clear error message after a timeout
        });
    } else {
      // Add new patient
      axios
        .post("http://localhost:3001/add-patient", patientData)
        .then((result) => {
          console.log("Patient added:", result);
          fetchPatients(); // Refresh the patient list after adding a new patient
          handleModalClose(); // Close the modal after successful addition
          resetForm(); // Clear the form fields after submission (only for new patient)
          setMessage("Patient added successfully!");
          setTimeout(() => setMessage(""), 3000); // Clear success message after a timeout
        })
        .catch((err) => {
          console.log("Error adding patient:", err);
          setMessage("Error adding patient.");
          setTimeout(() => setMessage(""), 3000); // Clear error message after a timeout
        });
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
    setPatientType("");
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.idnumber.includes(searchQuery)
  );

  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
    setPatientToEdit(null); // Clear the editing state
  };

  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleEditPatient = (patientId) => {
    const patient = patients.find((p) => p._id === patientId); // Find the correct patient by ID

    if (patient) {
      // Preload the form with the patient's data
      setPatientToEdit(patient);
      setPatientType(patient.patientType);
      setFirstName(patient.firstname);
      setMiddleName(patient.middlename);
      setLastName(patient.lastname);
      setBirthDate(new Date(patient.birthdate).toISOString().split("T")[0]);
      setIdNumber(patient.idnumber);
      setAddress(patient.address);
      setPhoneNumber(patient.phonenumber);
      setEmail(patient.email);
      setCourse(patient.course);
      setYear(patient.year);
      setSex(patient.sex);
      setEmergencyContact(patient.emergencyContact);
      setPosition(patient.position);
      setIsModalOpen(true);
    }
  };

  const handleDeletePatient = async () => {
    try {
      const patientId = accountToDelete; // Use the stored patient ID
      console.log("Deleting patient with ID:", patientId);
      const result = await axios.delete(
        `http://localhost:3001/patients/${patientId}`
      );
      console.log(result);
      fetchPatients();
      setIsConfirmModalOpen(false);
      setMessage("Patient deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setMessage("Error deleting patient.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteClick = (patientId) => {
    setAccountToDelete(patientId); // Set patient ID to delete
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const [role, setRole] = useState(null); // Store the user role

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole); // Store the role in state
    }
  }, []);

  const [sortOption, setSortOption] = useState(""); // New state for sorting

  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const sortedPatients = filteredPatients
    .filter((patient) => {
      // Optional: Add search filtering here
      return (
        patient.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.firstname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .filter((patient) => {
      // Sorting based on the selected option
      if (sortOption === "Student") return patient.patientType === "Student";
      if (sortOption === "Employee") return patient.patientType === "Employee";
      if (sortOption === "OPD") return patient.patientType === "OPD";
      return true; // Show all if no sorting option selected
    });
    
  return (
    <div>
      <Navbar />

      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        {message && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
            {message}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredPatients.length}
            </span>{" "}
            patients
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
            {role === "nurse" && (
              <button
                onClick={handleModalOpen}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
              >
                Add Patient
              </button>
            )}
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/4">Basic Info</th>
                    <th className="py-3 w-1/4">Birthday</th>
                    <th className="py-3 w-1/4">ID Number</th>
                    <th className="py-3 w-1/4">Department/ Position</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient, index) => (
                      <tr
                        key={patient._id}
                        className="border-b cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/patients/${patient._id}`)
                        }
                      >
                        <td className="py-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold">
                                {patient.lastname}, {patient.firstname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {new Date(patient.birthdate).toLocaleDateString()}
                        </td>
                        <td className="py-4">{patient.idnumber}</td>
                        <td className="py-4">
                        {patient.patientType === "Employee"
                          ? patient.position
                          : `${patient.course} - ${patient.year}`
                        }
                        </td>
                        <td className="py-4">
                          <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current[index] = el)}
                          >
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent the row click event from firing
                                toggleDropdown(index);
                              }}
                            >
                              <BsThreeDots size={20} />
                            </button>
                            {dropdownIndex === index && (
                              <div className="absolute right-0 w-40 bg-white rounded-md shadow-lg border z-10">
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleEditPatient(patient._id); // Pass the patient ID to the edit handler
                                  }}
                                >
                                  <AiOutlineEdit className="mr-2" /> Edit
                                  Patient
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleDeleteClick(patient._id);
                                  }}
                                >
                                  <AiOutlineDelete className="mr-2" /> Delete
                                  Patient
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
                <span className="mr-2">&#9432;</span> Whole patient list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Patients
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this account?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding a new patient */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 px-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-semibold mb-4">
              {patientToEdit ? "Edit Patient" : "Add Patient"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Patient Type Dropdown */}
              <div className="col-span-3">
                <label className="block mb-2">Patient Type</label>
                <select
                  value={patientType}
                  onChange={(e) => setPatientType(e.target.value)}
                  className="px-4 py-2 border rounded w-full"
                  required
                >
                  <option value="">Select Patient Type</option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="OPD">Outpatient (OPD)</option>
                </select>
              </div>

              {patientType === "Student" && (
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

                  {/* ID Number and Course/Year Side by Side */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* ID Number */}
                    <div>
                      <label className="block mb-2">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number"
                        value={idnumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    {/* Course and Year */}
                    <div>
                      <label className="block mb-2">Course and Year</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          placeholder="Enter Course"
                          className="px-4 py-2 border rounded w-full"
                        />
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="Enter Year Lvl"
                          className="px-4 py-2 border rounded w-full"
                        />
                      </div>
                    </div>
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

                  {/* Phone Number, Email, and Emergency Contact */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
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
                      <label className="block mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                        required
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
              )}

              {patientType === "Employee" && (
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

                  {/* ID Number and Course/Year Side by Side */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* ID Number */}
                    <div>
                      <label className="block mb-2">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number"
                        value={idnumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>

                    {/* Position/ Department */}
                    <div>
                      <label className="block mb-2">Position Department</label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Enter Position/ Department"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
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

                  {/* Phone Number, Email, and Emergency Contact */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
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
                      <label className="block mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                        required
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
              )}
              {patientType === "OPD" && (
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
              )}

              {/* Submit/Cancel Buttons */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleModalClose}
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-red text-white rounded-lg"
                >
                  {patientToEdit ? "Update Patient" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
