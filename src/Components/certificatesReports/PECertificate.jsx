import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";


const PECertificate = ({ isOpen, onClose, patient, medicalHistory, physicalExamStudent }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const imageUrl = `http://localhost:3001/uploads/${userData?.signature}`;
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && patient && medicalHistory && physicalExamStudent && userData) {
      generatePDF();
    }
  }, [isOpen, patient, medicalHistory, physicalExamStudent, userData]);

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
        PHYSICAL EXAMINATION FORM
      </p>


      <div style="margin: 0.5in; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Name:</strong> ${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</div>
          <div><strong>Age:</strong> ${age} years</div>
          <div><strong>Sex:</strong> ${patient?.sex}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          ${address ? `<div><strong>Address:</strong> ${address}</div>` : ""}
          <div><strong>Contact No.:</strong> ${patient?.phonenumber || "N/A"}</div>
          <div><strong>Course:</strong> ${patient?.course || "N/A"}</div>
        </div>

  
        <div><strong>I. MEDICAL HISTORY:</strong> Has the applicant suffered from, or been told he has any of the following conditions:</div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <!-- First Table -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              
            <thead>
              <tr>
                <th style="padding: 5px;border: 0.1px solid black;">#</th>
                <th style="padding: 5px;border: 0.1px solid black;">Condition</th>
                <th style="padding: 5px;border: 0.1px solid black;">Yes</th>
                <th style="padding: 5px;border: 0.1px solid black;">No</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 5px;border: 0.1px solid black;">1</td><td style="padding: 5px;border: 0.1px solid black;">Nose or throat disorders</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.noseThroatDisorders)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.noseThroatDisorders)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">2</td><td style="padding: 5px;border: 0.1px solid black;">Ear trouble / deafness</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.earTrouble)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.earTrouble)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">3</td><td style="padding: 5px;border: 0.1px solid black;">Asthma</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.asthma)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.asthma)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">4</td><td style="padding: 5px;border: 0.1px solid black;">Tuberculosis</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.tuberculosis)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.tuberculosis)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">5</td><td style="padding: 5px;border: 0.1px solid black;">Other lung diseases</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.lungDiseases)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.lungDiseases)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">6</td><td style="padding: 5px;border: 0.1px solid black;">High Blood Pressure</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.highBloodPressure)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.highBloodPressure)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">7</td><td style="padding: 5px;border: 0.1px solid black;">Heart diseases</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.heartDiseases)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.heartDiseases)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">8</td><td style="padding: 5px;border: 0.1px solid black;">Rheumatic Fever</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.rheumaticFever)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.rheumaticFever)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">9</td><td style="padding: 5px;border: 0.1px solid black;">Diabetes Mellitus</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.diabetesMellitus)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.diabetesMellitus)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">10</td><td style="padding: 5px;border: 0.1px solid black;">Endocrine Disorder</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.endocrineDisorder)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.endocrineDisorder)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">11</td><td style="padding: 5px;border: 0.1px solid black;">Cancer/Tumor</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.cancerTumor)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.cancerTumor)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">12</td><td style="padding: 5px;border: 0.1px solid black;">Mental Disorder/Depression</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.mentalDisorder)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.mentalDisorder)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">13</td><td style="padding: 5px;border: 0.1px solid black;">Head or neck injury</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.headNeckInjury)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.headNeckInjury)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">14</td><td style="padding: 5px;border: 0.1px solid black;">Hernia</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.hernia)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.hernia)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">15</td><td style="padding: 5px;border: 0.1px solid black;">Rheumatism, joint or back pain</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.rheumatismJointPain)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.rheumatismJointPain)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">16</td><td style="padding: 5px;border: 0.1px solid black;">Eye disorders</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.eyeDisorders)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.eyeDisorders)}</td></tr>
            </tbody>
          </table>
          
          <!-- Second Table -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              
            <thead>
              <tr>
                <th style="padding: 5px;border: 0.1px solid black;">#</th>
                <th style="padding: 5px;border: 0.1px solid black;">Condition</th>
                <th style="padding: 5px;border: 0.1px solid black;">Yes</th>
                <th style="padding: 5px;border: 0.1px solid black;">No</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 5px;border: 0.1px solid black;">17</td><td style="padding: 5px;border: 0.1px solid black;">Stomach pain / ulcer</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.stomachPainUlcer)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.stomachPainUlcer)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">18</td><td style="padding: 5px;border: 0.1px solid black;">Other abdominal disorders</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.abdominalDisorders)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.abdominalDisorders)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">19</td><td style="padding: 5px;border: 0.1px solid black;">Kidney or bladder diseases</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.kidneyBladderDiseases)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.kidneyBladderDiseases)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">20</td><td style="padding: 5px;border: 0.1px solid black;">Sexually Transmitted Diseases (STDs)</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.std)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.std)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">21</td><td style="padding: 5px;border: 0.1px solid black;">Genetic or Familial disorder</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.familialDisorder)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.familialDisorder)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">22</td><td style="padding: 5px;border: 0.1px solid black;">Tropical Diseases</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.tropicalDiseases)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.tropicalDiseases)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">23</td><td style="padding: 5px;border: 0.1px solid black;">Chronic cough</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.chronicCough)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.chronicCough)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">24</td><td style="padding: 5px;border: 0.1px solid black;">Fainting or seizures</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.faintingSeizures)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.faintingSeizures)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">25</td><td style="padding: 5px;border: 0.1px solid black;">Frequent headache</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.frequentHeadache)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.frequentHeadache)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">26</td><td style="padding: 5px;border: 0.1px solid black;">Dizziness</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(conditions.dizziness)}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(!conditions.dizziness)}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">27</td><td style="padding: 5px;border: 0.1px solid black;">Malaria</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(malaria.hasMalaria === "Yes")}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(malaria.hasMalaria !== "Yes")}</td></tr>
              <tr><td style="padding: 5px;border: 0.1px solid black;">28</td><td style="padding: 5px;border: 0.1px solid black;">Operations</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(operations.undergoneOperation === "Yes")}</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(operations.undergoneOperation !== "Yes")}</td></tr>
            </tbody>
          </table>
        </div>

          <div><strong>Malaria:</strong> Yes (Last attack on: ${malaria.lastAttackDate})</div>
  
          <div><strong>Operations:</strong> Yes, operations undergone: ${operations.listOperations}</div>

                      <div className="text-sm font-semibold text-gray-700" style="margin-top: 20px;">                      
                      I hereby certify that all the information I have disclosed
                      as reflected in this report are true to the best of my
                      knowledge and belief and that any misrepresentation or
                      concealment on my part may lead to consequences, which may
                      or may not include disqualification, etc.
                      <br />
                      I hereby authorize UB Medical-Dental Clinic and its
                      officially designated examining physicians and staff to
                      conduct the examinations necessary to assess my fitness to
                      undergo Internship/On-the-Job Training/Practicum.
                      <br />
                      By signing this, I hold UB Medical-Dental Clinic and its
                      authorized physicians and staff free from any criminal,
                      civil, administrative, ethical, and moral liability, that
                      may arise from the above.
                    </div>

