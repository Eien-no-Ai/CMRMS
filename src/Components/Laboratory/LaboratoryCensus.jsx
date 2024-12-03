import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar"; // Adjust the import path as needed
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";

function LaboratoryCensus() {
  const [labRecords, setLabRecords] = useState([]);
  const [reports, setReports] = useState({});
  const [selectedMonthYear, setSelectedMonthYear] = useState("");

  useEffect(() => {
    fetchLabRecords();
  }, []);

  const fetchLabRecords = () => {
    axios
      .get("https://cmrms-full.onrender.com/api/laboratory")
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
        reports[monthYear][patientType][department].FemalePatients.add(
          patientId
        );
      } else {
        reports[monthYear][patientType][department].UnknownPatients.add(
          patientId
        );
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
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-6">
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
              <div className="mt-4 flex justify-between items-center text-gray-600">
                {selectedMonthYear && (
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition flex items-center space-x-2"
                  >
                    Download PDF
                  </button>
                )}
               
              </div>
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
    </div>
  );
}

export default LaboratoryCensus;
