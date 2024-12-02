import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const HealthCertificate = ({ isOpen, onClose, labDetails }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const imageUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && labDetails && userData) {
      generatePDF();
    }
  }, [isOpen, labDetails, userData]);

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
    }

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
      
        const age = calculateAge(labDetails.patient?.birthdate);
  
    // Create the PDF content
    const content = document.createElement('div');
    content.innerHTML = `
      <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
      <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        UNIVERSITY OF BAGUIO CLINICAL LABORATORY<br>
        Room F102,1<sup>st</sup> Floor, Commerce Building<br>
        General Luna Road., Baguio City, Philippines 2600
      </p>
      <hr style="border-top: 1px solid black; margin-top: 7px; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 2px;">
      <hr style="border-top: 1px solid black; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in; margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', Times, serif; font-size: 10pt; margin-top: 0; margin-left: 0.5in; margin-right: 0.5in;">
        <div style="text-align: left;">Telefax No.: (074) 442-3071</div>
        <div style="text-align: center;">Website: www.ubaguio.edu</div>
        <div style="text-align: right;">E-mail Address: clinical_lab@e.ubaguio.edu</div>
      </div>

<div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
    <div style="text-align: center; margin-bottom: 2px;"><strong>CLINICAL CHEMISTRY</strong></div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
    <div><strong>Name:</strong> ${labDetails.patient?.lastname} ${labDetails.patient?.firstname} ${labDetails.patient?.middlename || ""}</div>
    <div><strong>Age:</strong> ${age} years</div>
    <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div> <!-- Wrap Date in a div for better alignment -->
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
    <div><strong>Course/Department:</strong> ${labDetails.patient?.course || labDetails.patient?.position}</div>
    <div><strong>Sex:</strong> ${labDetails.patient?.sex}</div>
    <div><strong>LabNo.:</strong> ${labDetails.labNumber || "N/A"}</div>
  </div>

  <!-- Table for Test, Results, and Reference Ranges -->
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
    <thead>
      <tr>
        <th style="border: 1px solid black; padding: 8px; text-align: left;">Test</th>
        <th style="border: 1px solid black; padding: 8px; text-align: left;">Results</th>
        <th style="border: 1px solid black; padding: 8px; text-align: left;"></th>
        <th style="border: 1px solid black; padding: 8px; text-align: left;"></th>
        <th style="border: 1px solid black; padding: 8px; text-align: left;">Reference Ranges</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">FBS</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.bloodSugar}</td> 
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"></td>
        <td style="border: 1px solid black; padding: 8px;">10 - 105 mg/dl</td>
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Total Cholesterol</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.totalCholesterol}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"></td>
        <td style="border: 1px solid black; padding: 8px;">140 - 200 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Triglycerides</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.triglyceride}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"></td>
        <td style="border: 1px solid black; padding: 8px;"><200 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Blood Uric Acid</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.bloodUricAcid}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"><strong>MEN <br> FEMALE</strong></td>
        <td style="border: 1px solid black; padding: 8px;">3.5 - 7.2 mg/dl <br> 2.6 - 6.0 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Blood Urea Nitrogen</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.bloodUreaNitrogen}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"></td>
        <td style="border: 1px solid black; padding: 8px;">4.67 - 23.35 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Creatinine</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.creatinine}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"><strong>MEN <br> FEMALE</strong></td>
        <td style="border: 1px solid black; padding: 8px;">0.7 - 1.2 mg/dl <br> 0.6 - 1.1 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">AST/SGOT</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.SGOT_AST}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> U/L </strong>
        <td style="border: 1px solid black; padding: 8px;"><strong>MEN <br> FEMALE</strong></td>
        <td style="border: 1px solid black; padding: 8px;"> UP TO 40 U/L <br> UP TO 33 U/L</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">ALT/SGPT</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.SGPT_ALT}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"><strong>MEN <br> FEMALE</strong></td>
        <td style="border: 1px solid black; padding: 8px;"> UP TO 41 U/L <br> UP TO 32 U/L</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Direct HDL</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.HDL_cholesterol}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"><strong>MEN <br> FEMALE</strong></td>
        <td style="border: 1px solid black; padding: 8px;">40 - 50 mg/dl <br> 45 - 60 mg/dl</td>      
      </tr>
      <tr>
        <td style="border: 1px solid black; padding: 8px;">Direct LDL</td>
        <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodChemistry?.LDL_cholesterol}</td>
        <td style="border: 1px solid black; padding: 8px;"><strong> mg/dl </strong>
        <td style="border: 1px solid black; padding: 8px;"></td>
        <td style="border: 1px solid black; padding: 8px;"><130 mg/dl</td>      
      </tr>
    </tbody>
  </table>
              <div style="display: flex; margin-top: 10px;">
              <strong>LAST MEAL: </strong> ________________________________________
            </div>
            <div style="display: flex; margin-top: 10px;">
              <strong>TIME OF EXTRACTION: </strong> ____________________
            </div>


    <!-- Signature Image -->
    <!-- ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''} -->

<div style="text-align: right; margin-top: 30px;">
  <!-- Signature Image -->
  
  <!-- <div>
    <strong>${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ''}</strong>, M.D.
  </div> -->
  
  <!-- License Number and Titles side by side -->
<div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-start;">
  <!-- Left Section (Medical Pathologist) -->
  <div style="text-align: left; width: 48%;">
    ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
    <strong>Name:</strong> ${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ''} <br>
    <strong>License Number:</strong> ___________________ <br>
    <div>Medical Pathologist</div>
  </div>
  
  <!-- Right Section (Clinical Technologist) -->
  <div style="text-align: left; width: 48%; text-align: right;">
    <strong>Name:</strong> ________________________ <br>
    <strong>License Number:</strong> ____________________ <br>
    <div>Clinical Technologist</div>
  </div>
</div>

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
        <h2 className="text-2xl font-semibold">Clinical Chemistry Certificate Form Preview</h2>

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

export default HealthCertificate;