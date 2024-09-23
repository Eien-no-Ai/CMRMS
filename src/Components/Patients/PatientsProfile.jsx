import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";

const clinicalRecords = [
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
  { date: "16 Jul '24", test: "Creatinine", status: "pending" },
  { date: "21 Jul '24", test: "Blood Typing", status: "done" },
];

const xrayRecords = [
  { date: "10 Jan '23", xrayType: "Chest X-ray", result: "Normal" },
  { date: "15 Mar '23", xrayType: "Dental X-ray", result: "Cavity detected" },
];

function PatientsProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [selectedTab, setSelectedTab] = useState("clinical");
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/patients/${id}`
        );
        setPatient(response.data);
      } catch (error) {
        console.error(
          "There was an error fetching the patient details!",
          error
        );
      }
    };
    fetchPatient();
  }, [id]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleMakeRequest = () => {
    setShowRequestOptions((prev) => !prev);
  };

  const handleModalOpen = () => {
    setIsLabModalOpen(true);
  };

  const handleModalClose = () => {
    setIsLabModalOpen(false);
  };

  const displayedRecords =
    selectedTab === "clinical"
      ? clinicalRecords
      : selectedTab === "laboratory"
      ? laboratoryRecords
      : xrayRecords;

  return (
    <div>
      <Navbar />

      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Patient Profile</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {patient && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="text-center">
                    <img
                      src="https://scontent.fcrk4-1.fna.fbcdn.net/v/t39.30808-6/456586001_2803226679827926_8516965841580877388_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=uZaQBiQ9pDsQ7kNvgEplSfn&_nc_ht=scontent.fcrk4-1.fna&_nc_gid=AhoI5F7qvo2ToJqUHTtVEAu&oh=00_AYBo9EIORac0VeeyLuTwIcraEMqToJB2FM6xIWt-OrCnsA&oe=66E050CD"
                      alt="Diane Cooper"
                      className="mx-auto h-20 w-20 rounded-full"
                    />
                    <h2 className="mt-4 text-xl font-semibold">
                      {patient.firstname} {patient.lastname}
                    </h2>
                    <p className="text-gray-500">{patient.email}</p>
                    <div className="flex justify-center mt-2 space-x-6">
                      <div>
                        <p className="text-gray-700 text-lg font-semibold">
                          15
                        </p>
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

                    <div className="grid grid-cols-2 gap-4">
                      <button className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full">
                        New Record
                      </button>
                      <div className="relative">
                        <button
                          className="mt-4 bg-custom-red text-white py-2 px-4 rounded-lg w-full"
                          onClick={handleMakeRequest}
                        >
                          Make a Request
                        </button>
                        {/* Request options */}
                        {showRequestOptions && (
                          <div className="absolute mt-2 bg-white border rounded-lg shadow-lg">
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={handleModalOpen} // Open modal here
                            >
                              Laboratory
                            </button>
                            <button
                              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={() => alert("X-ray request made")}
                            >
                              X-ray
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-semibold">{patient.sex}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birthday</p>
                      <p className="font-semibold">
                        {new Date(patient.birthdate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Street Address</p>
                      <p className="font-semibold">{patient.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">City</p>
                      <p className="font-semibold">{patient.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone Number</p>
                      <p className="font-semibold">{patient.phonenumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ZIP Code</p>
                      <p className="font-semibold">{patient.postalcode}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-semibold">{patient.idnumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emergency Contact</p>
                      <p className="font-semibold">
                        {patient.emergencycontact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
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
                <button
                  className={`${
                    selectedTab === "xray"
                      ? "text-custom-red font-semibold"
                      : ""
                  }`}
                  onClick={() => handleTabChange("xray")}
                >
                  X-ray Records
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
                {selectedTab === "xray" &&
                  displayedRecords.map((records, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
                    >
                      <div>
                        <p className="text-gray-500 text-sm">{records.date}</p>
                        <p className="font-semibold">{records.xrayType}</p>
                      </div>
                      <div className="text-gray-500">{records.result}</div>
                      <button className="text-custom-red">Edit</button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isLabModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-2 px-2 md:px-6 lg:px-8 rounded-lg w-full max-w-4xl max-h-[82vh] shadow-lg overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">
              Laboratory Request Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* I. Blood Chemistry */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  I. Blood Chemistry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input type="checkbox" /> Blood Sugar (Fasting / Random)
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Blood Urea Nitrogen
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Blood Uric Acid
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Creatinine
                  </label>
                  <label className="block">
                    <input type="checkbox" /> SGOT / AST
                  </label>
                  <label className="block">
                    <input type="checkbox" /> SGPT / ALT
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Total Cholesterol
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Triglyceride
                  </label>
                  <label className="block">
                    <input type="checkbox" /> HDL Cholesterol
                  </label>
                  <label className="block">
                    <input type="checkbox" /> LDL Cholesterol
                  </label>
                </div>
              </div>

              {/* II. Hematology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">II. Hematology</h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input type="checkbox" /> Bleeding Time & Clotting Time
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Complete Blood Count with Platelet
                    Count
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Hematocrit and Hemoglobin
                  </label>
                </div>
              </div>

              {/* III. Clinical Microscopy & Parasitology */}
              <div className="border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  III. Clinical Microscopy & Parasitology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input type="checkbox" /> Routine Urinalysis
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Routine Stool Examination
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Kato Thick Smear
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Fecal Occult Blood Test
                  </label>
                </div>
              </div>

              {/* IV. Blood Banking And Serology */}
              <div className="md:col-span-2 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  IV. Blood Banking And Serology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <label className="block">
                    <input type="checkbox" /> Anti-Treponema Pallidum
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Anti-HCV
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Blood Typing (ABO & Rh Grouping)
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Hepatitis B Surface Antigen
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Pregnancy Test (Plasma/Serum)
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Dengue Test
                  </label>
                  <label className="block">
                    <input type="checkbox" /> HIV Rapid Test Kit
                  </label>
                  <label className="block">
                    <input type="checkbox" /> HIV ELISA
                  </label>
                  <label className="block">
                    <input type="checkbox" /> Test for Salmonella typhi
                  </label>
                </div>
              </div>

              {/* V. Blood Banking And Serology */}
              <div className="md:col-span-3 border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col">
                <h3 className="font-semibold text-base mb-3">
                  V. Blood Banking And Serology
                </h3>
                <div className="space-y-2 text-sm">
                  <label className="block">
                    <input type="checkbox" /> Gram's Stain
                  </label>
                  <label className="block">
                    <input type="checkbox" /> KOH
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-white hover:text-gray-500 hover:gray-500 hover:border-gray-500 border transition duration-200"
                onClick={handleModalClose}
              >
                Cancel
              </button>

              <button className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientsProfile;
