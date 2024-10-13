import React, { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";

function PhysicalTherapy() {
  const [physicalTherapyRecords, setPhysicalTherapyRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const physicalTherapyRecordsPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);

  useEffect(() => {
    fetchPhysicalTherapyRecords(); // Fetch physical therapy records on component mount
  }, []);

  const fetchPhysicalTherapyRecords = () => {
    axios
      .get("http://localhost:3001/api/physicalTherapy")
      .then((response) => {
        console.log(response.data); // Add this line to inspect the response
        const sortedRecords = response.data.sort(
          (a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt)
        );
        setPhysicalTherapyRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the physical therapy records!", error);
      });
  };

  const indexOfLastRecord = currentPage * physicalTherapyRecordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - physicalTherapyRecordsPerPage;

  // Filter records based on search query
  const filteredPhysicalTherapyRecords = physicalTherapyRecords.filter((record) => {
    const formattedDate = new Date(record.isCreatedAt).toLocaleDateString();

    // Check if patient exists and has firstname, lastname, and idnumber properties
    return (
      record.patient &&
      (record.patient.firstname
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        record.patient.lastname
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.patient.idnumber?.includes(searchQuery) ||
        formattedDate.includes(searchQuery))
    );
  });

  const currentPhysicalTherapyRecords = filteredPhysicalTherapyRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(
    filteredPhysicalTherapyRecords.length / physicalTherapyRecordsPerPage
  );

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Physical Therapy Records</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-4xl text-custom-red">
              {filteredPhysicalTherapyRecords.length}
            </span>{" "}
            records
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
                    <th className="py-3 w-1/4">SOAP Summary</th>
                    <th className="py-3 w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPhysicalTherapyRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500"
                      >
                        No physical therapy records found.
                      </td>
                    </tr>
                  ) : (
                    currentPhysicalTherapyRecords.map((record) => (
                      <tr key={record._id} className="border-b">
                        <td className="py-4">
                          {record.patient ? (
                            <>
                              <p className="font-semibold">
                                {record.patient.lastname || "Unknown"},{" "}
                                {record.patient.firstname || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(record.isCreatedAt).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No patient data available
                            </p>
                          )}
                        </td>
                        <td className="py-4">
                          <p className="font-semibold">
                            {record.SOAPSummary || "No SOAP Summary available"}
                          </p>
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
                <span className="mr-2">&#9432;</span> Full physical therapy record list is
                not shown to save initial load time.
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleListVisibility}
                className="px-4 py-2 bg-custom-red text-white rounded-lg shadow-md hover:bg-white hover:text-custom-red hover:border hover:border-custom-red"
              >
                Load All Physical Therapy Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhysicalTherapy;
