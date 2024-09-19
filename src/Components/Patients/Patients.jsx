import React, { useState, useEffect , useRef } from "react";
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
  
  const [firstname, setFirstName] = useState("");
  const [middlename, setMiddleName] = useState("");
  const [lastname, setLastName] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [idnumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalcode, setPostalCode] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [sex, setSex] = useState("");
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);
  
  useEffect(() => {
    fetchPatients();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefs.current.every(ref => ref && !ref.contains(event.target))) {
        setDropdownIndex(null);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchPatients = () => {
    axios
      .get("http://localhost:3001/patients")
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the patients!", error);
      });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/add-patient", {
        firstname,
        middlename,
        lastname,
        birthdate,
        idnumber,
        address,
        city,
        state,
        postalcode,
        phonenumber,
        email,
        course,
        sex,
      })
      .then((result) => {
        console.log(result);
        fetchPatients(); 
        handleModalClose(); 
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setBirthDate("");
        setIdNumber("");
        setAddress("");
        setCity("");
        setState("");
        setPostalCode("");
        setPhoneNumber("");
        setEmail("");
        setCourse("");
        setSex("");
      })
      .catch((err) => console.log(err));
  };
  
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  const totalPages = Math.ceil(patients.length / patientsPerPage);
  
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
  };
  
  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };
 
  const handleEditPatient = (index) => {
    console.log("Edit patient:", patients[index]);
  };
  
  
  const handleDeletePatient = async () => {
    try {
      const fullIndex = (currentPage - 1) * patientsPerPage + accountToDelete;
      const patientId = patients[fullIndex]._id;
  
      // Send delete request to backend with the patient ID in the URL
      const result = await axios.delete(`http://localhost:3001/patients/${patientId}`);
      
      console.log(result);
      fetchPatients(); // Refresh the patient list after deletion
      setIsConfirmModalOpen(false); // Close the modal
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  };
  

  const handleDeleteClick = (index) => {
    setAccountToDelete(index);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };



  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {patients.length}
            </span>{" "}
            patients
          </p>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none w-72"
              />
              <BiSearch
                className="absolute right-2 top-2 text-gray-400"
                size={24}
              />
            </div>
            <button
              onClick={handleModalOpen}
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
            >
              Add Patient
            </button>
          </div>
        </div>

        {!showFullList ? (
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
        ) : (
          <>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                  <th className="py-3 w-1/4">Basic Info</th>
                    <th className="py-3 w-1/4">Birthday</th>
                    <th className="py-3 w-1/4">ID Number</th>
                    <th className="py-3 w-1/4">Course/ Yr</th>
                    <th className="py-3 w-1/12"></th>

                  </tr>
                </thead>
                <tbody>
                  {currentPatients.map((patient,index) => (
                    <tr key={(patient._id,index)} className="border-b">
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
                      <td className="py-4">{patient.course}</td>

                      <td className="py-4">
  <div className="relative" ref={(el) => (dropdownRefs.current[index] = el)}>
    <button
      className="text-gray-500 hover:text-gray-700"
      onClick={() => toggleDropdown(index)}
    >
      <BsThreeDots size={20} />
    </button>
    {dropdownIndex === index && (
      <div className="absolute right-0 w-40 bg-white rounded-md shadow-lg border z-10">
        <button
          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
          onClick={() => handleEditPatient(index)}
        >
          <AiOutlineEdit className="mr-2" /> Edit Patient
        </button>
        <button
          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
          onClick={() => handleDeleteClick(index)}
        >
          <AiOutlineDelete className="mr-2" /> Delete Patient
        </button>
      </div>
    )}
  </div>
</td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                Page <span className="text-custom-red">{currentPage} </span> of{" "}
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
          </>
        )}
      </div>

     {/* Confirmation Modal */}
     {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this account?</p>
              <div className="mt-4 flex justify-end">
                <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2">
                  Cancel
                </button>
                <button onClick={handleDeletePatient} className="px-4 py-2 bg-red-600 text-white rounded-lg">
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
            <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                {/* Full Name */}
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
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="Enter Course"
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
                    placeholder="Street Address"
                    className="px-4 py-2 border rounded w-full"
                  />
                </div>

                {/* City, State/Province */}
                <div className="col-span-1">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="px-4 py-2 border rounded w-full"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State/Province"
                    className="px-4 py-2 border rounded w-full"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="text"
                    value={postalcode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal/Zip Code"
                    className="px-4 py-2 border rounded w-full"
                  />
                </div>

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
                  Add Patient
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
