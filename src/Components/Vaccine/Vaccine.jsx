import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

const VaccineList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [newVaccine, setNewVaccine] = useState({ name: "" });
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  const vaccinesPerPage = 4;

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/vaccine-list`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
      // Assuming response.data contains an array of vaccines with `createdAt` field
      const sortedVaccines = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setVaccines(sortedVaccines);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
    }
  };

  const handleVaccineSubmit = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/vaccine-list`,
        {
          ...newVaccine,
          createdAt: new Date(), // Add createdAt timestamp
        },
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      // Re-fetch vaccines to ensure the list is updated and sorted properly
      await fetchVaccines();

      // Close the modal and reset form after successful submission
      setIsVaccineModalOpen(false);
      setNewVaccine({ name: "" });
    } catch (error) {
      console.error("Error adding vaccine:", error);
    }
  };

  const filteredVaccines = vaccines.filter((vaccine) =>
    vaccine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastVaccine = currentPage * vaccinesPerPage;
  const indexOfFirstVaccine = indexOfLastVaccine - vaccinesPerPage;
  const currentVaccines = filteredVaccines.slice(
    indexOfFirstVaccine,
    indexOfLastVaccine
  );
  const totalPages = Math.ceil(filteredVaccines.length / vaccinesPerPage);

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

  const [isEditMode, setIsEditMode] = useState(false); // Track edit mode
  const [editableVaccine, setEditableVaccine] = useState({ name: "" }); // For storing vaccine being edited

  // Open edit modal and set selected vaccine data
  const handleEditVaccine = (vaccine) => {
    setEditableVaccine(vaccine);
    setIsEditMode(true);
    setIsVaccineModalOpen(true);
  };

  const handleUpdateVaccine = async () => {
    try {
      await axios.put(
        `${apiUrl}/api/vaccine-list/${editableVaccine._id}`,
        editableVaccine,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );

      // Re-fetch vaccines to ensure the list is updated and sorted properly
      await fetchVaccines();

      // Close the modal and reset the edit mode
      setIsEditMode(false);
      setIsVaccineModalOpen(false);
    } catch (error) {
      console.error("Error updating vaccine:", error);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState(null);

  const handleDeleteVaccineConfirmation = (vaccine) => {
    setVaccineToDelete(vaccine);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteVaccine = async () => {
    if (!vaccineToDelete) return;

    try {
      await axios.delete(
        `${apiUrl}/api/vaccine-list/${vaccineToDelete._id}`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
      // Re-fetch vaccines to ensure the list is updated and sorted properly
      await fetchVaccines();
      // Close the confirmation modal
      setIsDeleteModalOpen(false);
      setVaccineToDelete(null);
    } catch (error) {
      console.error("Error deleting vaccine:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Vaccine List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredVaccines.length}
            </span>{" "}
            Vaccines
          </p>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none w-72"
              />
              <BiSearch
                className="absolute right-2 top-2 text-gray-400"
                size={24}
              />
            </div>
            <button
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
              onClick={() => setIsVaccineModalOpen(true)}
            >
              Add Vaccine
            </button>
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-3 w-1/4">Package Info</th>
                    <th className="py-3 w-1/4"></th>
                    <th className="py-3 w-1/4"></th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentVaccines.length === 0 ? (
                    <tr>
                      <td
                        colSpan="2"
                        className="py-4 text-center text-gray-500"
                      >
                        No vaccines found.
                      </td>
                    </tr>
                  ) : (
                    currentVaccines.map((vaccine) => (
                      <tr key={vaccine._id} className="border-b">
                        <td className="py-3">
                          <p className="font-semibold">{vaccine.name}</p>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(vaccine.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="py-3"></td>
                        <td className="py-3"></td>
                        <td className="py-3">
                          <button
                            className="text-blue-500 hover:text-blue-700 mr-2"
                            onClick={() => handleEditVaccine(vaccine)}
                          >
                            <FaRegEdit size={24} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() =>
                              handleDeleteVaccineConfirmation(vaccine)
                            }
                          >
                            <MdOutlineDelete size={24} />
                          </button>
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
                <span className="mr-2">&#9432;</span> Full vaccine list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Vaccines
              </button>
            </div>
          </div>
        )}

        {/* Vaccine Modal */}
        {isVaccineModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-4 px-6 rounded-lg w-full max-w-lg shadow-lg">
              <h2 className="text-lg font-semibold text-center">
                {isEditMode ? "Edit Vaccine" : "Add Vaccine"}
              </h2>
              <div className="mt-4">
                <label className="block text-sm font-medium">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={isEditMode ? editableVaccine.name : newVaccine.name}
                  onChange={(e) =>
                    isEditMode
                      ? setEditableVaccine({
                          ...editableVaccine,
                          name: e.target.value,
                        })
                      : setNewVaccine({ ...newVaccine, name: e.target.value })
                  }
                  className="w-full mt-2 border rounded-md p-2"
                  placeholder="Enter vaccine name"
                />
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:border-gray-500 border"
                  onClick={() => {
                    setIsEditMode(false);
                    setIsVaccineModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border"
                  onClick={
                    isEditMode ? handleUpdateVaccine : handleVaccineSubmit
                  }
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-4 px-6 rounded-lg w-full max-w-lg shadow-lg">
              <h2 className="text-lg font-semibold text-center">
                Confirm Delete
              </h2>
              <p className="mt-4 text-center">
                Are you sure you want to delete the vaccine{" "}
                <span className="font-bold">{vaccineToDelete?.name}</span>?
              </p>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:border-gray-500 border"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-red-600 hover:border-red-600 border"
                  onClick={handleConfirmDeleteVaccine}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccineList;
