import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import { IoArchiveOutline } from "react-icons/io5";

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

  const handleSubmit = async () => {
    try {
      // Prepare the data to send to the backend
      const packageData = {
        name: addPackage,
        ...formData, // Spread the formData object directly
        xrayType: newXrayRecord.xrayType,
        xrayDescription: newXrayRecord.xrayDescription, // Add xrayDescription here
      };

      // Send POST request to the API
      const response = await axios.post(
        "http://localhost:3001/api/packages",
        packageData
      );

      console.log("Package created successfully:", response.data);
      setPackages((prevPackages) => [...prevPackages, response.data]); // Update packages state with the new package
      setIsPackageModalOpen(false); // Close the modal after submission

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
      alert("Failed to create package. Please try again.");
    }
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [packageToArchive, setPackageToArchive] = useState(null); // Store the package ID to archive

  // Open the confirmation modal
  const confirmArchive = (packageId) => {
    setPackageToArchive(packageId); // Set the package ID to archive
    setShowConfirmModal(true); // Show the confirmation modal
  };

  // Handle archive action
  const handleArchive = async () => {
    if (!packageToArchive) return;

    try {
      await axios.put(
        `http://localhost:3001/api/packages/${packageToArchive}`,
        {
          isArchived: true,
        }
      );

      // Update the package list
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg._id === packageToArchive ? { ...pkg, isArchived: true } : pkg
        )
      );
      setShowConfirmModal(false); // Close the modal
      setPackageToArchive(null); // Clear the package to archive
    } catch (error) {
      console.error("Error archiving package:", error);
      alert("Failed to archive package. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
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
                    currentPackages.map((pkg) => (
                      <tr key={pkg._id} className="border-b">
                        <td
                          className={`py-4 ${
                            pkg.isArchived ? "text-gray-400 line-through" : ""
                          }`}
                        >
                          <p className="font-semibold">{pkg.name}</p>
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(pkg.isCreatedAt).toLocaleString()}
                          </p>
                        </td>
                        <td
                          className={`py-4 ${
                            pkg.isArchived ? "text-gray-400 line-through" : ""
                          }`}
                        >
                          <p className="font-semibold">
                            {pkg.xrayDescription || "No description available"}
                          </p>
                        </td>
                        <td className="py-4">
                          <button
                            className={`text-gray-500 hover:text-gray-700 ${
                              pkg.isArchived
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                            onClick={() => confirmArchive(pkg._id)}
                            disabled={pkg.isArchived}
                          >
                            <IoArchiveOutline size={24} />
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
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Confirm Archive</h2>
              <p className="mb-6">
                Are you sure you want to archive this package?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-custom-red text-white px-4 py-2 rounded-lg"
                  onClick={handleArchive}
                >
                  Archive
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
