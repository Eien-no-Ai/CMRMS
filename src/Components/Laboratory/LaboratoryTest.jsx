  import React, { useState, useEffect } from "react";
  import Navbar from "../Navbar/Navbar";
  import { BiSearch } from "react-icons/bi";
  import axios from "axios";
  import { FaRegEdit } from "react-icons/fa";
  import { MdOutlineDelete } from "react-icons/md";

  const LaboratoryTestList = () => {
      const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("Blood Chemistry");
    const [laboratorytests, setLaboratoryTests] = useState([]);
    const [isLaboratoryTestModalOpen, setIsLaboratoryTestModalOpen] = useState(false);
    const [newLaboratoryTest, setNewLaboratoryTest] = useState({
      name: "",
      category: "Blood Chemistry",
      referenceRange: "",
      whatShouldBeIncluded: [],
    });
    const [editableLaboratoryTest, setEditableLaboratoryTest] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState(null);
  
    const laboratorytestsPerPage = 4;
  
useEffect(() => {
  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token'); // adjust this if you store token differently

      const response = await axios.get(`${apiUrl}/api/laboratorytest-list`, {
        headers: {
          "api-key": api_Key,
        },
      });

      setLaboratoryTests(response.data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  fetchTests();
}, []);

const handleLaboratoryTestSubmit = async () => {
  const data = isEditMode ? editableLaboratoryTest : {
    ...newLaboratoryTest,
    category: activeTab,
  };

  try {
    const token = localStorage.getItem('token'); // or use api_Key if required
    const headers = {
      "api-key": api_Key, // or "Authorization": `Bearer ${token}`
    };

    const url = isEditMode
      ? `${apiUrl}/api/laboratorytest-list/${editableLaboratoryTest._id}`
      : `${apiUrl}/api/laboratorytest-list`;

    const method = isEditMode ? axios.put : axios.post;
    const response = await method(url, data, { headers });

    setLaboratoryTests((prevTests) => {
      if (isEditMode) {
        return prevTests.map((test) =>
          test._id === editableLaboratoryTest._id ? response.data : test
        );
      } else {
        return [...prevTests, response.data];
      }
    });

    closeModal();
  } catch (error) {
    console.error("Error submitting laboratory test:", error);
  }
};

  
    const handleEditLaboratoryTest = (test) => {
      setEditableLaboratoryTest(test);
      setNewLaboratoryTest({
        name: test.name,
        category: test.category,
        referenceRange: test.referenceRange,
        whatShouldBeIncluded: test.whatShouldBeIncluded || [],
      });
      setIsEditMode(true);
      setIsLaboratoryTestModalOpen(true);
    };
  
    const closeModal = () => {
      setIsLaboratoryTestModalOpen(false);
      resetForm();
    };
  
    const resetForm = () => {
      setEditableLaboratoryTest(null);
      setNewLaboratoryTest({
        name: "",
        category: "Blood Chemistry",
        referenceRange: "",
        whatShouldBeIncluded: [],
      });
      setIsEditMode(false);
    };
  
const handleDeleteLaboratoryTest = async () => {
  try {
    const token = localStorage.getItem('token'); // or use api_Key if required
    const headers = {
      "api-key": api_Key, // or "Authorization": `Bearer ${token}`
    };

    await axios.delete(`${apiUrl}/api/laboratorytest-list/${testToDelete._id}`, {
      headers,
    });

    setLaboratoryTests((prevTests) =>
      prevTests.filter((test) => test._id !== testToDelete._id)
    );
    setIsDeleteModalOpen(false);
    setTestToDelete(null);
  } catch (error) {
    console.error("Error deleting laboratory test:", error);
  }
};

  
    const filteredLaboratoryTests = laboratorytests.filter(
      (laboratorytest) =>
        laboratorytest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        laboratorytest.category === activeTab
    );
  
    const indexOfLastLaboratoryTest = currentPage * laboratorytestsPerPage;
    const indexOfFirstLaboratoryTest = indexOfLastLaboratoryTest - laboratorytestsPerPage;
    const currentLaboratoryTests = filteredLaboratoryTests.slice(
      indexOfFirstLaboratoryTest,
      indexOfLastLaboratoryTest
    );
  
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
  
    const totalPages = Math.ceil(filteredLaboratoryTests.length / laboratorytestsPerPage);
  
    const handleTabClick = (tab) => {
      setActiveTab(tab);
      setCurrentPage(1);
    };
  
    const handleIncludedItemChange = (index, value) => {
      const updated = isEditMode ? [...editableLaboratoryTest.whatShouldBeIncluded] : [...newLaboratoryTest.whatShouldBeIncluded];
      updated[index] = value;
      if (isEditMode) {
        setEditableLaboratoryTest({ ...editableLaboratoryTest, whatShouldBeIncluded: updated });
      } else {
        setNewLaboratoryTest({ ...newLaboratoryTest, whatShouldBeIncluded: updated });
      }
    };
  
    const handleAddIncludedItem = () => {
      if (isEditMode) {
        setEditableLaboratoryTest({
          ...editableLaboratoryTest,
          whatShouldBeIncluded: [...(editableLaboratoryTest.whatShouldBeIncluded || []), ""],
        });
      } else {
        setNewLaboratoryTest({
          ...newLaboratoryTest,
          whatShouldBeIncluded: [...newLaboratoryTest.whatShouldBeIncluded, ""],
        });
      }
    };
      return (
      <div>
        <Navbar />
        <div className="p-6 pt-20 bg-gray-100 min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-semibold">Laboratory Tests List</h1>
          </div>

          <div className="mb-4">
            <ul className="flex space-x-6 justify-center">
              {["Blood Chemistry", "Hematology", "Clinical Microscopy & Parasitology", "Blood Banking And Serology"].map((tab) => (
                <li
                  key={tab}
                  className={`cursor-pointer py-2 px-4 rounded-full ${activeTab === tab ? "bg-custom-red text-white" : "bg-white text-gray-600"}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </li>
              ))}
            </ul>
          </div>


          <div className="flex justify-end items-center mb-6 space-x-4">
    <div className="relative w-72">
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none w-full"
      />
      <BiSearch className="absolute right-2 top-2 text-gray-400" size={24} />
    </div>
    <button
      className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
      onClick={() => setIsLaboratoryTestModalOpen(true)}
    >
      Add Laboratory Test
    </button>
  </div>




          {/* Laboratory Test Table */}
          <div className="bg-white p-6 py-1 rounded-lg shadow-md">
          <table className="min-w-full">
    <thead>
      <tr className="text-left text-gray-600">
        <th className="py-3 w-1/4">Name</th>
        {activeTab !== "Clinical Microscopy & Parasitology" && activeTab !== "Blood Banking And Serology" && (
          <th className="py-3 w-1/4">Reference Range</th> // Only show for categories that need it
        )}
        <th className="py-3 w-1/4"></th>
        <th className="py-3 w-1/12"></th>
      </tr>
    </thead>
    <tbody>
    {filteredLaboratoryTests.length === 0 ? (
      <tr>
        <td colSpan="4" className="py-4 text-center text-gray-500">
          No laboratory tests found.
        </td>
      </tr>
    ) : (
      [...currentLaboratoryTests] // copy to avoid mutating original array
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sort descending by createdAt
        .map((test, index) => (
          <tr key={index} className="border-b">
            <td className="py-3">
              <p className="font-semibold">{test.name}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(test.createdAt).toLocaleString()}
              </p>
            </td>
            {activeTab !== "Clinical Microscopy & Parasitology" &&
            activeTab !== "Blood Banking And Serology" ? (
              <td className="py-3">{test.referenceRange}</td>
            ) : (
              <td className="py-3"></td>
            )}
            <td className="py-3"></td>
            <td className="py-3 text-center">
              <button
                onClick={() => handleEditLaboratoryTest(test)}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                <FaRegEdit size={24} />
              </button>
              <button
                onClick={() => {
                  setTestToDelete(test);
                  setIsDeleteModalOpen(true);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <MdOutlineDelete size={24} />
              </button>
            </td>
          </tr>
        ))
    )}
  </tbody>

  </table>

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

          {/* Modal for Adding Laboratory Test */}
          {isLaboratoryTestModalOpen && !isEditMode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4">Add Laboratory Test</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lab Test Name</label>
                  <input
                    type="text"
                    value={newLaboratoryTest.name}
                    onChange={(e) => setNewLaboratoryTest({ ...newLaboratoryTest, name: e.target.value })}
                    className="w-full border-gray-300 border rounded-lg p-2 mb-4"
                    required
                  />
                </div>

                {activeTab !== "Blood Banking And Serology" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference Range</label>
                    <input
                      type="text"
                      value={newLaboratoryTest.referenceRange}
                      onChange={(e) =>
                        setNewLaboratoryTest({ ...newLaboratoryTest, referenceRange: e.target.value })
                      }
                      className="w-full border-gray-300 border rounded-lg p-2 mb-4"
                    />
                  </div>
                )}

                {activeTab === "Clinical Microscopy & Parasitology" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What should be included</label>
                    {newLaboratoryTest.whatShouldBeIncluded.map((item, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleIncludedItemChange(index, e.target.value)}
                          className="w-full border-gray-300 border rounded-lg p-2 mb-2"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddIncludedItem}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Add Another Item
                    </button>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLaboratoryTestModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLaboratoryTestSubmit}
                    className="px-4 py-2 bg-custom-red text-white rounded-lg"
                  >
                    Add Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Editing Laboratory Test */}
          {isLaboratoryTestModalOpen && isEditMode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-semibold mb-4">Edit Laboratory Test</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lab Test Name</label>
                  <input
                    type="text"
                    value={editableLaboratoryTest.name}
                    onChange={(e) =>
                      setEditableLaboratoryTest({ ...editableLaboratoryTest, name: e.target.value })
                    }
                    className="w-full border-gray-300 border rounded-lg p-2 mb-4"
                    required
                  />
                </div>

                {activeTab !== "Blood Banking And Serology" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference Range</label>
                    <input
                      type="text"
                      value={editableLaboratoryTest.referenceRange}
                      onChange={(e) =>
                        setEditableLaboratoryTest({
                          ...editableLaboratoryTest,
                          referenceRange: e.target.value,
                        })
                      }
                      className="w-full border-gray-300 border rounded-lg p-2 mb-4"
                    />
                  </div>
                )}

                {activeTab === "Clinical Microscopy & Parasitology" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What should be included</label>
                    {editableLaboratoryTest.whatShouldBeIncluded.map((item, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleIncludedItemChange(index, e.target.value)}
                          className="w-full border-gray-300 border rounded-lg p-2 mb-2"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddIncludedItem}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Add Another Item
                    </button>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setIsLaboratoryTestModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLaboratoryTestSubmit}
                    className="px-4 py-2 bg-custom-red text-white rounded-lg"
                  >
                    Update Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this test?</h2>
                <div className="flex justify-between">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLaboratoryTest}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
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

  export default LaboratoryTestList;