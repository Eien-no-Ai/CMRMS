import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import Navbar from "../Navbar/Navbar";

function Patients() {
  const patients = [
    {
      lastname: "Abejar",
      firstname: "Juan Ambilan",
      email: "19951245@s.ubaguio.edu",
      birthdate: "02/15/1984",
      birthplace: "Baguio City",
      idnumber: "19951245",
    },
    {
      lastname: "Villalon",
      firstname: "Anthony",
      email: "20214098@s.ubaguio.edu",
      birthdate: "03/09/2003",
      birthplace: "Baguio City",
      idnumber: "20214098",
    },
    {
      lastname: "Delos Santos",
      firstname: "Jayson",
      email: "20214556@s.ubaguio.edu",
      birthdate: "07/15/2002",
      birthplace: "Baguio City",
      idnumber: "20214556",
    },
    {
      lastname: "Abejar",
      firstname: "Juan Ambilan",
      email: "19951245@s.ubaguio.edu",
      birthdate: "02/15/1984",
      birthplace: "Baguio City",
      idnumber: "19951245",
    },
    {
      lastname: "Villalon",
      firstname: "Anthony",
      email: "20214098@s.ubaguio.edu",
      birthdate: "03/09/2003",
      birthplace: "Baguio City",
      idnumber: "20214098",
    },
    {
      lastname: "Delos Santos",
      firstname: "Jayson",
      email: "20214556@s.ubaguio.edu",
      birthdate: "07/15/2002",
      birthplace: "Baguio City",
      idnumber: "20214556",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 4;
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

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

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">76</span>{" "}
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
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
            >
              Add Patient
            </button>
          </div>
        </div>

        {!showFullList ? (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex justify-center">
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">&#9432;</span> Whole patient list are not
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
                    <th className="py-3">Basic Info</th>
                    <th className="py-3">Birthday</th>
                    <th className="py-3">Birth Place</th>
                    <th className="py-3">ID Number</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.map((patient, index) => (
                    <tr key={index} className="border-b">
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
                      <td className="py-4">{patient.birthdate}</td>
                      <td className="py-4">{patient.birthplace}</td>
                      <td className="py-4">{patient.idnumber}</td>
                      <td className="py-4">
                        <div className="relative">
                          <button className="text-gray-500 hover:text-gray-700">
                            <BsThreeDots size={20} />
                          </button>
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border hidden group-hover:block">
                            <button className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full">
                              <AiOutlineEdit className="mr-2" /> Edit Patient
                            </button>
                            <button className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full">
                              <AiOutlineDelete className="mr-2" /> Delete
                              Patient
                            </button>
                          </div>
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 px-8 rounded-lg shadow-lg w-1/2">
              <h2 className="text-xl font-semibold mb-4">Add Patient</h2>

              {/* Medical Report Form */}
              <form>
                <div className="grid grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="col-span-3">
                    <label className="block mb-2">Full Name</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        placeholder="Middle Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
                  </div>

                  {/* Date of Birth and Sex */}
                  <div className="col-span-2">
                    <label className="block mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="px-4 py-2 border rounded w-full"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block mb-2">Sex</label>
                    <select
                      defaultValue="default"
                      className="px-4 py-2 border rounded w-full"
                    >
                      <option value="default" disabled>
                        Select Sex
                      </option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    {/* ID Number */}
                    <div>
                      <label className="block mb-2">ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter ID Number"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    {/* Course and Year */}
                    <div>
                      <label className="block mb-2">Course and Year</label>
                      <input
                        type="text"
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
                      placeholder="Street Address"
                      className="px-4 py-2 border rounded w-full"
                    />
                  </div>

                  {/* City, State/Province */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="City"
                      className="px-4 py-2 border rounded w-full"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="State/Province"
                      className="px-4 py-2 border rounded w-full"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Postal/Zip Code"
                      className="px-4 py-2 border rounded w-full"
                    />
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="(000) 000-0000"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">E-mail Address</label>
                      <input
                        type="email"
                        placeholder="example@example.com"
                        className="px-4 py-2 border rounded w-full"
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
    </div>
  );
}

export default Patients;
