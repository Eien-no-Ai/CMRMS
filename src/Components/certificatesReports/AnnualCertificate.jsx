import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";


const AnnualCertificate = ({ isOpen, onClose, patient, medicalHistory, annual }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const imageUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && patient && medicalHistory && annual && userData) {
      generatePDF();
    }
  }, [isOpen, patient, medicalHistory, annual, userData]);

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
    if (!patient || !medicalHistory) {
      console.error("Patient or medical history data is missing");
      return;
    }

    const signatureUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  
    // Fetch the image as Base64
    const base64Image = await fetchImageAsBase64(signatureUrl);
  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.warn("Signature image not found or is empty.");
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
  
    const age = calculateAge(patient.birthdate);
  
    const addressParts = [];
    if (patient?.address) addressParts.push(patient.address);
    if (patient?.city) addressParts.push(patient.city);
    if (patient?.state) addressParts.push(patient.state);
    if (patient?.postalcode) addressParts.push(patient.postalcode);
  
    const address = addressParts.join(", ");
  
    // Medical conditions
    const conditions = medicalHistory.conditions;
    const malaria = medicalHistory.malaria;
    const operations = medicalHistory.operations;
  
    // Helper function to return a checkmark in the correct column
    const getCheckmark = (condition) => condition ? '✓' : '';
  
    // Create a temporary div to hold the content
    const content = document.createElement('div');
    content.innerHTML = `

        <img src="/ub.png" width="200" height="100" style="display: block; margin-top: 0.5in; margin-left: auto; margin-right: auto;" alt="logo" />
        <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
            MEDICAL CLINIC<br>
            Upper General Luna RD., Baguio City, PHILIPPINES 2600<br>
            ANNUAL EMPLOYEE EXAMINATION FORM
        </p>



      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Name:</strong> ${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</div>
          <div><strong>Age:</strong> ${age} years</div>
          <div><strong>Sex:</strong> ${patient?.sex}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          ${address ? `<div><strong>Address:</strong> ${address}</div>` : ""}
          <div><strong>Contact No.:</strong> ${patient?.phonenumber || "N/A"}</div>
          <div><strong>Position Applied:</strong> ${patient?.position || "N/A"}</div>
        </div>
  
        <div><strong>I. FAMILY HISTORY:</strong> Has any of the applicant's family members (maternal and paternal) had any of the following diseases:</div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- First Table -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px;border: 0.1px solid black;"></th>
                        <th style="padding: 5px;border: 0.1px solid black;">Condition</th>
                        <th style="padding: 5px;border: 0.1px solid black;">Yes/No</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">1</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Heart Disease</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.heartDisease ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">2</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Hypertension</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.hypertension ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">3</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Tuberculosis</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.tuberculosis ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">4</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Diabetes</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.diabetes ? 'Yes' : 'No'}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Second Table -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px;border: 0.1px solid black;"></th>
                        <th style="padding: 5px;border: 0.1px solid black;">Condition</th>
                        <th style="padding: 5px;border: 0.1px solid black;">Yes/No</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">5</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Kidney Disease (UTI, Etc)</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.kidneyDisease ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">6</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Cancer</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.cancer ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">7</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Asthma</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.diseases.asthma ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">8</td>
                        <td style="padding: 5px;border: 0.1px solid black;">Allergy</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.familyHistory.allergies.hasAllergies ? 'Yes' : 'No'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

          <div><strong>Allergies:</strong> Yes, allergies: ${medicalHistory.familyHistory.allergies.allergyList}</div>

    <div style="margin-top: 10px;"><strong>II. PERSONAL EXAMINATION:</strong></div>

        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <!-- First Table -->
            <table border="1" style="flex: 1; margin-right: 10px; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px; text-align: left;">Question</th>
                        <th style="padding: 5px; text-align: left;">Answer</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">1. Do you smoke?</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.tobaccoUse.usesTobacco || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">A. Sticks per day</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.tobaccoUse.sticksPerDay || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">Quit Smoking</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.tobaccoUse.quitSmoking || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">Quit When</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.tobaccoUse.quitWhen || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">2. Do you drink alcoholic beverages?</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.alcoholUse.drinksAlcohol || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">A. Drinks per day</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.alcoholUse.drinksPerDay || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">Quit Drinking</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.alcoholUse.quitDrinking || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">Quit When</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.alcoholUse.quitWhen || ''}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Second Table -->
            <table border="1" style="flex: 1; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px; text-align: left;">Question</th>
                        <th style="padding: 5px; text-align: left;">Answer</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">3. Are you pregnant?</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.forWomen.pregnant || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">A. Month</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.forWomen.months || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">B. Last Menstrual Period</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.forWomen.lastMenstrualPeriod || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">C. Abortion/Miscarriage</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.forWomen.abortionOrMiscarriage || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;border: 0.1px solid black;">D. Dysmenorrhea</td>
                        <td style="padding: 5px;border: 0.1px solid black;">${medicalHistory.personalHistory.forWomen.dysmenorrhea || ''}</td>
                    </tr>
                </tbody>
            </table>
        </div>

                      <div className="text-sm font-semibold text-gray-700" style="margin-top: 20px;">                      
                        I hereby certify that the foregoing answers are true and complete to the best of my knowledge. My health status is accurately represented in the above statements. I understand the University of Baguio may require me to have physical examination and I authorize the release of any information from such examination to UB personnel for use in considering my employment.
                    </div>

<div style="text-align: right; margin-top: 20px;">
  <strong>${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</strong>
</div>
        <strong>III. PHYSICAL EXAMINATION:</strong> 

        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <!-- First Table: Basic Measurements -->
        <table border="1" style="flex: 1; margin-right: 10px; border-collapse: collapse;">
            <thead>
            <tr>
                <th style="padding: 5px; text-align: left;"></th>
                <th style="padding: 5px; text-align: left;"></th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Date Examined</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.dateExamined}</td></tr>
            <td style="padding: 5px;border: 0.1px solid black;">Blood Pressure</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.bloodPressure}</td></tr>
                        <tr><td colspan="2" style="height: 1in;"></td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Pulse Rate</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.pulseRate}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Respiration Rate</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.respirationRate}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Height</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.height}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Weight</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.weight}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">BMI</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.bmi}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Waist Line</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.wasteLine}</td></tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Hip Line</td><td style="padding: 5px;border: 0.1px solid black;">${annual.changes.hipLine}</td></tr>
            </tbody>
        </table>
        </div>
            
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <!-- First Table for Findings -->
        <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
            <tr>
                <th style="padding: 5px;border: 0.1px solid black;">Body</th>
                <th style="padding: 5px;border: 0.1px solid black;">Normal</th>
                <th style="padding: 5px;border: 0.1px solid black;">Abnormal</th>
                <th style="padding: 5px;border: 0.1px solid black;">Remarks</th>
            </tr>
            </thead>
            <tbody>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Skin</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.skin.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.skin.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.skin.type) && annual.abnormalFindings.skin.remarks ? annual.abnormalFindings.skin.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Head/Neck/Scalp</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.headNeckScalp.type) && annual.abnormalFindings.headNeckScalp.remarks ? annual.abnormalFindings.headNeckScalp.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Eyes/External</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.eyesExternal.type) && annual.abnormalFindings.eyesExternal.remarks ? annual.abnormalFindings.eyesExternal.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Ears</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.ears.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.ears.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.ears.type) && annual.abnormalFindings.ears.remarks ? annual.abnormalFindings.ears.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Face/Sinuses</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.face.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.face.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.face.type) && annual.abnormalFindings.face.remarks ? annual.abnormalFindings.face.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Neck/Thyroid</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.neckThyroid.type) && annual.abnormalFindings.neckThyroid.remarks ? annual.abnormalFindings.neckThyroid.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Chest/Breasts/Axilla</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) && annual.abnormalFindings.chestBreastsAxilla.remarks ? annual.abnormalFindings.chestBreastsAxilla.remarks : ''}</td>
            </tr>
            </tbody>
        </table>

        <!-- Second Table for Findings -->
        <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
            <tr>
                <th style="padding: 5px;border: 0.1px solid black;">Body</th>
                <th style="padding: 5px;border: 0.1px solid black;">Normal</th>
                <th style="padding: 5px;border: 0.1px solid black;">Abnormal</th>
                <th style="padding: 5px;border: 0.1px solid black;">Remarks</th>
            </tr>
            </thead>
            <tbody>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Lungs</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.lungs.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.lungs.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.lungs.type) && annual.abnormalFindings.lungs.remarks ? annual.abnormalFindings.lungs.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Heart</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.heart.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.heart.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.heart.type) && annual.abnormalFindings.heart.remarks ? annual.abnormalFindings.heart.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Abdomen</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.abdomen.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.abdomen.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.abdomen.type) && annual.abnormalFindings.abdomen.remarks ? annual.abnormalFindings.abdomen.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Back</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.back.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.back.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.back.type) && annual.abnormalFindings.back.remarks ? annual.abnormalFindings.back.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">G-U System</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.guSystem.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.guSystem.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.guSystem.type) && annual.abnormalFindings.guSystem.remarks ? annual.abnormalFindings.guSystem.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Inguinal/Genitals</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.inguinalGenitals.type) && annual.abnormalFindings.inguinalGenitals.remarks ? annual.abnormalFindings.inguinalGenitals.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;border: 0.1px solid black;">Extremeties</td>
                <td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(annual.abnormalFindings.extremities.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.extremities.type) ? '✔' : ''}</td>
                <td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(annual.abnormalFindings.extremities.type) && annual.abnormalFindings.extremities.remarks ? annual.abnormalFindings.extremities.remarks : ''}</td>
            </tr>
            </tbody>
        </table>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 0.5in;" ><strong>IV. LABORATORY EXAMINATION:</strong></div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5in;">
        <!-- First Table Column -->
        <div style="flex: 1; margin-right: 15px;">
            <div><strong>1. Chest X-Ray:</strong> ${annual.labExam.chestXray}</div>
            <div><strong>2. Urinalysis:</strong> ${annual.labExam.urinalysis} years</div>
        </div>

        <!-- Second Table Column -->
        <div style="flex: 1;">
            <div><strong>3. Complete Blood Count:</strong> ${annual.labExam.completeBloodCount}</div>
            <div><strong>4. Fecalysis:</strong> ${annual.labExam.fecalysis} years</div>
        </div>
        </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5in;" ><strong>V. MEDICATIONS:</strong></div>
          <div> ${annual.others.medications}</div>

                  <div style="display: flex; justify-content: space-between;" ><strong>VI. REMARKS/RECOMMENDATIONS:</strong></div>
          <div> ${annual.others.remarksRecommendations}</div>

<div style="display: flex; justify-content: flex-end; align-items: center; font-size: 9pt; margin-top: 1in;">
  <strong>Medical Examiner: </strong> ${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ""} 
  ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-left: 10px;" />` : ''}
</div>


      </div>
`;
  
    // Use html2pdf to generate the PDF and return it as a data URL
    html2pdf()
      .from(content)
      .outputPdf('datauristring') // Get PDF as Data URL
      .then((pdfData) => {
        // Set the PDF data URL for preview
        setPdfDataUrl(pdfData);
      });
  };
    
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-4 px-6 rounded-lg w-4/5 h-4/5 shadow-2xl max-w-5xl overflow-y-auto flex flex-col justify-between relative">
        <h2 className="text-2xl font-semibold">Annual Employee Examination Form Preview</h2>

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

export default AnnualCertificate;