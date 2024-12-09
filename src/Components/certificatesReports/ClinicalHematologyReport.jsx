import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const ClinicalHematologyReport = ({ isOpen, onClose, selectedReport, labRecords, fromMonthYear, toMonthYear}) => {
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const imageUrl = `${apiUrl}/uploads/${userData?.signature}`;


  useEffect(() => {
    if (isOpen && selectedReport && labRecords && userData && fromMonthYear && toMonthYear) {
      generatePDF();
    }
  }, [isOpen, selectedReport, labRecords, userData, fromMonthYear, toMonthYear]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${apiUrl}/user/${userId}`,
          {
            headers: {
             'api_key': api_Key,
            },
          }
        )
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
    const signatureUrl = `${apiUrl}/uploads/${userData?.signature}`;
  
    // Fetch the image as Base64
    const base64Image = await fetchImageAsBase64(signatureUrl);
  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.error("Image could not be fetched.");
    }
  
    const courseCounts = {};
    const coursePositionGenderCounts = {
      employee: { maleCount: 0, femaleCount: 0, cbcCount: 0, ctBtCount: 0 },
      opd: { maleCount: 0, femaleCount: 0, cbcCount: 0, ctBtCount: 0 }
    };
  
    const formatMonthYear = (date) => {
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString('en-US', options);
    };
  
    const fromDate = new Date(fromMonthYear);
    const toDate = new Date(toMonthYear);
  
    const content = document.createElement('div');
    let currentMonth = new Date(fromDate);
    let tableCount = 0;
  
    while (currentMonth <= toDate) {
      const currentMonthYear = formatMonthYear(currentMonth);
  
      const filteredRecords = labRecords.filter(record => {
        const recordDate = new Date(record.isCreatedAt);
        return recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear();
      });
  
      const monthCourseCounts = {};
      const monthPositionGenderCounts = {
        employee: { maleCount: 0, femaleCount: 0, cbcCount: 0, ctBtCount: 0 },
        opd: { maleCount: 0, femaleCount: 0, cbcCount: 0, ctBtCount: 0 }
      };
  
      filteredRecords.forEach(record => {
        const patientId = record.patient._id;
        const hasCBC = record.hematology?.completeBloodCount;
        const hasCTBT = record.hematology?.bleedingTimeClottingTime;
  
        if (hasCBC || hasCTBT) {
          const course = record.patient.course || 'No Course';  
          const patientType = record.patient.patientType || 'OPD';
  
          if (!monthCourseCounts[course]) {
            monthCourseCounts[course] = { maleCount: 0, femaleCount: 0, cbcCount: 0, ctBtCount: 0 };
          }
  
          const targetCategory = patientType.toLowerCase() === 'employee' ? 'employee' : 'opd';
  
          if (record.patient.sex === 'Male') {
            monthCourseCounts[course].maleCount++;
            monthPositionGenderCounts[targetCategory].maleCount++;
          } else if (record.patient.sex === 'Female') {
            monthCourseCounts[course].femaleCount++;
            monthPositionGenderCounts[targetCategory].femaleCount++;
          }
  
          if (hasCBC) {
            monthCourseCounts[course].cbcCount++;
            monthPositionGenderCounts[targetCategory].cbcCount++;
          }
  
          if (hasCTBT) {
            monthCourseCounts[course].ctBtCount++;
            monthPositionGenderCounts[targetCategory].ctBtCount++;
          }
        }
      });
  
      let totalFemale = 0;
      let totalMale = 0;
      let totalCBC = 0;
      let totalCTBT = 0;
  
      const currentDate = new Date().toLocaleDateString()
  
      // Create a page with header and table for the current month
      const pageContent = `
        <div class="header">
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
        </div>
        
        <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
          <div style="text-align: center;">STATISTICAL REPORT AS OF ${fromMonthYear} - ${toMonthYear}</div>
          <div style="text-align: center;">CLINICAL HEMATOLOGY SECTION</div>
          <h3 style="text-align: center; font-size: 10pt; font-weight: bold;">${currentMonthYear}</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 50px;">
            <thead>
              <tr>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">Course</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">Female</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">Male</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">CBC</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">CT/BT</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #000;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(monthCourseCounts).map(course => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #000;">${course}</td>
                  <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].femaleCount}</td>
                  <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].maleCount}</td>
                  <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].cbcCount}</td>
                  <td style="padding: 8px; border: 1px solid #000;">${monthCourseCounts[course].ctBtCount}</td>
                  <td style="padding: 8px; border: 1px solid #000;">
                    ${monthCourseCounts[course].femaleCount + monthCourseCounts[course].maleCount + monthCourseCounts[course].cbcCount + monthCourseCounts[course].ctBtCount}
                  </td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">Employee</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.femaleCount}</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.maleCount}</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.cbcCount}</td>
                <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.employee.ctBtCount}</td>
                <td style="padding: 8px; border: 1px solid #000;">
                  ${monthPositionGenderCounts.employee.femaleCount + monthPositionGenderCounts.employee.maleCount + monthPositionGenderCounts.employee.cbcCount + monthPositionGenderCounts.employee.ctBtCount}
                </td>
              </tr>
              <tr>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">OPD</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.femaleCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.maleCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.cbcCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">${monthPositionGenderCounts.opd.ctBtCount}</td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${monthPositionGenderCounts.opd.femaleCount + monthPositionGenderCounts.opd.maleCount + monthPositionGenderCounts.opd.cbcCount + monthPositionGenderCounts.opd.ctBtCount}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">TOTAL</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalFemale}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalMale}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalCBC}</td>
              <td style="padding: 8px; border: 1px solid #000;">${totalCTBT}</td>
            </tr>
            </tbody>
          </table>
        </div>
      `;
  
      content.innerHTML += pageContent;
      if (currentMonth.getMonth() === toDate.getMonth() && currentMonth.getFullYear() === toDate.getFullYear()) {
        content.innerHTML += `
          <div style="display: flex; align-items: center; font-size: 10pt; margin-bottom: 10px;">
            <strong>Prepared By:</strong> ${userData.lastname} ${userData.firstname}
          ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
          </div>
          <div style="text-align: left; font-size: 10pt; margin-bottom: 10px;">
            <strong>Date:</strong> ${currentDate}
          </div>
          <div style="page-break-before: always;"></div>
  
        `;
      }
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      tableCount++;
    }
  
     // Use html2pdf to generate the PDF and return it as a data URL
     html2pdf()
     .from(content)
     .set({
       margin: 0.5, // 0.5 inch margin on all sides
       filename: 'LabTestReportPreview.pdf',
       image: { type: 'jpeg', quality: 0.98 },
       html2canvas: { scale: 4 },
       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
        <h2 className="text-2xl font-semibold">Clinical Hematology Report Preview</h2>

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

export default ClinicalHematologyReport;
