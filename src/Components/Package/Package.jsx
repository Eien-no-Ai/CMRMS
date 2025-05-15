import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import { IoArchiveOutline } from "react-icons/io5";
import { MdRestore } from "react-icons/md";

const Package = () => {
    const [laboratoryTests, setlaboratoryTests] = useState([]);

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageFor, setPackageFor] = useState("");
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  const [newXrayRecord, setNewXrayRecord] = useState({
    xrayType: "",
    xrayDescription: "",
  });
  // X-ray description options based on the selected type
  const medicalDescriptions = [
    "CHEST PA",
    "SKULL",
    "CERVICAL",
    "PANORAMIC",
    "TLV/LSV",
    "PELVIS",
    "UPPER EXTREMITIES",
    "LOWER EXTREMITIES",
  ];

  const dentalDescriptions = [
    "PANORAMIC",
    "LATERAL CEPHALOMETRIC",
    "PERIAPICAL",
    "TMJ",
  ];

  const handleNewXrayChange = (e) => {
    const { name, value } = e.target;
    setNewXrayRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /////////////////////////////////////////////////////////////////////////////

const ANNUAL_REQUIRED_TESTS = [
  { category: "Clinical Microscopy & Parasitology", name: "Urinalysis" },
  { category: "Hematology", name: "Complete Blood Count" },
  { category: "Clinical Microscopy & Parasitology", name: "Fecalysis" },
];

const getAnnualLabTests = (labTestList) => {
  const missingTests = [];

  const matchedTests = ANNUAL_REQUIRED_TESTS.map((required) => {
    const match = labTestList.find(
      (test) =>
        test.category?.trim().toLowerCase() === required.category.toLowerCase() &&
        test.name?.trim().toLowerCase() === required.name.toLowerCase()
    );

    if (!match) {
      missingTests.push(`${required.category} → ${required.name}`);
      return null;
    }

    return {
      category: required.category,
      name: required.name,
      referenceRange: match.referenceRange || "",
      whatShouldBeIncluded: match.whatShouldBeIncluded || [],
    };
  }).filter(Boolean); // Remove null entries

  return { matchedTests, missingTests };
};

  /////////////////////////////////////////////////////////////////////////////

  const [addPackage, setAddPackage] = useState("");
  const [formData, setFormData] = useState({
    // bloodChemistry: {
    //   bloodSugar: "",
    //   bloodUreaNitrogen: "",
    //   bloodUricAcid: "",
    //   creatinine: "",
    //   SGOT_AST: "",
    //   SGPT_ALT: "",
    //   totalCholesterol: "",
    //   triglyceride: "",
    //   HDL_cholesterol: "",
    //   LDL_cholesterol: "",
    // },
    // hematology: {
    //   bleedingTimeClottingTime: "",
    //   completeBloodCount: "",
    //   hematocritAndHemoglobin: "",
    // },
    // clinicalMicroscopyParasitology: {
    //   routineUrinalysis: "",
    //   routineStoolExamination: "",
    //   katoThickSmear: "",
    //   fecalOccultBloodTest: "",
    // },
    // bloodBankingSerology: {
    //   antiTreponemaPallidum: "",
    //   antiHCV: "",
    //   bloodTyping: "",
    //   hepatitisBSurfaceAntigen: "",
    //   pregnancyTest: "",
    //   dengueTest: "",
    //   HIVRapidTest: "",
    //   HIVElsa: "",
    //   testForSalmonellaTyphi: "",
    // },
    // microbiology: {
    //   gramsStain: "",
    //   KOH: "",
    // },
  });
  const [laboratorytests, setLaboratoryTests] = useState([]);

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

  const [packages, setPackages] = useState([]); // State to hold the fetched packages

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/packages`,
          {
            headers: {
              "api-key": api_Key,
            },
          }
        );
        setPackages(response.data); // Set the fetched packages to state
      } catch (error) {
        console.error("Error fetching packages:", error);
        alert("Failed to fetch packages. Please try again.");
      }
    };

    fetchPackages(); // Fetch packages when the component mounts
  }, []);

const handleInputChange = (category, key) => {
  setFormData((prevFormData) => {
    // If the category doesn't exist, initialize it as an empty object
    const currentCategory = prevFormData[category] || {};

    return {
      ...prevFormData,
      [category]: {
        ...currentCategory,
        [key]: currentCategory[key] === "" ? key : "", // Toggle logic
      },
    };
  });
};


  const handleModalClose = () => {
    setIsPackageModalOpen(false);
    // Reset form data on modal close
    // setAddPackage("");
    // setNewXrayRecord({ xrayType: "", xrayDescription: "" }); // Reset the X-ray record as well
  };

const transformFormDataToLabTests = (formData, labTestList = []) => {
  const transformedTests = [];

  for (const [category, tests] of Object.entries(formData || {})) {
    for (const [testName, value] of Object.entries(tests || {})) {
      let referenceRange = "";
      let whatShouldBeIncluded = [];

      const normalizedCategory = category.trim().toLowerCase();
      const normalizedTestName = testName.trim().toLowerCase();

      // Get manual entry (if exists)
      if (typeof value === "object" && value !== null) {
        referenceRange = value.referenceRange || "";
        if (Array.isArray(value.whatShouldBeIncluded) && value.whatShouldBeIncluded.length > 0) {
          whatShouldBeIncluded = value.whatShouldBeIncluded;
        }
      }

      // Get default values from backend
      if (!referenceRange || whatShouldBeIncluded.length === 0) {
        const foundTest = labTestList.find(
          (t) =>
            t.category?.trim().toLowerCase() === normalizedCategory &&
            t.name?.trim().toLowerCase() === normalizedTestName
        );

        if (foundTest) {
          if (!referenceRange) {
            referenceRange = foundTest.referenceRange || "";
          }
          if (
            whatShouldBeIncluded.length === 0 &&
            Array.isArray(foundTest.whatShouldBeIncluded)
          ) {
            whatShouldBeIncluded = foundTest.whatShouldBeIncluded;
          }
        }
      }

      if (category && testName) {
        transformedTests.push({
          category,
          name: testName,
          referenceRange,
          whatShouldBeIncluded,
        });
      }
    }
  }

  return transformedTests;
};

const handleSubmit = async () => {
  try {
    console.log("✅ handleSubmit triggered");

    // Step 1: Fetch the latest lab test list
    const latestTestsResponse = await axios.get(`${apiUrl}/api/laboratorytest-list`, {
      headers: { "api-key": api_Key },
    });
    const latestLabTests = latestTestsResponse.data;
    console.log("📦 Latest lab test list fetched:", latestLabTests);

    let transformedLabTests = [];
    let resolvedPackageFor = packageFor;

    if (addPackage.trim().toLowerCase() === "annual") {
      console.log("📌 Detected 'Annual' package — validating required tests.");

      const { matchedTests, missingTests } = getAnnualLabTests(latestLabTests);

      if (missingTests.length > 0) {
        alert(
          `❌ Cannot create Annual package. The following required lab tests are missing:\n\n- ${missingTests.join(
            "\n- "
          )}`
        );
        console.warn("❌ Missing required annual tests:", missingTests);
        return;
      }

      transformedLabTests = matchedTests;
      resolvedPackageFor = "Employee";

      newXrayRecord.xrayType = "Chest X-ray";
      newXrayRecord.xrayDescription = "Chest X-ray PA View";

      console.log("📸 X-ray data overridden for Annual package:", {
        xrayType: newXrayRecord.xrayType,
        xrayDescription: newXrayRecord.xrayDescription,
      });
    } else {
      console.log("🌀 Non-annual package — using dynamic form data.");
      transformedLabTests = transformFormDataToLabTests(formData, latestLabTests);
    }

    if (transformedLabTests.length === 0) {
      alert("Please select at least one lab test before submitting.");
      return;
    }

    const packageData = {
      name: addPackage,
      packageFor: resolvedPackageFor,
      labTests: transformedLabTests,
      xrayType: newXrayRecord.xrayType,
      xrayDescription:
        newXrayRecord.xrayType === "medical, dental"
          ? `${newXrayRecord.medicalDescription || ""}, ${newXrayRecord.dentalDescription || ""}`
          : newXrayRecord.xrayDescription,
    };

    const response = await axios.post(`${apiUrl}/api/packages`, packageData, {
      headers: { "api-key": api_Key },
    });

    console.log("✅ Package submitted successfully:", response.data);

    setPackages((prev) => [...prev, packageData]);
    setIsPackageModalOpen(false);
    setAddPackage("");
    setPackageFor("");
    setFormData({});
    setNewXrayRecord({
      xrayType: "",
      xrayDescription: "",
      medicalDescription: "",
      dentalDescription: "",
    });

    fetchPackages(); // Refresh package list
  } catch (error) {
    console.error("❌ Error during package submission:", error.response?.data || error.message);
    alert("Failed to create package.");
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
      const response = await axios.get(`${apiUrl}/api/packages`,
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
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
        `${apiUrl}/api/packages/${packageToArchive}`,
        {
          isArchived: true,
        },
        {
          headers: {
            "api-key": api_Key,
          },
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

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [packageToRestore, setPackageToRestore] = useState(null); // Track the package being restored

  // Handle restore modal opening
  const handleOpenRestoreModal = (packageId) => {
    setPackageToRestore(packageId);
    setIsRestoreModalOpen(true);
  };

  // Handle restoring the package
  const handleRestore = async () => {
    if (!packageToRestore) return;

    try {
      const response = await axios.put(
        `${apiUrl}/api/packages/${packageToRestore}`,
        { isArchived: false },
        {
          headers: {
            "api-key": api_Key,
          },
        }
      );
      console.log("Package restored successfully:", response.data);

      // Update the state to reflect the restored package
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg._id === packageToRestore ? { ...pkg, isArchived: false } : pkg
        )
      );

      setIsRestoreModalOpen(false); // Close the modal after restoring
      setPackageToRestore(null); // Reset the package being restored
    } catch (error) {
      console.error("Error restoring package:", error);
      alert("Failed to restore package. Please try again.");
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsRestoreModalOpen(false);
    setPackageToRestore(null);
  };

  //jomilyn
  


const handleClick = (testName) => {
  const test = laboratoryTests?.[testName];

  if (!test) {
    console.warn(`Test "${testName}" not found in laboratoryTests`);
    return;
  }

  // Loop through all fields in the test
  for (const key in test) {
    if (test.hasOwnProperty(key)) {
      const value = test[key];
      console.log(`${key}: ${value}`);
    }
  }

  // OR: do something else with the whole test object
  console.log('Clicked test:', testName, test);
};

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('token'); // adjust this if you store token differently
  
        const response = await axios.get(`${apiUrl}/api/laboratorytest-list`, {
          headers: {
            "api-key": api_Key,
          },
        });
  
        setlaboratoryTests(response.data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
  
    fetchTests();
  }, []);

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
                    <th className="py-3 w-1/4">Lab Tests</th>
                    <th className="py-3 w-1/4">X-Ray</th>{" "}
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

                        {/* New column for displaying all tests with truncation jom*/}
<td
  className={`py-4 ${pkg.isArchived ? "text-gray-400 line-through" : ""}`}
>
  {pkg.labTests && pkg.labTests.length > 0
    ? (() => {
        const names = pkg.labTests.map(test => test.name);
        const concatenated = names.join(", ");
        const truncated = concatenated.slice(0, 30);
        return concatenated.length > 30 ? `${truncated}...` : concatenated;
      })()
    : "No lab tests"}
</td>


                        <td
                          className={`py-4 ${
                            pkg.isArchived ? "text-gray-400 line-through" : ""
                          }`}
                        >
  {pkg.xrayType
    ? `${pkg.xrayType}${pkg.xrayDescription ? " - " + pkg.xrayDescription : ""}`
    : "No X-ray type specified"}
                        </td>
                        <td className="py-4">
                          {!pkg.isArchived && (
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => confirmArchive(pkg._id)}
                            >
                              <IoArchiveOutline size={24} />
                            </button>
                          )}

                          {pkg.isArchived && (
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => handleOpenRestoreModal(pkg._id)}
                            >
                              <MdRestore size={24} />
                            </button>
                          )}
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
              {/* Package For Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Package For
                </label>
                <select
                  value={packageFor}
                  onChange={(e) => setPackageFor(e.target.value)}
                  className="px-4 py-2 border rounded-md w-full"
                >
                  <option value="" disabled>
                    Select package category
                  </option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="OPD">OPD</option>
                </select>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              {/* Package For Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Package For
                </label>
                <select
                  value={packageFor}
                  onChange={(e) => setPackageFor(e.target.value)}
                  className="px-4 py-2 border rounded-md w-full"
                >
                  <option value="" disabled>
                    Select package category
                  </option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="OPD">OPD</option>
                </select>
              </div>

{/* Lab Test Categories */}
<div className="mb-8">
  <h3 className="text-base font-semibold mb-4">Select Laboratory Tests</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {["Blood Chemistry", "Hematology", "Clinical Microscopy & Parasitology", "Blood Banking And Serology"].map((category) => {
      const categoryTests = laboratoryTests.filter(test => test.category === category);
      return (
        <div key={category} className="border rounded-lg p-4 shadow-sm bg-white">
          <h4 className="font-semibold text-sm mb-3 ">{category}</h4>
          <div className="space-y-2 text-sm">
            {categoryTests.map(test => {
              const isChecked = !!formData?.[category]?.[test.name];
              return (
                <label key={test.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleInputChange(category, test.name)}
                    className="accent-custom-red"
                  />
                  <span>{test.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
</div>

                {/* X-ray Section */}
                <div className="md:col-span-3 border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-4">X-ray Type</h3>
                  <select
                    value={newXrayRecord.xrayType}
                    onChange={(e) =>
                      setNewXrayRecord((prev) => ({
                        ...prev,
                        xrayType:
                          e.target.value === "medical, dental"
                            ? "medical, dental"
                            : e.target.value,
                        medicalDescription: "", // Reset descriptions when changing the type
                        dentalDescription: "",
                      }))
                    }
                    className="border rounded-lg w-full p-2 mb-4"
                  >
                    <option value="" disabled>
                      Select X-ray Type
                    </option>
                    <option value="medical">Medical X-Ray</option>
                    <option value="dental">Dental X-ray</option>
                    <option value="medical, dental">Both</option>
                  </select>

                  {/* Show both dropdowns when "both" is selected */}
                  {newXrayRecord.xrayType === "medical, dental" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium">
                          Medical Description
                        </label>
                        <select
                          name="medicalDescription"
                          value={newXrayRecord.medicalDescription}
                          onChange={handleNewXrayChange}
                          required
                          className="border rounded-lg w-full p-2 mt-1"
                        >
                          <option value="" disabled>
                            Select Medical Description
                          </option>
                          {medicalDescriptions.map((description, index) => (
                            <option key={index} value={description}>
                              {description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                          Dental Description
                        </label>
                        <select
                          name="dentalDescription"
                          value={newXrayRecord.dentalDescription}
                          onChange={handleNewXrayChange}
                          required
                          className="border rounded-lg w-full p-2 mt-1"
                        >
                          <option value="" disabled>
                            Select Dental Description
                          </option>
                          {dentalDescriptions.map((description, index) => (
                            <option key={index} value={description}>
                              {description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Show only medical dropdown when medical is selected */}
                  {newXrayRecord.xrayType === "medical" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <select
                        name="xrayDescription"
                        value={newXrayRecord.xrayDescription}
                        onChange={handleNewXrayChange}
                        required
                        className="border rounded-lg w-full p-2 mt-1"
                      >
                        <option value="" disabled>
                          Select Medical Description
                        </option>
                        {medicalDescriptions.map((description, index) => (
                          <option key={index} value={description}>
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Show only dental dropdown when dental is selected */}
                  {newXrayRecord.xrayType === "dental" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <select
                        name="xrayDescription"
                        value={newXrayRecord.xrayDescription}
                        onChange={handleNewXrayChange}
                        required
                        className="border rounded-lg w-full p-2 mt-1"
                      >
                        <option value="" disabled>
                          Select Dental Description
                        </option>
                        {dentalDescriptions.map((description, index) => (
                          <option key={index} value={description}>
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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

                {/* X-ray Section */}
                <div className="md:col-span-3 border rounded-lg p-6 shadow-md bg-gray-50">
                  <h3 className="font-semibold text-base mb-4">X-ray Type</h3>
                  <select
                    value={newXrayRecord.xrayType}
                    onChange={(e) =>
                      setNewXrayRecord((prev) => ({
                        ...prev,
                        xrayType:
                          e.target.value === "medical, dental"
                            ? "medical, dental"
                            : e.target.value,
                        medicalDescription: "", // Reset descriptions when changing the type
                        dentalDescription: "",
                      }))
                    }
                    className="border rounded-lg w-full p-2 mb-4"
                  >
                    <option value="" disabled>
                      Select X-ray Type
                    </option>
                    <option value="medical">Medical X-Ray</option>
                    <option value="dental">Dental X-ray</option>
                    <option value="medical, dental">Both</option>
                  </select>

                  {/* Show both dropdowns when "both" is selected */}
                  {newXrayRecord.xrayType === "medical, dental" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium">
                          Medical Description
                        </label>
                        <select
                          name="medicalDescription"
                          value={newXrayRecord.medicalDescription}
                          onChange={handleNewXrayChange}
                          required
                          className="border rounded-lg w-full p-2 mt-1"
                        >
                          <option value="" disabled>
                            Select Medical Description
                          </option>
                          {medicalDescriptions.map((description, index) => (
                            <option key={index} value={description}>
                              {description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                          Dental Description
                        </label>
                        <select
                          name="dentalDescription"
                          value={newXrayRecord.dentalDescription}
                          onChange={handleNewXrayChange}
                          required
                          className="border rounded-lg w-full p-2 mt-1"
                        >
                          <option value="" disabled>
                            Select Dental Description
                          </option>
                          {dentalDescriptions.map((description, index) => (
                            <option key={index} value={description}>
                              {description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Show only medical dropdown when medical is selected */}
                  {newXrayRecord.xrayType === "medical" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <select
                        name="xrayDescription"
                        value={newXrayRecord.xrayDescription}
                        onChange={handleNewXrayChange}
                        required
                        className="border rounded-lg w-full p-2 mt-1"
                      >
                        <option value="" disabled>
                          Select Medical Description
                        </option>
                        {medicalDescriptions.map((description, index) => (
                          <option key={index} value={description}>
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Show only dental dropdown when dental is selected */}
                  {newXrayRecord.xrayType === "dental" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">
                        Description
                      </label>
                      <select
                        name="xrayDescription"
                        value={newXrayRecord.xrayDescription}
                        onChange={handleNewXrayChange}
                        required
                        className="border rounded-lg w-full p-2 mt-1"
                      >
                        <option value="" disabled>
                          Select Dental Description
                        </option>
                        {dentalDescriptions.map((description, index) => (
                          <option key={index} value={description}>
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
        {isRestoreModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Confirm Restore</h2>
              <p className="mb-6">
                Are you sure you want to restore this package?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-custom-red text-white px-4 py-2 rounded-lg"
                  onClick={handleRestore}
                >
                  Restore
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
