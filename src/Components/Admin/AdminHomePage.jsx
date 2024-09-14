import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import Navbar from "../Navbar/Navbar";

function AdminHomePage() {
  const accounts = [
    {
      lastname: "Abejar",
      firstname: "Juan Ambilan",
      email: "19951245@s.ubaguio.edu",
      role: "Doctor",
      idnumber: "19951245",
    },
    {
      lastname: "Villalon",
      firstname: "Anthony",
      email: "20214098@s.ubaguio.edu",
      role: "Lab Technician",
      idnumber: "20214098",
    },
    {
      lastname: "Delos Santos",
      firstname: "Jayson",
      email: "20214556@s.ubaguio.edu",
      role: "Nurse",
      idnumber: "20214556",
    },
    {
      lastname: "Abejar",
      firstname: "Juan Ambilan",
      email: "19951245@s.ubaguio.edu",
      role: "Doctor",
      idnumber: "19951245",
    },
    {
      lastname: "Villalon",
      firstname: "Anthony",
      email: "20214098@s.ubaguio.edu",
      role: "Lab Technician",
      idnumber: "20214098",
    },
    {
      lastname: "Delos Santos",
      firstname: "Jayson",
      email: "20214556@s.ubaguio.edu",
      role: "Nurse",
      idnumber: "20214556",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 4;
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);

  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = accounts.slice(
    indexOfFirstAccount,
    indexOfLastAccount
  );

  const totalPages = Math.ceil(accounts.length / accountsPerPage);

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

  const handleDropdownToggle = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleRoleAdd = (index) => {
    // Logic to add role
    console.log("Add role for account", index);
  };

  const handleResetPassword = (index) => {
    // Logic to reset password
    console.log("Reset password for account", index);
  };

  const handleDeleteAccount = (index) => {
    // Logic to delete account
    console.log("Delete account", index);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Account List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">76</span>{" "}
            accounts
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
              Add Account
            </button>
          </div>
        </div>

        {!showFullList ? (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex justify-center">
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">&#9432;</span> Whole account list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Accounts
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
                    <th className="py-3">Role</th>
                    <th className="py-3">ID Number</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentAccounts.map((account, index) => (
                    <tr key={index} className="border-b relative">
                      <td className="py-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">
                              {account.lastname}, {account.firstname}
                            </p>
                            <p className="text-sm text-gray-500">
                              {account.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{account.role}</td>
                      <td className="py-4">{account.idnumber}</td>
                      <td className="py-4">
                        <div className="relative">
                          <button
                            onClick={() => handleDropdownToggle(index)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <BsThreeDots size={20} />
                          </button>
                          {dropdownIndex === index && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                              <button
                                onClick={() => handleRoleAdd(index)}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                              >
                                <AiOutlineEdit className="mr-2" /> Add Role
                              </button>
                              <button
                                onClick={() => handleResetPassword(index)}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                              >
                                <AiOutlineEdit className="mr-2" /> Reset
                                Password
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(index)}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                              >
                                <AiOutlineDelete className="mr-2" /> Delete
                                Account
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 px-8 rounded-lg shadow-lg w-1/2">
              <h2 className="text-xl font-semibold mb-4">Add Account</h2>

              {/* Account Form */}
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

                  {/* Role */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block mb-2">Role</label>
                      <select
                        defaultValue="default"
                        className="px-4 py-2 border rounded w-full"
                      >
                        <option value="default" disabled>
                          Select Role
                        </option>
                        <option>Doctor</option>
                        <option>Lab Technician</option>
                        <option>Nurse</option>
                        <option>Other</option>
                      </select>
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
                    Add Account
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

export default AdminHomePage;
