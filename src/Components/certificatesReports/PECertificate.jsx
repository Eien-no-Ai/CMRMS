import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";


const PECertificate = ({ isOpen, onClose, patient, medicalHistory, physicalExamStudent }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage

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

  const generatePDF = () => {
    if (!patient || !medicalHistory) {
      console.error("Patient or medical history data is missing");
      return;
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
        Upper General Luna RD., Baguio City, PHILIPPINES 2600
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
          <div><strong>Course:</strong> ${patient?.course || "N/A"}</div>
        </div>
  
        <div><strong>I. MEDICAL HISTORY:</strong> Has the applicant suffered from, or been told he has any of the following conditions:</div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <!-- First Table -->
          <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 5px;">#</th>
                <th style="padding: 5px;">Condition</th>
                <th style="padding: 5px;">Yes</th>
                <th style="padding: 5px;">No</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 5px;">1</td><td style="padding: 5px;">Nose or throat disorders</td><td style="padding: 5px;">${getCheckmark(conditions.noseThroatDisorders)}</td><td style="padding: 5px;">${getCheckmark(!conditions.noseThroatDisorders)}</td></tr>
              <tr><td style="padding: 5px;">2</td><td style="padding: 5px;">Ear trouble / deafness</td><td style="padding: 5px;">${getCheckmark(conditions.earTrouble)}</td><td style="padding: 5px;">${getCheckmark(!conditions.earTrouble)}</td></tr>
              <tr><td style="padding: 5px;">3</td><td style="padding: 5px;">Asthma</td><td style="padding: 5px;">${getCheckmark(conditions.asthma)}</td><td style="padding: 5px;">${getCheckmark(!conditions.asthma)}</td></tr>
              <tr><td style="padding: 5px;">4</td><td style="padding: 5px;">Tuberculosis</td><td style="padding: 5px;">${getCheckmark(conditions.tuberculosis)}</td><td style="padding: 5px;">${getCheckmark(!conditions.tuberculosis)}</td></tr>
              <tr><td style="padding: 5px;">5</td><td style="padding: 5px;">Other lung diseases</td><td style="padding: 5px;">${getCheckmark(conditions.lungDiseases)}</td><td style="padding: 5px;">${getCheckmark(!conditions.lungDiseases)}</td></tr>
              <tr><td style="padding: 5px;">6</td><td style="padding: 5px;">High Blood Pressure</td><td style="padding: 5px;">${getCheckmark(conditions.highBloodPressure)}</td><td style="padding: 5px;">${getCheckmark(!conditions.highBloodPressure)}</td></tr>
              <tr><td style="padding: 5px;">7</td><td style="padding: 5px;">Heart diseases</td><td style="padding: 5px;">${getCheckmark(conditions.heartDiseases)}</td><td style="padding: 5px;">${getCheckmark(!conditions.heartDiseases)}</td></tr>
              <tr><td style="padding: 5px;">8</td><td style="padding: 5px;">Rheumatic Fever</td><td style="padding: 5px;">${getCheckmark(conditions.rheumaticFever)}</td><td style="padding: 5px;">${getCheckmark(!conditions.rheumaticFever)}</td></tr>
              <tr><td style="padding: 5px;">9</td><td style="padding: 5px;">Diabetes Mellitus</td><td style="padding: 5px;">${getCheckmark(conditions.diabetesMellitus)}</td><td style="padding: 5px;">${getCheckmark(!conditions.diabetesMellitus)}</td></tr>
              <tr><td style="padding: 5px;">10</td><td style="padding: 5px;">Endocrine Disorder</td><td style="padding: 5px;">${getCheckmark(conditions.endocrineDisorder)}</td><td style="padding: 5px;">${getCheckmark(!conditions.endocrineDisorder)}</td></tr>
              <tr><td style="padding: 5px;">11</td><td style="padding: 5px;">Cancer/Tumor</td><td style="padding: 5px;">${getCheckmark(conditions.cancerTumor)}</td><td style="padding: 5px;">${getCheckmark(!conditions.cancerTumor)}</td></tr>
              <tr><td style="padding: 5px;">12</td><td style="padding: 5px;">Mental Disorder/Depression</td><td style="padding: 5px;">${getCheckmark(conditions.mentalDisorder)}</td><td style="padding: 5px;">${getCheckmark(!conditions.mentalDisorder)}</td></tr>
              <tr><td style="padding: 5px;">13</td><td style="padding: 5px;">Head or neck injury</td><td style="padding: 5px;">${getCheckmark(conditions.headNeckInjury)}</td><td style="padding: 5px;">${getCheckmark(!conditions.headNeckInjury)}</td></tr>
              <tr><td style="padding: 5px;">14</td><td style="padding: 5px;">Hernia</td><td style="padding: 5px;">${getCheckmark(conditions.hernia)}</td><td style="padding: 5px;">${getCheckmark(!conditions.hernia)}</td></tr>
              <tr><td style="padding: 5px;">15</td><td style="padding: 5px;">Rheumatism, joint or back pain</td><td style="padding: 5px;">${getCheckmark(conditions.rheumatismJointPain)}</td><td style="padding: 5px;">${getCheckmark(!conditions.rheumatismJointPain)}</td></tr>
              <tr><td style="padding: 5px;">16</td><td style="padding: 5px;">Eye disorders</td><td style="padding: 5px;">${getCheckmark(conditions.eyeDisorders)}</td><td style="padding: 5px;">${getCheckmark(!conditions.eyeDisorders)}</td></tr>
            </tbody>
          </table>
          
          <!-- Second Table -->
          <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 5px;">#</th>
                <th style="padding: 5px;">Condition</th>
                <th style="padding: 5px;">Yes</th>
                <th style="padding: 5px;">No</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 5px;">17</td><td style="padding: 5px;">Stomach pain / ulcer</td><td style="padding: 5px;">${getCheckmark(conditions.stomachPainUlcer)}</td><td style="padding: 5px;">${getCheckmark(!conditions.stomachPainUlcer)}</td></tr>
              <tr><td style="padding: 5px;">18</td><td style="padding: 5px;">Other abdominal disorders</td><td style="padding: 5px;">${getCheckmark(conditions.abdominalDisorders)}</td><td style="padding: 5px;">${getCheckmark(!conditions.abdominalDisorders)}</td></tr>
              <tr><td style="padding: 5px;">19</td><td style="padding: 5px;">Kidney or bladder diseases</td><td style="padding: 5px;">${getCheckmark(conditions.kidneyBladderDiseases)}</td><td style="padding: 5px;">${getCheckmark(!conditions.kidneyBladderDiseases)}</td></tr>
              <tr><td style="padding: 5px;">20</td><td style="padding: 5px;">Sexually Transmitted Diseases (STDs)</td><td style="padding: 5px;">${getCheckmark(conditions.std)}</td><td style="padding: 5px;">${getCheckmark(!conditions.std)}</td></tr>
              <tr><td style="padding: 5px;">21</td><td style="padding: 5px;">Genetic or Familial disorder</td><td style="padding: 5px;">${getCheckmark(conditions.familialDisorder)}</td><td style="padding: 5px;">${getCheckmark(!conditions.familialDisorder)}</td></tr>
              <tr><td style="padding: 5px;">22</td><td style="padding: 5px;">Tropical Diseases</td><td style="padding: 5px;">${getCheckmark(conditions.tropicalDiseases)}</td><td style="padding: 5px;">${getCheckmark(!conditions.tropicalDiseases)}</td></tr>
              <tr><td style="padding: 5px;">23</td><td style="padding: 5px;">Chronic cough</td><td style="padding: 5px;">${getCheckmark(conditions.chronicCough)}</td><td style="padding: 5px;">${getCheckmark(!conditions.chronicCough)}</td></tr>
              <tr><td style="padding: 5px;">24</td><td style="padding: 5px;">Fainting or seizures</td><td style="padding: 5px;">${getCheckmark(conditions.faintingSeizures)}</td><td style="padding: 5px;">${getCheckmark(!conditions.faintingSeizures)}</td></tr>
              <tr><td style="padding: 5px;">25</td><td style="padding: 5px;">Frequent headache</td><td style="padding: 5px;">${getCheckmark(conditions.frequentHeadache)}</td><td style="padding: 5px;">${getCheckmark(!conditions.frequentHeadache)}</td></tr>
              <tr><td style="padding: 5px;">26</td><td style="padding: 5px;">Dizziness</td><td style="padding: 5px;">${getCheckmark(conditions.dizziness)}</td><td style="padding: 5px;">${getCheckmark(!conditions.dizziness)}</td></tr>
              <tr><td style="padding: 5px;">27</td><td style="padding: 5px;">Malaria</td><td style="padding: 5px;">${getCheckmark(malaria.hasMalaria === "Yes")}</td><td style="padding: 5px;">${getCheckmark(malaria.hasMalaria !== "Yes")}</td></tr>
              <tr><td style="padding: 5px;">28</td><td style="padding: 5px;">Operations</td><td style="padding: 5px;">${getCheckmark(operations.undergoneOperation === "Yes")}</td><td style="padding: 5px;">${getCheckmark(operations.undergoneOperation !== "Yes")}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Malaria section -->
        ${malaria.hasMalaria === 'Yes' ? `
          <div><strong>Malaria:</strong> Yes (Last attack on: ${malaria.lastAttackDate})</div>
        ` : ""}
  
        <!-- Operations section -->
        ${operations.undergoingOperation === 'Yes' ? `
          <div><strong>Operations:</strong> Yes, operations undergone: ${operations.listOperations}</div>
        ` : ""}

                      <div className="text-sm font-semibold text-gray-700" style="margin-top: 20px;">                      
                      I hereby certify that all the information I have disclosed
                      as reflected in this report are true to the best of my
                      knowledge and belief and that any misrepresentation or
                      concealment on my part may lead to consequences, which may
                      or may not include disqualification, etc.
                      <br />
                      <br />
                      I hereby authorize UB Medical-Dental Clinic and its
                      officially designated examining physicians and staff to
                      conduct the examinations necessary to assess my fitness to
                      undergo Internship/On-the-Job Training/Practicum.
                      <br />
                      <br />
                      By signing this, I hold UB Medical-Dental Clinic and its
                      authorized physicians and staff free from any criminal,
                      civil, administrative, ethical, and moral liability, that
                      may arise from the above.
                    </div>

        <hr style="border-top: 1px solid black; width: 300px; margin-top: 0.5in; margin-left: auto; margin-right: 0;">

          <div style="margin-top: 1in;">
            <strong>II. PHYSICAL EXAMINATION:</strong> To be completed by examining physician:
          </div>
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
                <tr><td style="padding: 5px;">Temperature</td><td style="padding: 5px;">${physicalExamStudent.temperature}</td></tr>
                <tr><td style="padding: 5px;">Blood Pressure</td><td style="padding: 5px;">${physicalExamStudent.bloodPressure}</td></tr>
                <tr><td style="padding: 5px;">Pulse Rate</td><td style="padding: 5px;">${physicalExamStudent.pulseRate}</td></tr>
                <tr><td style="padding: 5px;">Respiration Rate</td><td style="padding: 5px;">${physicalExamStudent.respirationRate}</td></tr>
              </tbody>
            </table>
            
            <!-- Second Table: Body Measurements -->
            <table border="1" style="flex: 1; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 5px; text-align: left;"></th>
                  <th style="padding: 5px; text-align: left;"></th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 5px;">Height</td><td style="padding: 5px;">${physicalExamStudent.height}</td></tr>
                <tr><td style="padding: 5px;">Weight</td><td style="padding: 5px;">${physicalExamStudent.weight}</td></tr>
                <tr><td style="padding: 5px;">Body Built</td><td style="padding: 5px;">${physicalExamStudent.bodyBuilt}</td></tr>
                <tr><td style="padding: 5px;">Visual Acuity</td><td style="padding: 5px;">${physicalExamStudent.visualAcuity}</td></tr>
              </tbody>
            </table>
          </div>
                
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- First Table for Findings -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 5px;">Body</th>
                  <th style="padding: 5px;">Yes</th>
                  <th style="padding: 5px;">No</th>
                  <th style="padding: 5px;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 5px;">Head/Neck/Scalp</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.headNeckScalp.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Eyes/External</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.eyesExternal.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Pupils</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.pupils.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.pupils.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.pupils.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Ears</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.ears.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.ears.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.ears.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Nose/Sinuses</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.noseSinuses.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.noseSinuses.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.noseSinuses.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Mouth/Throat</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.mouthThroat.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.mouthThroat.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.mouthThroat.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Neck/Thyroid</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.neckThyroid.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Last Menstrual Period</td><td style="padding: 5px;" colspan="3">${physicalExamStudent.LMP ? new Date(physicalExamStudent.LMP).toLocaleDateString() : ''}</td></tr>
              </tbody>
            </table>

            <!-- Second Table for Findings -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 5px;">Body</th>
                  <th style="padding: 5px;">Yes</th>
                  <th style="padding: 5px;">No</th>
                  <th style="padding: 5px;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 5px;">Chest/Breasts/Axilla</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.chestBreastsAxilla.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Lungs</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.lungs.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.lungs.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.lungs.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Heart</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.heart.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.heart.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.heart.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Abdomen</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.abdomen.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.abdomen.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.abdomen.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Back</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.back.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.back.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.back.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Anus/Rectum</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.anusRectum.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.anusRectum.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.anusRectum.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Urinary</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.urinary.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.urinary.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.urinary.remarks || ''}</td></tr>
                <tr><td style="padding: 5px;">Inguinal/Genitals</td><td style="padding: 5px;">${getCheckmark(physicalExamStudent.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td><td style="padding: 5px;">${!getCheckmark(physicalExamStudent.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td><td style="padding: 5px;">${physicalExamStudent.abnormalFindings.inguinalGenitals.remarks || ''}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="border: 1px solid #000; padding: 10px; margin-top: 50px; border-radius: 5px;">
          <img src="/ub.png" width="200" height="100" style="display: block; margin-left: auto; margin-right: auto;" alt="logo" />

            <div style="text-align: center; margin-bottom: 20px;">              
              <strong>Remarks:</strong>_______________________________________________________
            </div>
            <div>
              This is to certify that <strong> ${patient?.lastname} ${patient?.firstname} ${patient?.middlename || ""}</strong> has been examined and found to be physically fit at the time of examination
            </div>

            <div style="display: flex; margin-top: 20px;">
              <strong>Examining Physician: </strong> ${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ""} ____________________
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

export default PECertificate;
