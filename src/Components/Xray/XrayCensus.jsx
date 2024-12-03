import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar"; // Adjust the import path as needed
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IoCalendarNumberOutline } from "react-icons/io5";
import LabXrayCensus from '../certificatesReports/LabXrayCensus.jsx'


function XrayCensus() {
  const [xrayRecords, setXrayRecords] = useState([]);
  const [reports, setReports] = useState({});
  const [selectedMonthYear, setSelectedMonthYear] = useState('');

  useEffect(() => {
    fetchXrayRecords();
  }, []);

  const fetchXrayRecords = () => {
    axios.get("https://cmrms-full.onrender.com/api/xrayResults")
      .then((response) => {
        console.log("Fetched records:", response.data); // Check the structure here
        const completeRecords = response.data
          .filter(record => record.xrayResult === "done")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setXrayRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the X-ray records!", error);
      });
  };
  
  

  useEffect(() => {
    if (xrayRecords.length > 0) {
      const reportsData = generateReports();
      setReports(reportsData);
    }
  }, [xrayRecords]);

  const generateReports = () => {
    const reports = {};

    xrayRecords.forEach((record) => {
      const date = new Date(record.isCreatedAt);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g., 'November 2023'

      const patient = record.patient;
      const xrayType = record.xrayType || 'Unknown Type';
      const patientType = patient.patientType || 'Unknown';

      let department = 'Unknown Department';
      if (patientType === 'Student') {
        department = patient.course || 'Unknown Course';
      } else if (patientType === 'Employee') {
        department = patient.position || 'Employee';
      } else if (patientType === 'OPD') {
        department = 'OPD';
      } else {
        department = patientType;
      }

      if (!reports[monthYear]) {
        reports[monthYear] = {};
      }
      if (!reports[monthYear][xrayType]) {
        reports[monthYear][xrayType] = {};
      }
      if (!reports[monthYear][xrayType][patientType]) {
        reports[monthYear][xrayType][patientType] = 0;
      }

      reports[monthYear][xrayType][patientType]++;
    });

    return reports;
  };

  const handleMonthChange = (event) => {
    setSelectedMonthYear(event.target.value);
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById('censusReport');
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Calculate the number of pages needed
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Xray_Census_Report_${selectedMonthYear}.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  const allMonths = Object.keys(reports).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (yearA === yearB) {
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    }
    return yearA - yearB;
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMonthDateModalOpen, setIsMonthDateModalOpen] = useState(false);

  const handleOpenReportModal = () => {
    setIsMonthDateModalOpen(true);
    handleCloseReportModal();  
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  const [fromMonthYear, setFromMonthYear] = useState("");
  const [toMonthYear, setToMonthYear] = useState("");

  const handleCloseDateSelectionModal = () => {
    setFromMonthYear("");
    setToMonthYear("");
    setIsReportModalOpen(false); 
    setIsMonthDateModalOpen(false);
  };

  const [isLabXrayCensusOpen, setIsLabXrayCensus] = useState(false);

  const handleOpenLabXrayCensus = (xrayRecords) => {
    setIsLabXrayCensus(true);
  };

  const handleCloseLabXrayCensus = () => {
    setIsMonthDateModalOpen(false);
    setIsLabXrayCensus(false); // Close the modal
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">X-ray Census</h1>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-100 transition">
            <IoCalendarNumberOutline className="text-gray-600 text-xl" />
            <select
              value={selectedMonthYear}
              onChange={handleMonthChange}
              className="bg-gray-100 text-gray-600 focus:outline-none flex items-center px-2"
            >
              <option value="" className="font-medium">
                Select Month
              </option>
              {allMonths.map((monthYear) => (
                <option key={monthYear} value={monthYear}>
                  {monthYear}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <button
                    onClick={handleOpenReportModal}
                    className="text-gray-600 font-medium flex items-center space-x-2 focus:outline-none"
                  >
                    <span>Generate Report</span>
                  </button>
                </div>
        </div>
      </div>

        {selectedMonthYear && reports[selectedMonthYear] && (
          <div id="censusReport" className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{selectedMonthYear}</h2>
            {Object.keys(reports[selectedMonthYear]).map((xrayType) => (
              <div key={xrayType}>
                <h3 className="text-xl font-semibold mt-4">{xrayType}</h3>
                <table className="min-w-full mb-6">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-3">Patient Type</th>
                      <th className="py-3 text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(reports[selectedMonthYear][xrayType]).map((patientType) => (
                      <tr key={patientType} className="border-b">
                        <td className="py-4">{patientType}</td>
                        <td className="py-4 text-center">
                          {reports[selectedMonthYear][xrayType][patientType]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
      {isMonthDateModalOpen && xrayRecords && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
              
              <div className="mb-4">
                <label htmlFor="fromMonthYear" className="block text-sm font-medium text-gray-700">From:</label>
                <select
                  id="fromMonthYear"
                  value={fromMonthYear}
                  onChange={(e) => setFromMonthYear(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Month</option>
                  {allMonths.map((monthYear) => (
                    <option key={monthYear} value={monthYear}>
                      {monthYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="toMonthYear" className="block text-sm font-medium text-gray-700">To:</label>
                <select
                  id="toMonthYear"
                  value={toMonthYear}
                  onChange={(e) => setToMonthYear(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Month</option>
                  {allMonths.map((monthYear) => (
                    <option key={monthYear} value={monthYear}>
                      {monthYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleCloseDateSelectionModal}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleOpenLabXrayCensus(fromMonthYear, toMonthYear, xrayRecords)}                  
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"                
                >
                  Generate Report
                </button>
              </div>
              <LabXrayCensus isOpen={isLabXrayCensusOpen} onClose={handleCloseLabXrayCensus} fromMonthYear={fromMonthYear} toMonthYear={toMonthYear} xrayRecords={xrayRecords} />
            </div>
          </div>
        )}


    </div>
  );
}

export default XrayCensus;
