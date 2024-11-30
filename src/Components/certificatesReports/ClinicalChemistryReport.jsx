import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const ClinicalChemistryReport = ({ isOpen, onClose, selectedReport, labRecords, fromMonthYear, toMonthYear}) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const imageUrl = `http://localhost:3001/uploads/${userData?.signature}`;


  useEffect(() => {
    if (isOpen && selectedReport && labRecords && userData && fromMonthYear && toMonthYear) {
      generatePDF();
    }
  }, [isOpen, selectedReport, labRecords, userData, fromMonthYear, toMonthYear]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3001/user/${userId}`)
        .then((response) => {
          setUserData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  const fetchImageAsBase64 = async (imageUrl) => {
    try {
      const response = await axios.get(imageUrl, { responseType: 'blob' });
      const blob = response.data;
  
      // Create a FileReader to convert the image to Base64
      const reader = new FileReader();
  
      // Promise to return the Base64 image data once the FileReader is done
      const base64ImagePromise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result); // This will return the Base64 string
        };
        reader.onerror = reject; // Handle error if it occurs
      });
  
      // Read the blob as a Data URL (Base64 string)
      reader.readAsDataURL(blob);
  
      // Wait for the Base64 result and return it
      return await base64ImagePromise;
    } catch (error) {
      console.error("Error fetching image as base64:", error);
      return null;
    }
  };

  const generatePDF = async () => {
    const signatureUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  
    // Fetch the image as Base64
    const base64Image = await fetchImageAsBase64(signatureUrl);
  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.error("Image could not be fetched.");
      return;
    }

    const courseCounts = {};
    const coursePositionGenderCounts = {
      employee: { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 },
      opd: { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 }
    };

    // Function to get the month-year string in "MMMM YYYY" format
    const formatMonthYear = (date) => {
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    };

    // Convert the from and to dates to Date objects
    const fromDate = new Date(fromMonthYear);
    const toDate = new Date(toMonthYear);

    const content = document.createElement('div');

    // Loop through each month in the range from fromDate to toDate
    let currentMonth = new Date(fromDate);
    while (currentMonth <= toDate) {
      const currentMonthYear = formatMonthYear(currentMonth);
      
      const filteredRecords = labRecords.filter(record => {
        const recordDate = new Date(record.isCreatedAt); // Use the isCreatedAt field
        return recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear();
      });
      

      // Reset the counts for this month
      const monthCourseCounts = {};
      const monthPositionGenderCounts = {
        employee: { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 },
        opd: { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 }
      };

        let totalFemale = 0;
        let totalMale = 0;
        let totalGLU = 0;
        let totalTCHOLE = 0;
        let totalTRIG = 0;
        let totalHDL = 0;
        let totalLDL = 0;
        let totalBUN = 0;
        let totalCREA = 0;
        let totalBUA = 0;
        let totalSGOT = 0;
        let totalSGPT = 0;

      // Iterate through filtered records to populate counts for this month
      filteredRecords.forEach(record => {
        const patientId = record.patient._id;
        const patientType = record.patient.patientType || 'OPD';
        const course = record.patient.course || 'No Course';
        const hasGLU = record.bloodChemistry?.bloodSugar;
        const hasTCHOLE = record.bloodChemistry?.totalCholesterol;
        const hasTRIG = record.bloodChemistry?.triglyceride;
        const hasHDL = record.bloodChemistry?.HDL_cholesterol;
        const hasLDL = record.bloodChemistry?.LDL_cholesterol;
        const hasBUN = record.bloodChemistry?.bloodUreaNitrogen;
        const hasCREA = record.bloodChemistry?.creatinine;
        const hasBUA = record.bloodChemistry?.bloodUricAcid;
        const hasSGOT = record.bloodChemistry?.SGOT_AST;
        const hasSGPT = record.bloodChemistry?.SGPT_ALT;

        if (hasGLU || hasTCHOLE || hasTRIG || hasHDL || hasLDL || hasBUN || hasCREA || hasBUA || hasSGOT || hasSGPT) {


          if (!monthCourseCounts[course]) {
            // Check if the course is "opd" or "No Course"
            if (course === "opd" || course === "No Course") {
              monthCourseCounts[course] = { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 };
            } else {
              // Default case for other courses
              monthCourseCounts[course] = { maleCount: 0, femaleCount: 0, GLU: 0, TCHOLE: 0, TRIG: 0, HDL: 0, LDL: 0, BUN: 0, CREA: 0, BUA: 0, SGOT: 0, SGPT: 0 };
            }
          }
          

        const targetCategory = patientType.toLowerCase() === 'employee' ? 'employee' : 'opd';


        // Count gender and test results
        if (record.patient.sex === 'Male') {
          monthCourseCounts[course].maleCount++;
          monthPositionGenderCounts[targetCategory].maleCount++;
          totalMale++;
        } else if (record.patient.sex === 'Female') {
          monthCourseCounts[course].femaleCount++;
          monthPositionGenderCounts[targetCategory].femaleCount++;
          totalFemale++;
        }

        if (hasGLU) {
          monthCourseCounts[course].GLU++;
          monthPositionGenderCounts[targetCategory].GLU++;
          totalGLU++;
        }

        if (hasTCHOLE) {
          monthCourseCounts[course].TCHOLE++;
          monthPositionGenderCounts[targetCategory].TCHOLE++;
          totalTCHOLE++;
        }

        if (hasTRIG) {
          monthCourseCounts[course].TRIG++;
          monthPositionGenderCounts[targetCategory].TRIG++;
          totalTRIG++;
        }

        if (hasHDL) {
          monthCourseCounts[course].HDL++;
          monthPositionGenderCounts[targetCategory].HDL++;
          totalHDL++;
        }

        if (hasLDL) {
          monthCourseCounts[course].LDL++;
          monthPositionGenderCounts[targetCategory].LDL++;
          totalLDL++;
        }

        if (hasBUN) {
          monthCourseCounts[course].BUN++;
          monthPositionGenderCounts[targetCategory].BUN++;
          totalBUN++;
        }

        if (hasCREA) {
          monthCourseCounts[course].CREA++;
          monthPositionGenderCounts[targetCategory].CREA++;
          totalCREA++;
        }

        if (hasBUA) {
          monthCourseCounts[course].BUA++;
          monthPositionGenderCounts[targetCategory].BUA++;
          totalBUA++;
        }

        if (hasSGOT) {
          monthCourseCounts[course].SGOT++;
          monthPositionGenderCounts[targetCategory].SGOT++;
          totalSGOT++;
        }

        if (hasSGPT) {
          monthCourseCounts[course].SGPT++;
          monthPositionGenderCounts[targetCategory].SGPT++;
          totalSGPT++;
        }
      }
      });

      
      const currentDate = new Date().toLocaleDateString()

      // Append month header and table to the content
      content.innerHTML = `
      <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
      <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        UNIVERSITY OF BAGUIO CLINICAL LABORATORY<br>
        General Luna Road., Baguio City, Philippines 2600
      </p>
      <hr style="border-top: 1px solid black; margin-top: 7px; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 2px;">
      <hr style="border-top: 1px solid black; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', Times, serif; font-size: 10pt; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in;">
        <div style="text-align: left;">Telefax No.: (074) 442-3071</div>
        <div style="text-align: center;">Website: www.ubaguio.edu</div>
        <div style="text-align: right;">E-mail Address: lab@ubaguio.edu</div>
      </div>
      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="text-align: center;">STATISTICAL REPORT AS OF ${fromMonthYear} - ${toMonthYear}</div>
        <div style="text-align: center;">CLINICAL CHEMISTRY SECTION</div>
    
        <h3 style="text-align: center; font-size: 10pt; font-weight: bold;">${currentMonthYear}</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 50px;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Course</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Female</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Male</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">GLU</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">T.CHOLE</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">TRIG</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">HDL</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">LDL</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">BUN</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">CREA</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">BUA</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">SGOT</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">SGPT</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(monthCourseCounts).map(course => `
              <tr>
                <td style="padding: 8px; border: 1px solid #000;">${course}</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].femaleCount}</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].maleCount}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].GLU}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].TCHOLE}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].TRIG}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].HDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].LDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].BUN}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].CREA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].BUA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].SGOT}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthCourseCounts[course].SGPT}</td>
                <td style="padding: 8px; border: 1px solid #000;">
                  ${monthCourseCounts[course].femaleCount + monthCourseCounts[course].maleCount + monthCourseCounts[course].GLU + monthCourseCounts[course].TCHOLE + monthCourseCounts[course].TRIG + monthCourseCounts[course].HDL + monthCourseCounts[course].LDL + monthCourseCounts[course].BUN + monthCourseCounts[course].CREA + monthCourseCounts[course].BUA + monthCourseCounts[course].SGOT + monthCourseCounts[course].SGPT}
                </td>
              </tr>
            `).join('')}
            <tr>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">Employee</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.femaleCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.maleCount}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.GLU}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.TCHOLE}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.TRIG}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.HDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.LDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.BUN}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.CREA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.BUA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.SGOT}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.employee.SGPT}</td>              
                <td style="padding: 8px; border: 1px solid #000;">
                ${monthPositionGenderCounts.employee.femaleCount + monthPositionGenderCounts.employee.maleCount + monthPositionGenderCounts.employee.GLU + monthPositionGenderCounts.employee.TCHOLE + monthPositionGenderCounts.employee.TRIG + monthPositionGenderCounts.employee.HDL + monthPositionGenderCounts.employee.LDL + monthPositionGenderCounts.employee.BUN + monthPositionGenderCounts.employee.CREA + monthPositionGenderCounts.employee.BUA + monthPositionGenderCounts.employee.SGOT + monthPositionGenderCounts.employee.SGPT}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">OPD</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.femaleCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.maleCount}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.GLU}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.TCHOLE}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.TRIG}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.HDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.LDL}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.BUN}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.CREA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.BUA}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.SGOT}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid black;">${monthPositionGenderCounts.opd.SGPT}</td> 
              <td style="padding: 8px; border: 1px solid #000;">
                ${monthPositionGenderCounts.opd.femaleCount + monthPositionGenderCounts.opd.maleCount + monthPositionGenderCounts.opd.GLU + monthPositionGenderCounts.opd.TCHOLE + monthPositionGenderCounts.opd.TRIG + monthPositionGenderCounts.opd.HDL + monthPositionGenderCounts.opd.LDL + monthPositionGenderCounts.opd.BUN + monthPositionGenderCounts.opd.CREA + monthPositionGenderCounts.opd.BUA + monthPositionGenderCounts.opd.SGOT + monthPositionGenderCounts.opd.SGPT}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">TOTAL</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalFemale}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalMale}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalGLU}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalTCHOLE}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalTRIG}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalHDL}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalLDL}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalBUN}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalCREA}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalBUA}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalSGOT}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalSGPT}</td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${totalFemale + totalMale + totalGLU + totalTCHOLE + totalTRIG + totalHDL + totalLDL + totalBUN + totalCREA + totalBUA + totalSGOT + totalSGPT}
              </td>

            </tr>
          </tbody>
        </table>
      </div>
        <div style="display: flex; align-items: center; font-size: 10pt; margin-bottom: 10px;">
          <strong>Prepared By:</strong> ${userData.lastname} ${userData.firstname}
          <img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />
        </div>
        <div style="text-align: left; font-size: 10pt; margin-bottom: 10px;">
          <strong>Date:</strong> ${currentDate}
        </div>
    `;
    
          // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    content.innerHTML += '</div>'; // Close the content div

    // Use html2pdf to generate the PDF and return it as a data URL
    html2pdf()
      .from(content)
      .set({
        margin: 0.5, // 0.5 inch margin on all sides
        filename: 'LabTestReportPreview.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      })
      .outputPdf('datauristring') // Get PDF as Data URL
      .then((pdfData) => {
        // Set the PDF data URL for preview
        setPdfDataUrl(pdfData);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-2xl max-w-5xl overflow-y-auto flex flex-col justify-between relative">
        <h2 className="text-2xl font-semibold">Clinical Chemistry Report Preview</h2>

        {/* PDF Preview */}
        {pdfDataUrl && (
          <div className="my-4">
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="400"
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          </div>
        )}
                {/* Close Button */}
                <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-custom-red text-white py-2 px-4 rounded-lg hover:bg-white hover:text-custom-red hover:border-custom-red border transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalChemistryReport;
