import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import { TbBuildingHospital } from "react-icons/tb";
import { FaXRay } from "react-icons/fa6";
import { SlChemistry } from "react-icons/sl";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { IoFileTrayFullOutline } from "react-icons/io5";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [patients, setPatients] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [records, setRecords] = useState([]);

  // Helper function to calculate time ago
  const calculateTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const now = new Date();
    const createdTime = new Date(timestamp);
    const secondsAgo = Math.floor((now - createdTime) / 1000);

    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    } else {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    }
  };

  const extractRequestedLabTests = (lab) => {
    const tests = [];

    // Blood Chemistry
    for (const [testName, value] of Object.entries(lab.bloodChemistry || {})) {
      if (value) tests.push(formatTestName(testName));
    }

    // Hematology
    for (const [testName, value] of Object.entries(lab.hematology || {})) {
      if (value) tests.push(formatTestName(testName));
    }

    // Clinical Microscopy Parasitology
    for (const [testName, value] of Object.entries(
      lab.clinicalMicroscopyParasitology || {}
    )) {
      if (value) tests.push(formatTestName(testName));
    }

    // Blood Banking Serology
    for (const [testName, value] of Object.entries(
      lab.bloodBankingSerology || {}
    )) {
      if (value) tests.push(formatTestName(testName));
    }

    // Microbiology
    for (const [testName, value] of Object.entries(lab.microbiology || {})) {
      if (value) tests.push(formatTestName(testName));
    }

    return tests;
  };

  const formatTestName = (testName) => {
    // Convert camelCase or snake_case to Regular Format
    return testName
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letter
      .trim();
  };

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        // Fetch the logged-in employee's details to determine their department and role
        const userId = localStorage.getItem("userId");
        const employeeResponse = await axios.get(
          `http://localhost:3001/user/${userId}`
        );
        const { department, role } = employeeResponse.data;
        console.log("Employee Role:", role);
        console.log("Employee Department:", department);
  
        // Fetch all updates (labs, xrays, clinics)
        const [labs, xrays, clinics] = await Promise.all([
          axios.get("http://localhost:3001/api/laboratory"),
          axios.get("http://localhost:3001/api/xrayResults"),
          axios.get("http://localhost:3001/api/clinicalRecords"),
        ]);
  
        let filteredUpdates = [];
  
        if (role === "nurse") {
          // Only display clinics
          filteredUpdates = [
            ...clinics.data
              .filter((clinic) => !clinic.treatments && !clinic.diagnosis)
              .map((clinic) => ({
                type: "Clinic",
                name: `${clinic.patient?.firstname || "Unknown"} ${
                  clinic.patient?.lastname || ""
                }`,
                action: `complaint: ${
                  clinic.complaints || "No complaint provided"
                }`,
                timestamp: new Date(
                  clinic.isCreatedAt || clinic.createdAt || Date.now()
                ),
                time: calculateTimeAgo(
                  clinic.isCreatedAt || clinic.createdAt || Date.now()
                ),
              })),
          ];
        } else if (department === "laboratory") {
          // Only display labs
          filteredUpdates = [
            ...labs.data
              .filter((lab) => lab.labResult === "pending")
              .map((lab) => {
                const testsRequested = extractRequestedLabTests(lab);
                return {
                  type: "Lab",
                  name: `${lab.patient?.firstname || "Unknown"} ${
                    lab.patient?.lastname || ""
                  }`,
                  action: `requested lab work: ${testsRequested.join(", ")}`,
                  timestamp: new Date(
                    lab.isCreatedAt || lab.createdAt || Date.now()
                  ),
                  time: calculateTimeAgo(
                    lab.isCreatedAt || lab.createdAt || Date.now()
                  ),
                };
              }),
          ];
        } else if (department === "xray") {
          // Only display xrays
          filteredUpdates = [
            ...xrays.data
              .filter((xray) => xray.xrayResult === "pending")
              .map((xray) => ({
                type: "X-Ray",
                name: `${xray.patient?.firstname || "Unknown"} ${
                  xray.patient?.lastname || ""
                }`,
                action: `requested an X-ray: ${
                  xray.xrayType || "Unknown Type"
                }`,
                timestamp: new Date(
                  xray.isCreatedAt || xray.createdAt || Date.now()
                ),
                time: calculateTimeAgo(
                  xray.isCreatedAt || xray.createdAt || Date.now()
                ),
              })),
          ];
        } else {
          // Display all (labs, xrays, clinics)
          const labUpdates = labs.data
            .filter((lab) => lab.labResult === "pending")
            .map((lab) => {
              const testsRequested = extractRequestedLabTests(lab);
              return {
                type: "Lab",
                name: `${lab.patient?.firstname || "Unknown"} ${
                  lab.patient?.lastname || ""
                }`,
                action: `requested lab work: ${testsRequested.join(", ")}`,
                timestamp: new Date(
                  lab.isCreatedAt || lab.createdAt || Date.now()
                ),
                time: calculateTimeAgo(
                  lab.isCreatedAt || lab.createdAt || Date.now()
                ),
              };
            });
  
          const xrayUpdates = xrays.data
            .filter((xray) => xray.xrayResult === "pending")
            .map((xray) => ({
              type: "X-Ray",
              name: `${xray.patient?.firstname || "Unknown"} ${
                xray.patient?.lastname || ""
              }`,
              action: `requested an X-ray: ${xray.xrayType || "Unknown Type"}`,
              timestamp: new Date(
                xray.isCreatedAt || xray.createdAt || Date.now()
              ),
              time: calculateTimeAgo(
                xray.isCreatedAt || xray.createdAt || Date.now()
              ),
            }));
  
          const clinicUpdates = clinics.data
            .filter((clinic) => !clinic.treatments && !clinic.diagnosis)
            .map((clinic) => ({
              type: "Clinic",
              name: `${clinic.patient?.firstname || "Unknown"} ${
                clinic.patient?.lastname || ""
              }`,
              action: `complaint: ${
                clinic.complaints || "No complaint provided"
              }`,
              timestamp: new Date(
                clinic.isCreatedAt || clinic.createdAt || Date.now()
              ),
              time: calculateTimeAgo(
                clinic.isCreatedAt || clinic.createdAt || Date.now()
              ),
            }));
  
          filteredUpdates = [...labUpdates, ...xrayUpdates, ...clinicUpdates];
        }
  
        console.log("Filtered Updates:", filteredUpdates);
  
        // Sort updates by timestamp (most recent first)
        filteredUpdates.sort((a, b) => b.timestamp - a.timestamp);
  
        setUpdates(filteredUpdates);
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    };
  
    fetchUpdates();
  }, []);

  useEffect(() => {
    // Fetch the user data when the component is mounted
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:3001/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setUserRole(data.role);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const fetchPatients = () => {
    axios
      .get("http://localhost:3001/patients")
      .then((response) => {
        const sortedPatients = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 15);
        setPatients(sortedPatients);
      })
      .catch((error) => {
        console.error("There was an error fetching the patients!", error);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const roleRecordMapping = {
      nurse: ["Clinical Records"],
      doctor: ["Clinical Records", "Laboratory Records", "X-Ray Records"],
      pathologist: ["Laboratory Records"],
      "junior medtech": ["Laboratory Records"],
      "senior medtech": ["Laboratory Records"],
      "radiologic technologist": ["X-Ray Records"],
      radiologist: ["X-Ray Records"],
      dentist: ["X-Ray Records"],
      "special trainee": ["Physical Therapy Records"],
      "physical therapist": ["Physical Therapy Records"],
    };

    // Check if the userRole exists in the mapping and get the records it can access
    const userRecords = roleRecordMapping[userRole] || [];

    setRecords(userRecords);
  }, [userRole]);

  // Check if the user role is 'user' and display the message
  if (userRole === "user") {
    return (
      <div>
        <Navbar />
        <div className="p-6 pt-20 bg-gray-100 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex justify-center">
            <p className="text-gray-700 flex items-center">
              <span className="mr-2">&#9432;</span> Please proceed to Management
              Information Systems (MIS) for assigning of roles.
            </p>
          </div>
          <div className="flex justify-center mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div
              className={`${
                records.length === 1 ? "grid-cols-4" : "grid-cols-3"
              } grid gap-6`}
            >
              {records.length === 1 ? (
                <div className="col-span-4">
                  {records.includes("Clinical Records") && (
                    <a
                      href="/clinic/records" // Link to Clinical Records page
                      className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                    >
                      <TbBuildingHospital
                        size={40}
                        className="text-gray-500 mb-2"
                      />
                      <span className="font-semibold text-custom-red">
                        CLINICAL RECORDS
                      </span>
                    </a>
                  )}
                  {records.includes("Laboratory Records") && (
                    <div className="grid grid-cols-3 gap-6">
                      <a
                        href="/laboratory/records"
                        className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                      >
                        <IoFileTrayFullOutline
                          size={40}
                          className="text-gray-500 mb-2"
                        />
                        <span className="font-semibold text-custom-red">
                          LAB RECORDS
                        </span>
                      </a>
                      <a
                        href={
                          userRole === "pathologist"
                            ? "/laboratory/verification/pathologist"
                            : "/laboratory/verification"
                        }
                        onClick={(e) => {
                          if (
                            userRole !== "senior medtech" &&
                            userRole !== "pathologist"
                          ) {
                            e.preventDefault();
                            alert(
                              "You do not have permission to verify laboratory tests."
                            );
                          }
                        }}
                        className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                      >
                        <MdOutlineVerifiedUser
                          size={40}
                          className="text-gray-500 mb-2"
                        />
                        <span className="font-semibold text-custom-red">
                          LAB VERIFICATION
                        </span>
                      </a>
                      <a
                        href="/laboratory/requests"
                        className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                      >
                        <SlChemistry size={40} className="text-gray-500 mb-2" />
                        <span className="font-semibold text-custom-red">
                          LAB REQUESTS
                        </span>
                      </a>
                    </div>
                  )}

                  {records.includes("X-Ray Records") && (
                    <div className="grid grid-cols-2 gap-6">
                      <a
                        href="/xray/records" // Link to X-Ray Records page
                        className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                      >
                        <IoFileTrayFullOutline
                          size={40}
                          className="text-gray-500 mb-2"
                        />
                        <span className="font-semibold text-custom-red">
                          X-RAY RECORDS
                        </span>
                      </a>
                      <a
                        href="/xray/requests" // Link to X-Ray Requests page
                        className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                      >
                        <FaXRay size={40} className="text-gray-500 mb-2" />
                        <span className="font-semibold text-custom-red">
                          X-RAY REQUESTS
                        </span>
                      </a>
                    </div>
                  )}
                  {records.includes("Physical Therapy Records") && (
                    <a
                      href="/physicaltherapy/records" // Link to Physical Therapy Records page
                      className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105 hover:shadow-lg"
                    >
                      <FaXRay size={40} className="text-gray-500 mb-2" />
                      <span className="font-semibold text-custom-red">
                        PHYSICAL THERAPY RECORDS
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                records.map((record, index) => (
                  <Link
                    key={index}
                    to={
                      record === "Clinical Records"
                        ? "/clinic/records"
                        : record === "Laboratory Records"
                        ? "/laboratory/records"
                        : record === "X-Ray Records"
                        ? "/xray/records"
                        : "#"
                    }
                    className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end mb-1 transition-transform transform hover:scale-105"
                  >
                    {record === "Clinical Records" && (
                      <>
                        <TbBuildingHospital
                          size={40}
                          className="text-gray-500 mb-2"
                        />
                        <span className="font-semibold text-custom-red">
                          CLINICAL RECORDS
                        </span>
                      </>
                    )}
                    {record === "Laboratory Records" && (
                      <>
                        <SlChemistry size={40} className="text-gray-500 mb-2" />
                        <span className="font-semibold text-custom-red">
                          LABORATORY RECORDS
                        </span>
                      </>
                    )}
                    {record === "X-Ray Records" && (
                      <>
                        <FaXRay size={40} className="text-gray-500 mb-2" />
                        <span className="font-semibold text-custom-red">
                          X-RAY RECORDS
                        </span>
                      </>
                    )}
                    {record === "Physical Therapy Records" && (
                      <>
                        <FaXRay size={40} className="text-gray-500 mb-2" />
                        <span className="font-semibold text-custom-red">
                          PHYSICAL THERAPY RECORDS
                        </span>
                      </>
                    )}
                  </Link>
                ))
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none"
                  />
                  <BiSearch
                    className="absolute right-2 top-2 text-gray-400"
                    size={24}
                  />
                </div>
              </div>

              <div className="overflow-x-auto h-96">
                <div className="min-w-full">
                  <div className="flex justify-between items-center py-2 border-b font-semibold text-gray-700 sticky top-0 bg-white z-10">
                    <div className="w-1/5 flex items-center">
                      <span>Patient Name</span>
                    </div>
                    <span className="w-1/5">Birthdate</span>
                    <span className="w-1/5">Address</span>
                    <span className="w-1/5">ID Number</span>
                  </div>
                  {patients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-4 border-b"
                    >
                      <div className="w-1/5 flex items-center space-x-4">
                        <span className="font-medium">
                          {patient.lastname}, {patient.firstname}
                        </span>
                      </div>
                      <span className="w-1/5">
                        {new Date(patient.birthdate).toLocaleDateString()}
                      </span>
                      <span className="w-1/5">
                        {patient.address}, {patient.city}
                      </span>
                      <span className="w-1/5">{patient.idnumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Updates</h2>
            {/* Updates content with a fixed height and scroll */}
            <div className="space-y-6 flex-grow overflow-y-auto h-96">
              {updates.map((update, index) => (
                <div key={index} className="flex items-center">
                  <img
                    src={`https://via.placeholder.com/50?text=${update.type}`}
                    alt="update"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{update.name}</span>{" "}
                      {update.action}
                    </p>
                    <p className="text-gray-500 text-xs">{update.time}</p>
                  </div>
                </div>
              ))}
              {updates.length === 0 && (
                <p className="text-gray-500 text-sm">No recent updates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
