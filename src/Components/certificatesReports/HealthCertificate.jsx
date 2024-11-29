import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const HealthCertificate = ({ isOpen, onClose, patient }) => {
  const [userData, setUserData] = useState({});
  const [remarks, setRemarks] = useState("");
  const [bp, setBp] = useState("");
  const [pr, setPr] = useState("");
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const imageUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && patient && userData) {
      generatePDF();
    }
  }, [isOpen, patient, userData, remarks, bp, pr]);

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
  
    // Create the PDF content
    const content = document.createElement('div');
    content.innerHTML = `
      <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
      <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        MEDICAL CLINIC<br>
        Upper General Luna RD., Baguio City, PHILIPPINES 2600
      </p>
      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="text-align: right; margin-bottom: 15px;">
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </div>
        <div style="text-align: center; font-size: 14pt; margin-bottom: 15px;">
          <strong>HEALTH CERTIFICATE</strong>
        </div>
        <div style="text-align: left; margin-bottom: 15px;">
          <strong>TO WHOM IT MAY CONCERN:</strong>
        </div>
        <div style="margin-left: 30px; margin-bottom: 15px;">
          <p>This is to certify that <strong>${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</strong> has been examined and found to be physically and mentally fit upon examination.</p>
        </div>
        <div style="margin-left: 30px; margin-bottom: 15px;">
          <p>This certification is issued upon the request of the above person for any purpose it may serve.</p>
        </div>
        <div style="display: flex; margin-bottom: 15px;">
          <strong>Remarks:</strong> ${remarks}
        </div>
        <div style="display: flex; margin-bottom: 15px;">
          <strong>BP:</strong> ${bp}
        </div>
        <div style="display: flex; margin-bottom: 15px;">
          <strong>PR:</strong> ${pr}
        </div>
        <div style="text-align: right; margin-top: 30px;">
          <!-- Signature Image -->
        <img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; display: block; margin-left: auto; margin-right: 0;" />          
        <strong>${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ''}</strong>, M.D.
        </div>
        <div style="text-align: right; margin-top: 5px;">
          University Physician
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
        <h2 className="text-2xl font-semibold">Health Certificate Form Preview</h2>

        {/* Input fields for Remarks, BP, and PR */}
        <div className="my-4">
          <div>
            <label className="block text-sm font-medium mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
             />
          </div>

          <div className="flex space-x-4 mb-4">
  <div className="flex-1">
    <label className="block text-sm font-medium mb-2">BP (Blood Pressure)</label>
    <input
      type="text"
      value={bp}
      onChange={(e) => setBp(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>

  <div className="flex-1">
    <label className="block text-sm font-medium mb-2">PR (Pulse Rate)</label>
    <input
      type="text"
      value={pr}
      onChange={(e) => setPr(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
</div>

        </div>

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