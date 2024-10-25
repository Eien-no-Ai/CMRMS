import React, { useState, useEffect ,useRef} from "react";
import Navbar from "../Navbar/Navbar";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const Package = () => {
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newXrayRecord, setNewXrayRecord] = useState({
    xrayType: "",
    xrayDescription: "",
  });

  const [addPackage, setAddPackage] = useState("");
  const [formData, setFormData] = useState({
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
  });

  const [packages, setPackages] = useState([]); // State to hold the fetched packages

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/packages");
        setPackages(response.data); // Set the fetched packages to state
      } catch (error) {
        console.error("Error fetching packages:", error);
        alert("Failed to fetch packages. Please try again.");
      }
    };

    fetchPackages(); // Fetch packages when the component mounts
  }, []);

  const handleInputChange = (category, key) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [category]: {
        ...prevFormData[category],
        [key]: prevFormData[category][key] === "" ? key : "", // Toggle logic or value capturing
      },
    }));
  };

  const handleModalClose = () => {
    setPackageToEdit(null); // Reset package to edit
    setIsPackageModalOpen(false);
    // Reset form data on modal close
    setAddPackage("");
    setFormData({
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
    });
    setNewXrayRecord({ xrayType: "", xrayDescription: "" }); // Reset the X-ray record as well
  };

  const [message, setMessage] = useState(""); // State to hold success/error message
  const [packageToEdit, setPackageToEdit] = useState(null); // State to hold the package to edit

  const handleSubmit = async () => {
    try {
      // Prepare the data to send to the backend
      const packageData = {
        name: addPackage,
        ...formData,
        xrayType: newXrayRecord.xrayType,
        xrayDescription: newXrayRecord.xrayDescription,
      };
  
      if (packageToEdit) {
        // Update existing package (Edit)
        const response = await axios.put(
          `http://localhost:3001/api/packages/${packageToEdit._id}`,
          packageData
        );
  
        console.log("Package updated successfully:", response.data);
        setPackages((prevPackages) =>
          prevPackages.map((pkg) =>
            pkg._id === packageToEdit._id ? response.data.package : pkg
          )
        ); // Update packages state with the edited package
  
        setIsPackageModalOpen(false); // Close the modal after successful update
        setMessage("Package updated successfully!");
        setTimeout(() => setMessage(""), 3000); // Clear success message after a timeout
      } else {
        // Add new package
        const response = await axios.post(
          "http://localhost:3001/api/packages",
          packageData
        );
  
        console.log("Package created successfully:", response.data);
        setPackages((prevPackages) => [...prevPackages, response.data]); // Update packages state with the new package
        setIsPackageModalOpen(false); // Close the modal after submission
        setMessage("Package added successfully!");
        setTimeout(() => setMessage(""), 3000); // Clear success message after a timeout
      }
  
      // Reset form fields
      setAddPackage("");
      setFormData({
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
      });
      setNewXrayRecord({ xrayType: "", xrayDescription: "" });
    } catch (error) {
      console.error("Error submitting package:", error);
      setMessage("Failed to process package. Please try again.");
      setTimeout(() => setMessage(""), 3000); // Clear error message after a timeout
    }
  };
  
  const handleEditPackage = (packageId) => {
    // Find the selected package by ID
    const packageToEdit = packages.find((pkg) => pkg._id === packageId);
  
    if (packageToEdit) {
      // Preload the form with the package's data
      setPackageToEdit(packageToEdit);
      setAddPackage(packageToEdit.name);
      setFormData({
        bloodChemistry: {
          bloodSugar: packageToEdit.bloodChemistry?.bloodSugar || "",
          bloodUreaNitrogen: packageToEdit.bloodChemistry?.bloodUreaNitrogen || "",
          bloodUricAcid: packageToEdit.bloodChemistry?.bloodUricAcid || "",
          creatinine: packageToEdit.bloodChemistry?.creatinine || "",
          SGOT_AST: packageToEdit.bloodChemistry?.SGOT_AST || "",
          SGPT_ALT: packageToEdit.bloodChemistry?.SGPT_ALT || "",
          totalCholesterol: packageToEdit.bloodChemistry?.totalCholesterol || "",
          triglyceride: packageToEdit.bloodChemistry?.triglyceride || "",
          HDL_cholesterol: packageToEdit.bloodChemistry?.HDL_cholesterol || "",
          LDL_cholesterol: packageToEdit.bloodChemistry?.LDL_cholesterol || "",
        },
        hematology: {
          bleedingTimeClottingTime: packageToEdit.hematology?.bleedingTimeClottingTime || "",
          completeBloodCount: packageToEdit.hematology?.completeBloodCount || "",
          hematocritAndHemoglobin: packageToEdit.hematology?.hematocritAndHemoglobin || "",
        },
        clinicalMicroscopyParasitology: {
          routineUrinalysis: packageToEdit.clinicalMicroscopyParasitology?.routineUrinalysis || "",
          routineStoolExamination: packageToEdit.clinicalMicroscopyParasitology?.routineStoolExamination || "",
          katoThickSmear: packageToEdit.clinicalMicroscopyParasitology?.katoThickSmear || "",
          fecalOccultBloodTest: packageToEdit.clinicalMicroscopyParasitology?.fecalOccultBloodTest || "",
        },
        bloodBankingSerology: {
          antiTreponemaPallidum: packageToEdit.bloodBankingSerology?.antiTreponemaPallidum || "",
          antiHCV: packageToEdit.bloodBankingSerology?.antiHCV || "",
          bloodTyping: packageToEdit.bloodBankingSerology?.bloodTyping || "",
          hepatitisBSurfaceAntigen: packageToEdit.bloodBankingSerology?.hepatitisBSurfaceAntigen || "",
          pregnancyTest: packageToEdit.bloodBankingSerology?.pregnancyTest || "",
          dengueTest: packageToEdit.bloodBankingSerology?.dengueTest || "",
          HIVRapidTest: packageToEdit.bloodBankingSerology?.HIVRapidTest || "",
          HIVElsa: packageToEdit.bloodBankingSerology?.HIVElsa || "",
          testForSalmonellaTyphi: packageToEdit.bloodBankingSerology?.testForSalmonellaTyphi || "",
        },
        microbiology: {
          gramsStain: packageToEdit.microbiology?.gramsStain || "",
          KOH: packageToEdit.microbiology?.KOH || "",
        },
      });
      setNewXrayRecord({
        xrayType: packageToEdit.xrayType || "",
        xrayDescription: packageToEdit.xrayDescription || "",
      });
      setIsPackageModalOpen(true); // Open the modal with preloaded data
    }
  };

  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const handleDeletePackage = async () => {
    try {
      const packageId = packageToDelete; // Use the stored package ID
      console.log("Deleting package with ID:", packageId);
  
      // Send DELETE request to the backend
      const result = await axios.delete(`http://localhost:3001/api/packages/${packageId}`);
      console.log(result);
  
      // Fetch updated list of packages after deletion
      fetchPackages();
      setIsConfirmModalOpen(false);
      setMessage("Package deleted successfully!");
      setTimeout(() => setMessage(""), 3000); // Clear message after timeout
    } catch (err) {
      console.error("Error deleting package:", err);
      setMessage("Error deleting package.");
      setTimeout(() => setMessage(""), 3000);
    }
  };
  
  const handleDeletePackageClick = (packageId) => {
    setPackageToDelete(packageId); // Set package ID to delete
    setIsConfirmModalOpen(true);
  };
  
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/packages");
      const sortedPackages = response.data.sort(
        (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
      );
      setPackages(sortedPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("Failed to fetch packages. Please try again.");
    }
  };

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPackages = filteredPackages.slice(
    indexOfFirstPackage,
    indexOfLastPackage
  );

  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

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

  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

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

  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };


  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
      {message && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
            {message}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Package List</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredPackages.length}
            </span>{" "}
            Packages
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
            <button
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
              onClick={() => setIsPackageModalOpen(true)} // Open modal on click
            >
              Add Package
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
                    <th className="py-3 w-1/4">Description</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPackages.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500"
                      >
                        No packages found.
                      </td>
                    </tr>
                  ) : (
                    currentPackages.map((pkg,index) => (
                      <tr key={pkg._id} className="border-b">
                        <td className="py-4">
                          <p className="font-semibold">{pkg.name}</p>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(pkg.isCreatedAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {pkg.xrayDescription || "No description available"}
                          </p>
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
                                    handleEditPackage(pkg._id); // Pass the patient ID to the edit handler
                                  }}
                                >
                                  <AiOutlineEdit className="mr-2" /> Edit
                                  
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleDeletePackageClick(pkg._id); // Pass the patient ID to the delete handler
                                  }}
                                >
                                  <AiOutlineDelete className="mr-2" /> Delete
                                  
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
                <span className="mr-2">&#9432;</span> Full package list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Packages
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
                  onClick={handleDeletePackage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Laboratory Request Form Modal */}
        {isPackageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-4 px-6 rounded-lg w-full max-w-4xl max-h-[85vh] shadow-lg overflow-y-auto">
              <h2 className="text-lg font-bold mb-6 text-center">Package</h2>

              {/* Package Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  value={addPackage}
                  onChange={(e) => setAddPackage(e.target.value)}
                  className="px-4 py-2 border rounded-md w-full"
                  placeholder="Enter the package name"
                />
              </div>

              {/* Blood Chemistry Section */}
              <div className="mb-6 border rounded-lg p-6 shadow-md bg-gray-50">
                <h3 className="font-semibold text-base mb-3">
                  I. Blood Chemistry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData.bloodChemistry).map((key) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.bloodChemistry[key] !== ""}
                        onChange={() =>
                          handleInputChange("bloodChemistry", key)
                        }
                      />
                      <span>{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hematology Section */}
                <div className="border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-3">
                    II. Hematology
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(formData.hematology).map((key) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.hematology[key] !== ""}
                          onChange={() => handleInputChange("hematology", key)}
                        />
                        <span>{key.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clinical Microscopy & Parasitology */}
                <div className="border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-3">
                    III. Clinical Microscopy & Parasitology
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(formData.clinicalMicroscopyParasitology).map(
                      (key) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.clinicalMicroscopyParasitology[key] !==
                              ""
                            }
                            onChange={() =>
                              handleInputChange(
                                "clinicalMicroscopyParasitology",
                                key
                              )
                            }
                          />
                          <span>{key.replace(/_/g, " ")}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Blood Banking & Serology */}
                <div className="border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-3">
                    IV. Blood Banking & Serology
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(formData.bloodBankingSerology).map((key) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.bloodBankingSerology[key] !== ""}
                          onChange={() =>
                            handleInputChange("bloodBankingSerology", key)
                          }
                        />
                        <span>{key.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Microbiology */}
                <div className="border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-3">
                    V. Microbiology
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(formData.microbiology).map((key) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.microbiology[key] !== ""}
                          onChange={() =>
                            handleInputChange("microbiology", key)
                          }
                        />
                        <span>{key.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* X-ray Section */}
                <div className="md:col-span-2 border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-4">X-ray Type</h3>
                  <select
                    value={newXrayRecord.xrayType}
                    onChange={(e) =>
                      setNewXrayRecord((prev) => ({
                        ...prev,
                        xrayType:
                          e.target.value === "both"
                            ? "medical, dental"
                            : e.target.value,
                      }))
                    }
                    className="border rounded-lg w-full p-2 mb-4"
                  >
                    <option value="" disabled>
                      Select X-ray Type
                    </option>
                    <option value="medical">Medical X-Ray</option>
                    <option value="dental">Dental X-ray</option>
                    <option value="both">Both</option>
                  </select>
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="xrayDescription"
                    value={newXrayRecord.xrayDescription || ""}
                    onChange={(e) =>
                      setNewXrayRecord((prev) => ({
                        ...prev,
                        xrayDescription: e.target.value,
                      }))
                    }
                    className="border rounded-lg w-full p-2 mt-2"
                    placeholder="Enter X-ray description or details"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                  Submit Package
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Package;
