import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BiSearch } from "react-icons/bi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import Navbar from "../Navbar/Navbar";

function AdminHomePage() {
  const [accounts, setAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 4;
  const [showFullList, setShowFullList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [message, setMessage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [newAccount, setNewAccount] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "user",
    department: "",
    licenseNo: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRefs = useRef([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/accounts")
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
      });
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const filteredAccounts = accounts.filter((account) =>
    `${account.firstname} ${account.lastname} ${account.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Show filtered accounts based on search query or partial accounts if no search
  const accountsToDisplay = searchQuery
    ? filteredAccounts
    : !showFullList
    ? []
    : accounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

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
    setNewAccount({
      firstname: "",
      lastname: "",
      email: "",
      role: "user",
      department: "",
      licenseNo: "",
    });
  };

  const handleDropdownToggle = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleAddAccount = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/add-account",
        newAccount
      );
      if (response.data.message === "Account Created Successfully") {
        setAccounts([...accounts, response.data.account]);
        setMessage("Account successfully added. Password set to last name.");
        handleModalClose();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error adding account:", error);
      setMessage("Error adding account.");
    }
  };

  const handleInputChange = (e) => {
    setNewAccount({
      ...newAccount,
      [e.target.name]: e.target.value,
    });
  };
  const handleRoleChange = async (localIndex, newRole) => {
    // Get the index of the filtered accounts
    const filteredIndex = (currentPage - 1) * accountsPerPage + localIndex;
    
    // Find the account from the filtered accounts
    const accountToUpdate = filteredAccounts[filteredIndex];
  
    if (accountToUpdate) {
      const email = accountToUpdate.email; // Use the email of the correct account
  
      try {
        const response = await axios.post("http://localhost:3001/role", {
          email: email,
          role: newRole,
        });
  
        if (response.data.message === "Role Updated") {
          setAccounts((prevAccounts) => {
            const updatedAccounts = [...prevAccounts];
            // Update the role of the specific account in the original list
            const accountIndex = prevAccounts.findIndex((acc) => acc.email === email);
            if (accountIndex !== -1) {
              updatedAccounts[accountIndex].role = newRole; // Update the role
            }
            return updatedAccounts;
          });
          setMessage("Role successfully updated.");
        } else {
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error("Error updating role:", error);
        setMessage("Error updating role.");
      }
    }
  };
  

  const handleResetPassword = async (index) => {
    const fullIndex = (currentPage - 1) * accountsPerPage + index;
    const email = accounts[fullIndex].email;
    const lastname = accounts[fullIndex].lastname;

    try {
      const response = await axios.post(
        "http://localhost:3001/reset-password",
        {
          email: email,
          lastname: lastname,
        }
      );

      if (response.data.message === "Password Reset Successfully") {
        setMessage("Password successfully reset to the user's last name.");
        setDropdownIndex(null);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("Error resetting password.");
    }
  };

  const handleDeleteClick = (index) => {
    setAccountToDelete(index);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    const fullIndex = (currentPage - 1) * accountsPerPage + accountToDelete;
    const email = accounts[fullIndex].email;

    try {
      const response = await axios.post(
        "http://localhost:3001/delete-account",
        {
          email: email,
        }
      );

      if (response.data.message === "Account Deleted Successfully") {
        setAccounts((prevAccounts) => {
          const updatedAccounts = [...prevAccounts];
          updatedAccounts.splice(fullIndex, 1);
          return updatedAccounts;
        });
        setMessage("Account successfully deleted.");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage("Error deleting account.");
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Account List</h1>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {accounts.length}
            </span>{" "}
            accounts
          </p>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              Add Account
            </button>
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/3">Basic Info</th>
                    <th className="py-3 w-1/3">Role</th>
                    <th className="py-3 w-1/3">Email</th>
                    <th className="py-3 w-1/3"></th>
                  </tr>
                </thead>
                <tbody>
                  {accountsToDisplay.map((account, index) => (
                    <tr key={index} className="border-b relative">
                      <td className="py-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">
                              {account.lastname}, {account.firstname}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {account._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <select
                          value={account.role || "User"}
                          onChange={(e) =>
                            handleRoleChange(index, e.target.value)
                          }
                          className="px-4 py-2 border rounded w-1/2"
                        >
                          {account.department === "clinic" ? (
                            <>
                              <option value="user" disabled>
                                User
                              </option>

                              <option value="nurse">Nurse</option>
                              <option value="doctor">Doctor</option>
                            </>
                          ) : account.department === "laboratory" ? (
                            <>
                              <option value="user" disabled>
                                User
                              </option>

                              <option value="junior medtech">
                                Junior MedTech
                              </option>
                              <option value="senior medtech">
                                Senior MedTech
                              </option>
                            </>
                          ) : account.department === "xray" ? (
                            <>
                              <option value="user" disabled>
                                User
                              </option>

                              <option value="radiologic technologist">
                                Radiologic Technologist
                              </option>
                              <option value="radiologist">Radiologist</option>
                              <option value="dentist">Dentist</option>

                            </>
                          ) : (
                            <>
                              <option value="user" disabled>
                                User
                              </option>
                              <option value="nurse">Nurse</option>
                              <option value="doctor">Doctor</option>
                              <option value="pathologist">Pathologist</option>
                              <option value="junior medtech">Junior MedTech</option>
                              <option value="senior medtech">Senior MedTech</option>
                              <option value="radiologic technologist">Radiologic Technologist</option>
                              <option value="radiologist">Radiologist</option>
                              <option value="dentist">Dentist</option> 
                              <option value="admin">Admin</option>
                            </>
                          )}
                        </select>
                      </td>

                      <td className="py-4">{account.email}</td>
                      <td className="py-4">
                        <div
                          className="relative"
                          ref={(el) => (dropdownRefs.current[index] = el)}
                        >
                          <button
                            onClick={() => handleDropdownToggle(index)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <BsThreeDots size={20} />
                          </button>
                          {dropdownIndex === index && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                              <button
                                onClick={() => handleResetPassword(index)}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                              >
                                <AiOutlineEdit className="mr-2" /> Reset
                                Password
                              </button>
                              <button
                                onClick={() => handleDeleteClick(index)}
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
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div>
                  Page <span className="text-custom-red">{currentPage} </span>{" "}
                  of {totalPages}
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
            )}
          </div>
        ) : (
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
        )}

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
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding Account */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 px-8 rounded-lg shadow-lg w-1/2">
              <h2 className="text-xl font-semibold mb-4">Add Account</h2>

              <form onSubmit={handleAddAccount}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3">
                    <label className="block mb-2">Full Name</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="firstname"
                        value={newAccount.firstname}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        name="middlename"
                        placeholder="Middle Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                      <input
                        type="text"
                        name="lastname"
                        value={newAccount.lastname}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
                  </div>

                  {/* Department Selection */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block mb-2">Department</label>
                      <select
                        name="department"
                        value={newAccount.department}
                        onChange={handleInputChange}
                        className="px-4 py-2 border rounded w-full"
                      >
                        <option value="">Select Department</option>
                        <option value="clinic">Clinic</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="xray">X-Ray</option>
                        <option value="pt">Physical Therapy</option>
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block mb-2">License No.</label>
                      <input
                        type="text"
                        name="licenseNo"
                        value={newAccount.licenseNo}
                        onChange={handleInputChange}
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
                  </div>


                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block mb-2">Role</label>
                      <select
                        name="role"
                        value={newAccount.role}
                        onChange={handleInputChange}
                        className="px-4 py-2 border rounded w-full"
                      >
                        <option value="user" disabled>
                          User
                        </option>

                        {newAccount.department === "clinic" ? (
                          <>
                            <option value="nurse">Nurse</option>
                            <option value="doctor">Doctor</option>
                          </>
                        ) : newAccount.department === "laboratory" ? (
                          <>
                            <option value="junior medtech">
                              Junior MedTech
                            </option>
                            <option value="senior medtech">
                              Senior MedTech
                            </option>
                          </>
                        ) : newAccount.department === "xray" ? (
                          <>
                            <option value="radiologic technologist">
                              Radiologic Technologist
                            </option>
                            <option value="radiologist">Radiologist</option>
                          </>
                        ) : newAccount.department === "pt" ? (
                        <>
                          <option value="special trainee">Special Trainee</option>
                          <option value="physical therapist">Physical Therapist</option>
                        </>
                        ) : (
                          <>
                            <option value="nurse">Nurse</option>
                            <option value="doctor">Doctor</option>
                            <option value="pathologist">Pathologist</option>
                            <option value="junior medtech">
                              Junior MedTech
                            </option>
                            <option value="senior medtech">
                              Senior MedTech
                            </option>
                            <option value="radiologic technologist">
                              Radiologic Technologist
                            </option>
                            <option value="radiologist">Radiologist</option>
                            <option value="admin">Admin</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">E-mail Address</label>
                      <input
                        type="email"
                        name="email"
                        value={newAccount.email}
                        onChange={handleInputChange}
                        placeholder="example@example.com"
                        className="px-4 py-2 border rounded w-full"
                      />
                    </div>
                  </div>
                </div>

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
