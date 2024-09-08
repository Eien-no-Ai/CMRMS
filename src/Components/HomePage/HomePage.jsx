import React from "react";
import { FaHtml5, FaAndroid } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";

const Dashboard = () => {
  const patients = [
    {
      lastname: "Abejar",
      firstname: "Juan Ambilan",
      birthdate: "02/15/1984",
      birthplace: "Baguio City",
      idnumber: "19951245",
    },
    {
      lastname: "Villalon",
      firstname: "Anthony",
      birthdate: "03/09/2003",
      birthplace: "Baguio City",
      idnumber: "20214098",
    },
    {
      lastname: "Delos Santos",
      firstname: "Jayson",
      birthdate: "07/15/2002",
      birthplace: "Baguio City",
      idnumber: "20214556",
    },
  ];

  const updates = [
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
  ];

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end">
                <FaHtml5 size={40} className="text-gray-500 mb-2" />
                <span className="font-semibold text-custom-red">CLINICAL RECORDS</span>
              </div>
              <div className="h-48 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-end">
                <FaAndroid size={40} className="text-gray-500 mb-2" />
                <span className="font-semibold text-custom-red">LABORATORY RECORDS</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
                <div className="relative w-72">
                  {" "}
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

              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="flex justify-between items-center py-2 border-b font-semibold text-gray-700">
                    <div className="w-1/5 flex items-center">
                      <span>Patient Name</span>
                    </div>
                    <span className="w-1/5">Birthdate</span>
                    <span className="w-1/5">Birthplace</span>
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
                      <span className="w-1/5">{patient.birthdate}</span>
                      <span className="w-1/5">{patient.birthplace}</span>
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