<div style="text-align: right; margin-top: 20px;">
  <strong>${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</strong>
</div>


          <div style="margin-top: 1in;">
            <strong>II. PHYSICAL EXAMINATION:</strong> To be completed by examining physician:
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <!-- First Table: Basic Measurements -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              

              <tbody>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Temperature</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.temperature}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Blood Pressure</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.bloodPressure}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Pulse Rate</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.pulseRate}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Respiration Rate</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.respirationRate}</td></tr>
              </tbody>
            </table>
            
            <!-- Second Table: Body Measurements -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              
              <tbody>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Height</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.height}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Weight</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.weight}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Body Built</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.bodyBuilt}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Visual Acuity</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.visualAcuity}</td></tr>
              </tbody>
            </table>
          </div>
                
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- First Table for Findings -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              
<thead>
                <tr>
        <th style="padding: 10px; border: 0.5px solid black;">Body</th>
        <th style="padding: 10px; border: 0.5px solid black;">Yes</th>
        <th style="padding: 10px; border: 0.5px solid black;">No</th>
        <th style="padding: 10px; border: 0.5px solid black;">Remarks</th>                
        </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Head/Neck/Scalp</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.headNeckScalp.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Eyes/External</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.eyesExternal.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Pupils</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.pupils.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.pupils.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.pupils.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Ears</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.ears.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.ears.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.ears.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Nose/Sinuses</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.noseSinuses.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.noseSinuses.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.noseSinuses.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Mouth/Throat</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.mouthThroat.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.mouthThroat.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.mouthThroat.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Neck/Thyroid</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.neckThyroid.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Last Menstrual Period</td><td style="padding: 5px;border: 0.1px solid black;" colspan="3">${physicalExamStudent.LMP ? new Date(physicalExamStudent.LMP).toLocaleDateString() : ''}</td></tr>
              </tbody>
            </table>

            <!-- Second Table for Findings -->
<table border="1" style="width: 48%; border-collapse: collapse; border: 0.5px solid black;">              
              <thead>
                <tr>
        <th style="padding: 10px; border: 0.5px solid black;">Body</th>
        <th style="padding: 10px; border: 0.5px solid black;">Yes</th>
        <th style="padding: 10px; border: 0.5px solid black;">No</th>
        <th style="padding: 10px; border: 0.5px solid black;">Remarks</th>                
        </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Chest/Breasts/Axilla</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.chestBreastsAxilla.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Lungs</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.lungs.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.lungs.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.lungs.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Heart</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.heart.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.heart.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.heart.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Abdomen</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.abdomen.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.abdomen.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.abdomen.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Back</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.back.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.back.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.back.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Anus/Rectum</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.anusRectum.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.anusRectum.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.anusRectum.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Urinary</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.urinary.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.urinary.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.urinary.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;border: 0.1px solid black;">Inguinal/Genitals</td><td style="padding: 5px;border: 0.1px solid black;">${getCheckmark(physicalExamStudent.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${!getCheckmark(physicalExamStudent.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td><td style="padding: 5px;border: 0.1px solid black;">${physicalExamStudent.abnormalFindings.inguinalGenitals.remarks || ''}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="border: 1px solid #000; padding: 10px; margin-top: 50px; border-radius: 5px;">
          <img src="/ub.png" width="200" height="100" style="display: block; margin-left: auto; margin-right: auto;" alt="logo" />

            <div style="text-align: center; margin-bottom: 20px; margin-top: 30px;">              
              <strong>Remarks:</strong>_______________________________________________________
            </div>
            <div>
              This is to certify that <strong> ${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</strong> has been examined and found to be physically fit at the time of examination
            </div>

            <div style="display: flex; align-items: center; font-size: 9pt; margin-bottom: 10px;">
                    <strong>Examining Physician: </strong> ${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ""} 
              ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
            </div>
            <div style="display: flex; margin-top: 10px;">
              <strong>License No.: </strong> ____________________
            </div>
            <div style="display: flex; margin-top: 10px;">
              <strong>Date: </strong> ${new Date().toLocaleDateString()}
            </div>
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
        <h2 className="text-2xl font-semibold">Physical Examination Form Preview</h2>

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

export default PECertificate;