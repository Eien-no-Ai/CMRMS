import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { BiSearch } from "react-icons/bi";
import axios from "axios";

const Package = () => {
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newXrayRecord, setNewXrayRecord] = useState({
    xrayType: "",
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
    setNewXrayRecord({ xrayType: "" }); // Reset the X-ray record as well
  };

  const handleSubmit = async () => {
    try {
      // Prepare the data to send to the backend
      const packageData = {
        name: addPackage,
        ...formData, // Spread the formData object directly
        xrayType: newXrayRecord.xrayType,
      };

      // Send POST request to the API
      const response = await axios.post("http://localhost:3001/api/packages", packageData);

      console.log("Package created successfully:", response.data);
      setPackages((prevPackages) => [...prevPackages, response.data]); // Update packages state with the new package
      setIsPackageModalOpen(false); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting package:", error);
      alert("Failed to create package. Please try again.");
    }
  };

  // Function to render the lab tests for each category
  const renderLabTests = (category, tests) => (
    <>
      <p className="font-semibold">{category}</p>
      {Object.entries(tests).map(([testName, testValue]) => (
        <p key={testName}>{testValue}</p> // Display each test value
      ))}
    </>
  );

const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedPackage, setSelectedPackage] = useState(null);

// Function to open the modal with selected package
const handlePackageClick = (pkg) => {
  setSelectedPackage(pkg);
  setIsModalOpen(true);
};

// Function to close the modal
const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedPackage(null);
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
            <span className="font-bold text-4xl text-custom-red">{packages.length}</span>{" "}
            Packages
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
              className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
              onClick={() => setIsPackageModalOpen(true)} // Open modal on click
            >
              Add Package
            </button>
          </div>
        </div>

         {/* Display the list of packages */}
         {isModalOpen && selectedPackage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">{selectedPackage.name}</h2>
                {renderLabTests("Blood Chemistry", selectedPackage.bloodChemistry)}
                {renderLabTests("Hematology", selectedPackage.hematology)}
                {renderLabTests("Clinical Microscopy & Parasitology", selectedPackage.clinicalMicroscopyParasitology)}
                {renderLabTests("Blood Banking & Serology", selectedPackage.bloodBankingSerology)}
                {renderLabTests("Microbiology", selectedPackage.microbiology)}
                <p className="font-semibold">X-ray</p>
                <p>{selectedPackage.xrayType}</p>
                <button
                  className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg p-4">
            {packages.map((pkg) => (
              <div key={pkg._id} className="border-b last:border-b-0 py-2">
                <h3 
                  className="font-semibold text-blue-500 cursor-pointer"
                  onClick={() => handlePackageClick(pkg)}
                >
                {pkg.name}
                </h3>
              </div>
            ))}
          </div>


        {/* Laboratory Request Form Modal */}
        {isPackageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 text-center">Package</h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  value={addPackage}
                  onChange={(e) => setAddPackage(e.target.value)} // Update package name on change
                  className="px-4 py-2 border rounded-md w-full"
                  placeholder="Enter the package name"
                />
              </div>

              <h2 className="text-lg font-bold mb-4 text-center">Laboratory Services</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* I. Blood Chemistry */}
                <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">I. Blood Chemistry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {Object.keys(formData.bloodChemistry).map((key) => (
                      <label className="block" key={key}>
                        <input
                          type="checkbox"
                          checked={formData.bloodChemistry[key] !== ""}
                          onChange={() => handleInputChange("bloodChemistry", key)}
                        />{" "}
                        {key.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {/* II. Hematology */}
                <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">II. Hematology</h3>
                  <div className="space-y-2 text-sm">
                    {Object.keys(formData.hematology).map((key) => (
                      <label className="block" key={key}>
                        <input
                          type="checkbox"
                          checked={formData.hematology[key] !== ""}
                          onChange={() => handleInputChange("hematology", key)}
                        />{" "}
                        {key.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {/* III. Clinical Microscopy & Parasitology */}
                <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">III. Clinical Microscopy & Parasitology</h3>
                  <div className="space-y-2 text-sm">
                    {Object.keys(formData.clinicalMicroscopyParasitology).map((key) => (
                      <label className="block" key={key}>
                        <input
                          type="checkbox"
                          checked={formData.clinicalMicroscopyParasitology[key] !== ""}
                          onChange={() => handleInputChange("clinicalMicroscopyParasitology", key)}
                        />{" "}
                        {key.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {/* IV. Blood Banking & Serology */}
                <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">IV. Blood Banking & Serology</h3>
                  <div className="space-y-2 text-sm">
                    {Object.keys(formData.bloodBankingSerology).map((key) => (
                      <label className="block" key={key}>
                        <input
                          type="checkbox"
                          checked={formData.bloodBankingSerology[key] !== ""}
                          onChange={() => handleInputChange("bloodBankingSerology", key)}
                        />{" "}
                        {key.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {/* V. Microbiology */}
                <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">V. Microbiology</h3>
                  <div className="space-y-2 text-sm">
                    {Object.keys(formData.microbiology).map((key) => (
                      <label className="block" key={key}>
                        <input
                          type="checkbox"
                          checked={formData.microbiology[key] !== ""}
                          onChange={() => handleInputChange("microbiology", key)}
                        />{" "}
                        {key.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {/* X-ray Section */}
                <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                  <h3 className="font-semibold text-base mb-3">X-ray Type</h3>
                  <select
                    value={newXrayRecord.xrayType}
                    onChange={(e) => setNewXrayRecord({ xrayType: e.target.value })}
                    className="px-4 py-2 border rounded-md w-full"
                  >
                    <option value="">Select X-ray Type</option>
                    <option value="Panoramic">Panoramic</option>
                    <option value="Chest">Chest</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md border border-transparent hover:bg-white hover:text-custom-red hover:border-custom-red"
                  onClick={handleSubmit} // Call submit function on click
                >
                  Submit Package
                </button>
                <button
                  className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                  onClick={handleModalClose} // Close modal without submitting
                >
                  Cancel
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
