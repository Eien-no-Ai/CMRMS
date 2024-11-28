import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const PTCertificate = ({ isOpen, onClose, selectedRecord, newTherapyRecord }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && selectedRecord && userData && newTherapyRecord) {
      generatePDF();
    }
  }, [isOpen, selectedRecord, userData, newTherapyRecord]);

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
  
  
  const generatePDF = async () => {

        // Compute age from birthdate
        const calculateAge = (birthdate) => {
            const birthDateObj = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const month = today.getMonth();
            if (month < birthDateObj.getMonth() || (month === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())) {
              age--;
            }
            return age;
          };
        
          const age = calculateAge(selectedRecord.patient?.birthdate);
  
    // Create the PDF content
    const content = document.createElement('div');
    content.innerHTML = `
      <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
        <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        SCHOOL OF NATURAL SCIENCES<br>
        General Luna Road., Baguio City, Philippines 2600
        </p>
        <hr style="border-top: 1px solid black; margin-top: 7px; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 2px;">
        <hr style="border-top: 1px solid black; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', Times, serif; font-size: 10pt; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in;">
        <div style="text-align: left;">Telefax No.: (074) 442-3071</div>
        <div style="text-align: center;">Website: www.ubaguio.edu</div>
        <div style="text-align: right;">E-mail Address: sns@ubaguio.edu</div>
        </div>

<div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
    <p><strong>Name: </strong> ${selectedRecord.patient?.lastname} ${selectedRecord.patient?.firstname} ${selectedRecord.patient?.middlename || ""}</p>
    <p><strong>Age: </strong> ${age || ""}</p>
    <p><strong>Sex: </strong> ${selectedRecord.patient?.sex}</p>
    <p><strong>Diagnosis: </strong> ${selectedRecord.Diagnosis}</p>
    <p><strong>Precautions: </strong> ${selectedRecord.Precautions}</p>

<table border="1" cellpadding="5" cellspacing="0" style="margin-top: 20px; width: 80%; border-collapse: collapse; margin-left: auto; margin-right: auto; text-align: center;">
    <thead>
        <tr>
            <th style="text-align: center; width: 20%;">Date</th>
            <th style="text-align: center; width: 40%;">Summary</th>
        </tr>
    </thead>
    <tbody>
        <!-- Loop through SOAP summaries -->
        ${selectedRecord.SOAPSummaries.map(summary => `
            <tr>
                <td>${new Date(summary.date).toLocaleDateString()}</td>
                <td>${summary.summary}</td>
            </tr>
        `).join('')}
    </tbody>
</table>

</div>
    `;
  
    // Use html2pdf to generate the PDF and return it as a data URL
    html2pdf()
      .from(content)
      .outputPdf('datauristring') // Get PDF as Data URL
      .then((pdfData) => {
        setPdfDataUrl(pdfData); // Set the PDF data URL for preview
      });
  };
  
  
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-2xl max-w-5xl overflow-y-auto flex flex-col justify-between relative">
        <h2 className="text-2xl font-semibold">Physical Therapy Certificate Form Preview</h2>

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

export default PTCertificate;
