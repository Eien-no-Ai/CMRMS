import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const MedicalClinicCensus = ({ isOpen, onClose, clinicalRecords, peStudent, vaccine, labRecords, fromMonthYear, toMonthYear}) => {
  const apiUrl = process.env.REACT_APP_REACT_URL;
  const api_Key = process.env.REACT_APP_API_KEY;
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const imageUrl = `${apiUrl}/uploads/${userData?.signature}`;


  useEffect(() => {
    if (isOpen && clinicalRecords && peStudent && vaccine && labRecords && userData && fromMonthYear && toMonthYear) {
      generatePDF();
    }
  }, [isOpen, clinicalRecords, peStudent, vaccine, labRecords, fromMonthYear, toMonthYear]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${apiUrl}/user/${userId}`)
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
  const formatMonthYear = (date) => {
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  // Convert the from and to dates to Date objects
  const fromDate = new Date(fromMonthYear);
  const toDate = new Date(toMonthYear);

  const generatePDF = async () => {
    const signatureUrl = `${apiUrl}/uploads/${userData?.signature}`;
  
    // Fetch the image as Base64
    const base64Image = await fetchImageAsBase64(signatureUrl);
  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.error("Image could not be fetched.");
    }
  
    const content = document.createElement('div');
  
    // Format month as "Month" (e.g., "January", "February", etc.)
    const formatMonth = (date) => {
      const options = { month: 'long' };
      return date.toLocaleDateString('en-US', options);
    };
  
    // Initialize an object to store aggregated counts for all months
    let aggregatedCounts = {
      clinicalRecordsCount: 0,
      peStudentCount: 0,
      hepatitisACount: 0,
      hepatitisBCount: 0,
      influenzaCount: 0,
      pneumoniaCount: 0
    };
  
    const months = []; // This will store month names for table headers
    const monthTotals = []; // This will store the totals for each month
  
    // Loop through each month in the range from fromDate to toDate
    let currentMonth = new Date(fromDate);
    while (currentMonth <= toDate) {
      const currentMonthName = formatMonth(currentMonth);
      months.push(currentMonthName); // Add month name to header
  
      // Initialize counts for the current month
      const monthCounts = {
        clinicalRecordsCount: 0,
        peStudentCount: 0,
        hepatitisACount: 0,
        hepatitisBCount: 0,
        influenzaCount: 0,
        pneumoniaCount: 0
      };
  
      // Count clinicalRecords for this month
      clinicalRecords.forEach(record => {
        const recordDate = new Date(record.isCreatedAt);
        if (recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()) {
          monthCounts.clinicalRecordsCount++;
        }
      });
  
      // Count PE Student completions for this month
      peStudent.forEach(record => {
        const recordDate = new Date(record.isCreatedAt);
        if (recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()) {
          monthCounts.peStudentCount++;
        }
      });
  
      // Count vaccines for this month
      vaccine.forEach(record => {
        const recordDate = new Date(record.dateAdministered);
        if (recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()) {
          if (record.name === "Hepatitis A Vaccine") monthCounts.hepatitisACount++;
          if (record.name === "Hepatitis B Vaccine") monthCounts.hepatitisBCount++;
          if (record.name === "Influenza Vaccine") monthCounts.influenzaCount++;
          if (record.name === "Pneumonia Vaccine") monthCounts.pneumoniaCount++;
        }
      });
  
      // Aggregate counts across months
      aggregatedCounts.clinicalRecordsCount += monthCounts.clinicalRecordsCount;
      aggregatedCounts.peStudentCount += monthCounts.peStudentCount;
      aggregatedCounts.hepatitisACount += monthCounts.hepatitisACount;
      aggregatedCounts.hepatitisBCount += monthCounts.hepatitisBCount;
      aggregatedCounts.influenzaCount += monthCounts.influenzaCount;
      aggregatedCounts.pneumoniaCount += monthCounts.pneumoniaCount;
  
      // Calculate total count for the current month and push it to monthTotals
      const monthTotal = Object.values(monthCounts).reduce((acc, count) => acc + count, 0);
      monthTotals.push(monthTotal);
  
      // Move to the next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  
    const currentDate = new Date().toLocaleDateString();
  
    // Append header and aggregated table to the content
    content.innerHTML += `
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
        <div style="text-align: right;">E-mail Address: med@ubaguio.edu</div>
      </div>
      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="text-align: center;">STATISTICAL REPORT AS OF ${fromMonthYear} - ${toMonthYear}</div>
        <div style="text-align: center;">MEDICAL CLINIC CENSUS</div>
  
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Types of Services Rendered</th>
              ${months.map(month => `<th style="padding: 8px; text-align: left; border: 1px solid #000;">${month}</th>`).join('')}
              <th style="padding: 8px; text-align: left; border: 1px solid #000;">Total</th> <!-- Total Column -->
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Clinical Records</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${clinicalRecords.filter(record => new Date(record.isCreatedAt).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.clinicalRecordsCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">PE Students Completed</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${peStudent.filter(record => new Date(record.isCreatedAt).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.peStudentCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Hepatitis A Vaccine</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${vaccine.filter(record => record.name === "Hepatitis A Vaccine" && new Date(record.dateAdministered).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.hepatitisACount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Hepatitis B Vaccine</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${vaccine.filter(record => record.name === "Hepatitis B Vaccine" && new Date(record.dateAdministered).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.hepatitisBCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Influenza Vaccine</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${vaccine.filter(record => record.name === "Influenza Vaccine" && new Date(record.dateAdministered).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.influenzaCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Pneumonia Vaccine</td>
              ${months.map(() => `<td style="padding: 8px; border: 1px solid #000;">${vaccine.filter(record => record.name === "Pneumonia Vaccine" && new Date(record.dateAdministered).getMonth() === new Date(fromDate).getMonth()).length}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;">${aggregatedCounts.pneumoniaCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000;">Total</td>
              ${monthTotals.map(total => `<td style="padding: 8px; border: 1px solid #000;">${total}</td>`).join('')}
              <td style="padding: 8px; border: 1px solid #000;"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="display: flex; align-items: center; font-size: 10pt; margin-bottom: 10px;">
        <strong>Prepared By:</strong> ${userData.lastname} ${userData.firstname}
        ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
      </div>
      <div style="text-align: left; font-size: 10pt; margin-bottom: 10px;">
        <strong>Date:</strong> ${currentDate}
      </div>
    `;
  
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
        <h2 className="text-2xl font-semibold">Medical Clinic Census Preview</h2>

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

export default MedicalClinicCensus;
