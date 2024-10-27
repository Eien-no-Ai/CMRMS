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
  const [updates, setUpdates] = useState([
    {
      name: "Andrew Thomas",
      action: "has ordered Apple smart watch 2500mh battery.",
      time: "25 seconds ago",
      image: "https://via.placeholder.com/50",
    },
    {
      name: "James Bond",
      action: "has received Samsung gadget for charging battery.",
      time: "30 minutes ago",
      image: "https://via.placeholder.com/50",
    },
    {
      name: "Iron Man",
      action: "has ordered Apple smart watch, samsung Gear 2500mh battery.",
      time: "2 hours ago",
      image: "https://via.placeholder.com/50",
    },
  ]);

  const [records, setRecords] = useState([]);

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
        const sortedPatients = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
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
                        href="/laboratory/verification"
                        onClick={(e) => {
                          if (userRole !== "senior medtech" && userRole !== "pathologist") {
                            e.preventDefault();
                            alert("You do not have permission to verify laboratory tests.");
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
                        <img
                          src="https://via.placeholder.com/50"
                          alt="patient"
                          className="rounded-full"
                        />
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

          <div className="col-span-1 h-full">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-4">Updates</h2>
              <div className="space-y-6 flex-grow">
                {updates.map((update, index) => (
                  <div key={index} className="flex items-center">
                    <img
                      src={update.image}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
