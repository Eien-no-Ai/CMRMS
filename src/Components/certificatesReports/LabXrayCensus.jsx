import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const LabXrayCensus = ({ isOpen, onClose, xrayRecords, fromMonthYear, toMonthYear}) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const imageUrl = `https://cmrms-full.onrender.com/uploads/${userData?.signature}`;


  useEffect(() => {
    if (isOpen && xrayRecords && userData && fromMonthYear && toMonthYear) {
      generatePDF();
    }
  }, [isOpen, xrayRecords, fromMonthYear, toMonthYear]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`https://cmrms-full.onrender.com/user/${userId}`)
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
    const signatureUrl = `https://cmrms-full.onrender.com/uploads/${userData?.signature}`;
  
    // Fetch the image as Base64
    const base64Image = await fetchImageAsBase64(signatureUrl);
  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.warn("Signature image not found or is empty.");
    }
  
    const content = document.createElement('div');
  
    // List of X-ray descriptions to count
    const xrayTypes = [
      "CHEST PA", "SKULL", "CERVICAL", "PANORAMIC", "TLV/LSV", 
      "PELVIS", "UPPER EXTREMITIES", "LOWER EXTREMITIES", 
      "LATERAL CEPHALOMETRIC", "PERIAPICAL", "TMJ"
    ];
  
    // Collect month counts for each X-ray type
    const monthCounts = {};
  
    // Loop through each month in the range from fromDate to toDate
    let currentMonth = new Date(fromDate);
    while (currentMonth <= toDate) {
      const currentMonthName = currentMonth.toLocaleString('default', { month: 'long' });
  
      // Initialize the month count for this specific month
      monthCounts[currentMonthName] = {
        "CHEST PA": 0, "SKULL": 0, "CERVICAL": 0, "PANORAMIC": 0, 
        "TLV/LSV": 0, "PELVIS": 0, "UPPER EXTREMITIES": 0, "LOWER EXTREMITIES": 0, 
        "LATERAL CEPHALOMETRIC": 0, "PERIAPICAL": 0, "TMJ": 0
      };
  
      // Filter and count X-ray records for this month
      xrayRecords.forEach(record => {
        const recordDate = new Date(record.isCreatedAt); // Assuming 'isCreatedAt' field holds the record's creation date
        if (recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()) {
          // Check if the record's X-ray description matches any type
          if (xrayTypes.includes(record.xrayDescription)) {
            monthCounts[currentMonthName][record.xrayDescription]++;
          }
        }
      });
  
      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  
    const currentDate = new Date().toLocaleDateString();
  
    // Append month header and table to the content
    content.innerHTML += `
      <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
      <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 9pt;">
        UNIVERSITY OF BAGUIO CLINICAL LABORATORY<br>
        General Luna Road., Baguio City, Philippines 2600
      </p>
      <hr style="border-top: 1px solid black; margin-top: 7px; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 2px;">
      <hr style="border-top: 1px solid black; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', Times, serif; font-size: 9pt; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in;">
        <div style="text-align: left;">Telefax No.: (074) 442-3071</div>
        <div style="text-align: center;">Website: www.ubaguio.edu</div>
        <div style="text-align: right;">E-mail Address: med@ubaguio.edu</div>
      </div>
      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 9pt;">
        <div style="text-align: center;">STATISTICAL REPORT AS OF ${fromMonthYear} - ${toMonthYear}</div>
        <div style="text-align: center;">LABORATORY X-RAY CENSUS</div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 10px;">
          <thead>
            <tr>
              <th style="padding: 5px; text-align: left; border: 1px solid #000; font-size: 8pt;">X-ray Type</th>
              ${Object.keys(monthCounts).map(month => `<th style="padding: 5px; text-align: left; border: 1px solid #000; font-size: 8pt;">${month}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${xrayTypes.map(xray => {
              return `
                <tr>
                  <td style="padding: 5px; border: 1px solid #000; font-size: 8pt;">${xray}</td>
                  ${Object.keys(monthCounts).map(month => {
                    return `<td style="padding: 5px; border: 1px solid #000; font-size: 8pt;">${monthCounts[month][xray]}</td>`;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="display: flex; align-items: center; font-size: 9pt; margin-bottom: 10px;">
        <strong>Prepared By:</strong> ${userData.lastname} ${userData.firstname}
        ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
      </div>
      <div style="text-align: left; font-size: 9pt; margin-bottom: 10px;">
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
        html2canvas: { scale: 2 }, // Reduce scale for compact rendering
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

export default LabXrayCensus;
