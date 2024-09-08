import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";

const clinicalrecords = [
  {
    date: "12 Dec '19",
    complaints: "Headache",
    treatment: "Paracetamol",
    diagnosis: "Headache",
  },
  {
    date: "12 Dec '19",
    complaints: "Headache",
    treatment: "Paracetamol",
    diagnosis: "Headache",
  },
  {
    date: "12 Dec '19",
    complaints: "Headache",
    treatment: "Paracetamol",
    diagnosis: "Headache",
  },
];

const laboratoryRecords = [
  {
    date: "16 Jul '24",
    test: "Createnine",
    status: "pending",
  },
  {
    date: "21 Jul '24",
    test: "Blood Typing",
    status: "done",
  },
];

function PatientsProfile() {
  const [selectedTab, setSelectedTab] = useState("clinical");

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const displayedRecords =
    selectedTab === "clinical" ? clinicalrecords : laboratoryRecords;

  return (
    <div>
      <Navbar />

      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient Profile</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="text-center">
                <img
                  src="https://scontent.fcrk4-1.fna.fbcdn.net/v/t39.30808-6/456586001_2803226679827926_8516965841580877388_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=uZaQBiQ9pDsQ7kNvgEplSfn&_nc_ht=scontent.fcrk4-1.fna&_nc_gid=AhoI5F7qvo2ToJqUHTtVEAu&oh=00_AYBo9EIORac0VeeyLuTwIcraEMqToJB2FM6xIWt-OrCnsA&oe=66E050CD"
                  alt="Diane Cooper"
                  className="mx-auto h-20 w-20 rounded-full"
                />
                <h2 className="mt-4 text-xl font-semibold">Anthony Villalon</h2>
                <p className="text-gray-500">20214098@s.ubaguio.edu</p>
                <div className="flex justify-center mt-2 space-x-6">
                  <div>
                    <p className="text-gray-700 text-lg font-semibold">15</p>
                    <p className="text-gray-500">Clinical</p>
                  </div>
                  <div>
                    <p className="text-gray-700 text-lg font-semibold">2</p>
                    <p className="text-gray-500">Laboratory</p>
                  </div>
                  <div>
                    <p className="text-gray-700 text-lg font-semibold">2</p>
                    <p className="text-gray-500">X-ray</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="mt-4 flex-1 bg-custom-red text-white p-2 rounded-lg">
                    New Record
                  </button>
                  <button className="mt-4 flex-1 bg-custom-red text-white p-2 rounded-lg">
                    Lab Request
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-semibold">Male</p>
                </div>
                <div>
                  <p className="text-gray-500">Birthday</p>
                  <p className="font-semibold">Mar 09, 2003</p>
                </div>
                <div>
                  <p className="text-gray-500">Street Address</p>
                  <p className="font-semibold">New Lucban</p>
                </div>
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-semibold">Baguio City</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-semibold">(239) 555-0108</p>
                </div>
                <div>
                  <p className="text-gray-500">ZIP Code</p>
                  <p className="font-semibold">2600</p>
                </div>
                <div>
                  <p className="text-gray-500">ID Number</p>
                  <p className="font-semibold">20214098</p>
                </div>
                <div>
                  <p className="text-gray-500">Emergency Contact</p>
                  <p className="font-semibold">09469889843</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Notes</h2>
            </div>
            <ul className="mt-4 text-gray-500 space-y-2">
              <li>- This patient is lorem ipsum dolor sit amet</li>
              <li>- Lorem ipsum dolor sit amet</li>
              <li>- Has allergic history with Cataflam</li>
            </ul>
            <button className="mt-4 w-full bg-custom-red text-white p-2 rounded-lg">
              Add Note
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  className={`${
                    selectedTab === "clinical"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("clinical")}
                >
                  Clinical Records
                </button>
                <button
                  className={`${
                    selectedTab === "laboratory"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("laboratory")}
                >
                  Laboratory Records
                </button>
              </div>
            </div>
            <div className="mt-4">
              <ul className="space-y-4">
                {selectedTab === "clinical" &&
                  displayedRecords.map((records, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                    >
                      <div>
                        <p className="text-gray-500 text-sm">{records.date}</p>
                        <p className="font-semibold">{records.complaints}</p>
                      </div>
                      <div className="text-gray-500">{records.treatment}</div>
                      <div className="text-gray-500">{records.diagnosis}</div>
                      <button className="text-custom-red">Edit</button>
                    </li>
                  ))}
                {selectedTab === "laboratory" &&
                  displayedRecords.map((records, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                    >
                      <div>
                        <p className="text-gray-500 text-sm">{records.date}</p>
                        <p className="font-semibold">{records.test}</p>
                      </div>
                      <div className="text-gray-500">{records.status}</div>
                      <button className="text-custom-red">Edit</button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientsProfile;
