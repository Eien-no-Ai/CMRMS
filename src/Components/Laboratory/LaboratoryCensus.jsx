import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar"; // Adjust the import path as needed
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import ClinicalChemistryReport from '../certificatesReports/ClinicalChemistryReport.jsx'
import ClinicalHematologyReport from '../certificatesReports/ClinicalHematologyReport.jsx'


function LaboratoryCensus() {
  const [labRecords, setLabRecords] = useState([]);
  const [reports, setReports] = useState({});
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [fromMonthYear, setFromMonthYear] = useState("");
  const [toMonthYear, setToMonthYear] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get(`${apiUrl}/api/laboratory`,
      {
        headers: {
          "api-key": api_Key,
        },
      }
      )
      .then((response) => {
        const completeRecords = response.data
          .filter((record) => record.labResult === "verified")
          .sort((a, b) => new Date(b.isCreatedAt) - new Date(a.isCreatedAt));
        setLabRecords(completeRecords);
      })
      .catch((error) => {
        console.error("There was an error fetching the lab records!", error);
      });
  };

  useEffect(() => {
    if (labRecords.length > 0) {
      // Extract unique months and years from lab records
      const months = [...new Set(labRecords.map(record => {
        const date = new Date(record.isCreatedAt);
        return date.toLocaleString("default", { month: "long", year: "numeric" });
      }))];
      setAvailableMonths(months);
    }
  }, [labRecords]);

  useEffect(() => {
    if (labRecords.length > 0) {
      const reportsData = generateReports();
      setReports(reportsData);
    }
  }, [labRecords]);

  const generateReports = () => {
    const reports = {};
  
    const testNames = [
      "bloodSugar", // GLU
      "totalCholesterol", // T. CHOLE
      "triglyceride", // TRIG
      "HDL_cholesterol", // HDL
      "LDL_cholesterol", // LDL
      "bloodUreaNitrogen", // BUN
      "creatinine", // CREA
      "bloodUricAcid", // BUA
      "SGOT_AST", // SGOT
      "SGPT_ALT", // SGPT,
    ];
  
    labRecords.forEach((record) => {
      const date = new Date(record.isCreatedAt);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }); // e.g., 'November 2019'
  
      const patient = record.patient;
  
      // Check if patient exists
      if (!patient) {
        console.warn("Record has no patient:", record);
        return; // Skip this record if patient is null or undefined
      }
  
      const patientType = patient.patientType || "Unknown";
      const sex = patient.sex || "Unknown";
  
      let department = "Unknown Department";
      if (patientType === "Student") {
        department = patient.course || "Unknown Course";
      } else if (patientType === "Employee") {
        department = patient.position || "Employee";
      } else if (patientType === "OPD") {
        department = "OPD";
      } else {
        department = patientType;
      }
  
      if (!reports[monthYear]) {
        reports[monthYear] = {};
      }
      if (!reports[monthYear][patientType]) {
        reports[monthYear][patientType] = {};
      }
      if (!reports[monthYear][patientType][department]) {
        reports[monthYear][patientType][department] = {
          MalePatients: new Set(),
          FemalePatients: new Set(),
          UnknownPatients: new Set(),
          tests: {},
        };
        testNames.forEach((testName) => {
          reports[monthYear][patientType][department].tests[testName] = 0;
        });
      }
  
      const sexKey = sex === "Male" || sex === "Female" ? sex : "Unknown";
  
      // Add patient ID to the appropriate set to avoid duplicates
      const patientId = patient._id;
      if (sexKey === "Male") {
        reports[monthYear][patientType][department].MalePatients.add(patientId);
      } else if (sexKey === "Female") {
        reports[monthYear][patientType][department].FemalePatients.add(patientId);
      } else {
        reports[monthYear][patientType][department].UnknownPatients.add(patientId);
      }
  
      // Count tests
      let tests = getTestsPerformed(record);
      tests = tests.filter((testName) => testNames.includes(testName));
  
      tests.forEach((testName) => {
        reports[monthYear][patientType][department].tests[testName]++;
      });
    });
  
    // After processing all records, replace the sets with counts
    // For easier rendering
    for (const monthYear in reports) {
      for (const patientType in reports[monthYear]) {
        for (const department in reports[monthYear][patientType]) {
          const deptData = reports[monthYear][patientType][department];
          deptData.Male = deptData.MalePatients.size;
          deptData.Female = deptData.FemalePatients.size;
          deptData.Unknown = deptData.UnknownPatients.size;
  
          // Remove the sets to save memory
          delete deptData.MalePatients;
          delete deptData.FemalePatients;
          delete deptData.UnknownPatients;
        }
      }
    }
  
    return reports;
  };
  

  const getTestsPerformed = (record) => {
    const tests = [];

    const categories = [
      "bloodChemistry",
      "hematology",
      "clinicalMicroscopyParasitology",
      "bloodBankingSerology",
    ];

    categories.forEach((category) => {
      const categoryData = record[category];
      if (categoryData) {
        const testsInCategory = extractTests(categoryData);
        tests.push(...testsInCategory);
      }
    });

    return tests;
  };

  const extractTests = (categoryData) => {
    const tests = [];
    for (const key in categoryData) {
      const value = categoryData[key];
      if (typeof value === "object" && value !== null) {
        const subTests = extractTests(value);
        tests.push(...subTests);
      } else {
        if (value && value !== "") {
          // The test was performed
          tests.push(key);
        }
      }
    }
    return tests;
  };

  const allMonths = Object.keys(reports);

  const handleMonthChange = (event) => {
    setSelectedMonthYear(event.target.value);
  };

  const testDisplayNames = {
    bloodSugar: "GLU",
    totalCholesterol: "T.CHOLE",
    triglyceride: "TRIG",
    HDL_cholesterol: "HDL",
    LDL_cholesterol: "LDL",
    bloodUreaNitrogen: "BUN",
    creatinine: "CREA",
    bloodUricAcid: "BUA",
    SGOT_AST: "SGOT",
    SGPT_ALT: "SGPT",
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("censusReport");
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        // Calculate the number of pages needed
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Census_Report_${selectedMonthYear}.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const [selectedReport, setSelectedReport] = useState('');  

  const handleGenerate = (selectedReport) => {

    if (selectedReport === 'Clinical Chemistry Report') {
      setIsClinicalChemistryReport(true);
    } else if (selectedReport === 'Clinical Hematology Report') {
      setIsClinicalHematologyReport(true);
    }
    setIsMonthDateModalOpen(false);
  };

  const [isClinicalChemistryReportOpen, setIsClinicalChemistryReport] = useState(false);

  const handleOpenClinicalChemistryReport = (selectedReport, labRecords) => {
    setIsClinicalChemistryReport(true);
    console.log("open");
  };
  
  const handleCloseClinicalChemistryReport = () => {
    setIsClinicalChemistryReport(false); // Close the modal
  };
  
  const [isClinicalHematologyReportOpen, setIsClinicalHematologyReport] = useState(false);
  
  const handleOpenClinicalHematologyReport = (selectedReport, labRecords) => {
    setIsClinicalHematologyReport(true);
    console.log("sesame");
  };
  
  const handleCloseClinicalHematologyReport = () => {
    setIsClinicalHematologyReport(false); // Close the modal
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMonthDateModalOpen, setIsMonthDateModalOpen] = useState(false);


  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleSelectReport = (reportType) => {
    setSelectedReport(reportType);
    setIsMonthDateModalOpen(true);
    handleCloseReportModal();
    console.log(`Selected Report: ${reportType}`);
  };

  const handleCloseDateSelectionModal = () => {
    setFromMonthYear("");
    setToMonthYear("");
    setIsReportModalOpen(false); 
    setIsMonthDateModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 pt-20 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold mb-6">Laboratory Statistics</h1>

          <div className="flex space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-100 transition">
              <IoCalendarNumberOutline className="text-gray-600 text-xl" />
              <select
                value={selectedMonthYear}
                onChange={handleMonthChange}
                className="bg-gray-100 text-gray-600 focus:outline-none flex items-center px-2 "
              >
                <option value="" className="font-medium">
                  Select Month
                </option>
                {allMonths.map((monthYear) => (
                  <option key={monthYear} value={monthYear} >
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
        <div className="mt-2 grid grid-cols-1 gap-6">
          <div className="col-span-2 relative">
            <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-4">
              {selectedMonthYear && reports[selectedMonthYear] && (
                <div id="censusReport">
                  <h2 className="text-2xl font-semibold mb-4">
                    {selectedMonthYear}
                  </h2>
                  {Object.keys(reports[selectedMonthYear]).map(
                    (patientType) => (
                      <div key={patientType}>
                        <h3 className="text-xl font-semibold mt-4">
                          {patientType.toUpperCase()}
                        </h3>
                        <table className="min-w-full mb-6">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="py-3">Department</th>
                              <th className="py-3 text-center">Female</th>
                              <th className="py-3 text-center">Male</th>
                              {Object.values(testDisplayNames).map(
                                (testDisplayName) => (
                                  <th
                                    key={testDisplayName}
                                    className="py-3 text-center"
                                  >
                                    {testDisplayName}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(
                              reports[selectedMonthYear][patientType]
                            ).map((department) => (
                              <tr key={department} className="border-b">
                                <td className="py-4">{department}</td>
                                <td className="py-4 text-center">
                                  {
                                    reports[selectedMonthYear][patientType][
                                      department
                                    ].Female
                                  }
                                </td>
                                <td className="py-4 text-center">
                                  {
                                    reports[selectedMonthYear][patientType][
                                      department
                                    ].Male
                                  }
                                </td>
                                {Object.keys(testDisplayNames).map(
                                  (testName) => (
                                    <td
                                      key={testName}
                                      className="py-4 text-center"
                                    >
                                      {
                                        reports[selectedMonthYear][patientType][
                                          department
                                        ].tests[testName]
                                      }
                                    </td>
                                  )
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Visitors
              </h3>
              <div className="text-blue-500">&#128065;</div>
            </div>
            <p className="text-3xl font-bold text-blue-500">4,818</p>
            <p className="text-sm text-green-600">+44.2%</p>
            <div className="border-t border-gray-200"></div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Engagement Rate
              </h3>
              <div className="text-purple-500">&#128161;</div>
            </div>
            <p className="text-3xl font-bold text-purple-500">118,818</p>
            <p className="text-sm text-red-600">-2.8%</p>
            <div className="border-t border-gray-200"></div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Conversion Rate
              </h3>
              <div className="text-green-500">&#9889;</div>
            </div>
            <p className="text-3xl font-bold text-green-500">12,158,187</p>
            <p className="text-sm text-green-600">+8%</p>
          </div> */}
        </div>
      </div>

             {/* The Report Modal for selecting the report type */}
             {isReportModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <ul className="space-y-4">
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <button
                    onClick={() => handleSelectReport('Clinical Hematology Report')}
                    className="text-gray-600 font-medium flex items-center space-x-2 focus:outline-none"
                  >
                    Clinical Hematology Report
                  </button>
                </div>

                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <button
                    onClick={() => handleSelectReport('Clinical Chemistry Report')}
                    className="text-gray-600 font-medium flex items-center space-x-2 focus:outline-none"
                  >
                    Clinical Chemistry Report
                  </button>
                </div>
              </ul>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCloseReportModal} // Close the modal when clicking cancel
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal for Selecting "From" and "To" Date Range */}
        {isMonthDateModalOpen && selectedReport && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Select Date Range for {selectedReport}</h2>
              
              <div className="mb-4">
                <label htmlFor="fromMonthYear" className="block text-sm font-medium text-gray-700">From:</label>
                <select
                  id="fromMonthYear"
                  value={fromMonthYear}
                  onChange={(e) => setFromMonthYear(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Month</option>
                  {availableMonths.map((monthYear) => (
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
                  {availableMonths.map((monthYear) => (
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
                  onClick={() => handleGenerate(selectedReport)}                  
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"                
                >
                  Generate Report
                </button>
              </div>
              
            </div>
          </div>
        )}
            <ClinicalChemistryReport isOpen={isClinicalChemistryReportOpen} onClose={handleCloseClinicalChemistryReport} selectedReport={selectedReport} labRecords={labRecords} fromMonthYear={fromMonthYear} toMonthYear={toMonthYear}/>
            <ClinicalHematologyReport isOpen={isClinicalHematologyReportOpen} onClose={handleCloseClinicalHematologyReport} selectedReport={selectedReport} labRecords={labRecords} fromMonthYear={fromMonthYear} toMonthYear={toMonthYear}/>


    </div>
  );
}

export default LaboratoryCensus;
