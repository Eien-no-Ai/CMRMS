import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";

function Laboratory() {
  const [labRecords, setLabRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const labRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showFullList, setShowFullList] = useState(false);

  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get("http://localhost:3001/api/laboratory") 
      .then((response) => {
        setLabRecords(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

  const indexOfLastRecord = currentPage * labRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - labRecordsPerPage;

  const filteredLabRecords = labRecords.filter((record) => {
    if (record.patient && record.patient.firstname && record.patient.lastname) {
      return (
        record.patient.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patient.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber.includes(searchQuery)
      );
    }
    return false;
  });

  const currentLabRecords = filteredLabRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredLabRecords.length / labRecordsPerPage);

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
          <h1 className="text-3xl font-semibold">Laboratory Requests</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredLabRecords.length}
            </span>{" "}
            requests
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
          </div>
        </div>

        {searchQuery || showFullList ? (
          <div>
            <div className="bg-white p-6 py-1 rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                  <th className="py-3 w-1/4">Patient Info</th>
                <th className="py-3 w-1/4">Blood Chemistry</th>
                <th className="py-3 w-1/4">Hematology</th>
                <th className="py-3 w-1/4">Microscopy/Parasitology</th>
                  <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
              {currentLabRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No lab records found.
                  </td>
                </tr>
              ) : (
                currentLabRecords.map((record) => (
                  <tr key={record._id} className="border-b">
                    <td className="py-4">
                      {record.patient ? (
                        <>
                          <p className="font-semibold">
                            {record.patient.lastname}, {record.patient.firstname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.patient.email}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No patient data</p>
                      )}
                    </td>
                    <td className="py-4">
                      <p>{record.bloodChemistry.bloodSugar}</p>
                      <p>{record.bloodChemistry.bloodUreaNitrogen}</p>
                      {/* <p>{record.bloodChemistry.bloodUricAcid}</p>
                      <p>{record.bloodChemistry.creatinine}</p>
                      <p>{record.bloodChemistry.SGOT_AST}</p>
                      <p>{record.bloodChemistry.SGPT_ALT}</p>
                      <p>{record.bloodChemistry.totalCholesterol}</p>
                      <p>{record.bloodChemistry.triglyceride}</p>
                      <p>{record.bloodChemistry.triglyceride}</p>
                      <p>{record.bloodChemistry.LDL_cholesterol}</p> */}
                    </td>
                    <td className="py-4">
                      <p>{record.hematology.completeBloodCount}</p>
                    </td>
                    <td className="py-4">
                      <p>{record.clinicalMicroscopyParasitology.routineUrinalysis}</p>
                    </td>
                    <td className="py-4">
                      <button className="text-gray-500 hover:text-gray-700">
                      <BsThreeDots size={20} />
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
                <span className="mr-2">&#9432;</span> Whole laboratory request list is not
                shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Laboratory Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Laboratory;


