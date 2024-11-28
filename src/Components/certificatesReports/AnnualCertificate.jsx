import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";


const AnnualCertificate = ({ isOpen, onClose, patient, medicalHistory, annual }) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage

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
          <div><strong>Position Applied:</strong> ${patient?.position || "N/A"}</div>
        </div>
  
        <div><strong>I. FAMILY HISTORY:</strong> Has any of the applicant's family members (maternal and paternal) had any of the following diseases:</div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- First Table -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px;"></th>
                        <th style="padding: 5px;">Condition</th>
                        <th style="padding: 5px;">Yes/No</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;">1</td>
                        <td style="padding: 5px;">Heart Disease</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.heartDisease ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">2</td>
                        <td style="padding: 5px;">Hypertension</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.hypertension ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">3</td>
                        <td style="padding: 5px;">Tuberculosis</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.tuberculosis ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">4</td>
                        <td style="padding: 5px;">Diabetes</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.diabetes ? 'Yes' : 'No'}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Second Table -->
            <table border="1" style="width: 48%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 5px;"></th>
                        <th style="padding: 5px;">Condition</th>
                        <th style="padding: 5px;">Yes/No</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 5px;">5</td>
                        <td style="padding: 5px;">Kidney Disease (UTI, Etc)</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.kidneyDisease ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">6</td>
                        <td style="padding: 5px;">Cancer</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.cancer ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">7</td>
                        <td style="padding: 5px;">Asthma</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.diseases.asthma ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">8</td>
                        <td style="padding: 5px;">Allergy</td>
                        <td style="padding: 5px;">${medicalHistory.familyHistory.allergies.hasAllergies ? 'Yes' : 'No'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Allergies section -->
        ${medicalHistory.familyHistory.allergies.hasAllergies === 'Yes' ? `
          <div><strong>Allergies:</strong> Yes, allergies: ${medicalHistory.familyHistory.allergies.allergyList}</div>
        ` : ""}

            <strong>II. PHYSICAL EXAMINATION:</strong>

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
                        <td style="padding: 5px;">1. Do you smoke?</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.tobaccoUse.usesTobacco || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">A. Sticks per day</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.tobaccoUse.sticksPerDay || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">Quit Smoking</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.tobaccoUse.quitSmoking || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">Quit When</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.tobaccoUse.quitWhen || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">2. Do you drink alcoholic beverages?</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.alcoholUse.drinksAlcohol || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">A. Drinks per day</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.alcoholUse.drinksPerDay || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">Quit Drinking</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.alcoholUse.quitDrinking || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">Quit When</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.alcoholUse.quitWhen || ''}</td>
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
                        <td style="padding: 5px;">3. Are you pregnant?</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.forWomen.pregnant || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">A. Month</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.forWomen.months || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">B. Last Menstrual Period</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.forWomen.lastMenstrualPeriod || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">C. Abortion/Miscarriage</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.forWomen.abortionOrMiscarriage || ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;">D. Dysmenorrhea</td>
                        <td style="padding: 5px;">${medicalHistory.personalHistory.forWomen.dysmenorrhea || ''}</td>
                    </tr>
                </tbody>
            </table>
        </div>

                      <div className="text-sm font-semibold text-gray-700" style="margin-top: 20px;">                      
                        I hereby certify that the foregoing answers are true and complete to the best of my knowledge. My health status is accurately represented in the above statements. I understand the University of Baguio may require me to have physical examination and I authorize the release of any information from such examination to UB personnel for use in considering my employment.
                    </div>

        <hr style="border-top: 1px solid black; width: 300px; margin-top: 0.5in; margin-left: auto; margin-right: 0;">

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
            <tr><td style="padding: 5px;">Year</td><td style="padding: 5px;">${annual.changes.year}</td></tr>
            <tr><td style="padding: 5px;">Blood Pressure</td><td style="padding: 5px;">${annual.changes.bloodPressure}</td></tr>
            <tr><td style="padding: 5px;">Pulse Rate</td><td style="padding: 5px;">${annual.changes.pulseRate}</td></tr>
            <tr><td style="padding: 5px;">Respiration Rate</td><td style="padding: 5px;">${annual.changes.respirationRate}</td></tr>
            <tr><td colspan="2" style="height: 1in;"></td></tr>
            <tr><td style="padding: 5px;">Height</td><td style="padding: 5px;">${annual.changes.height}</td></tr>
            <tr><td style="padding: 5px;">Weight</td><td style="padding: 5px;">${annual.changes.weight}</td></tr>
            <tr><td style="padding: 5px;">BMI</td><td style="padding: 5px;">${annual.changes.bmi}</td></tr>
            <tr><td style="padding: 5px;">Waist Line</td><td style="padding: 5px;">${annual.changes.wasteLine}</td></tr>
            <tr><td style="padding: 5px;">Hip Line</td><td style="padding: 5px;">${annual.changes.hipLine}</td></tr>
            <tr><td style="padding: 5px;">Date Examined</td><td style="padding: 5px;">${annual.changes.dateExamined}</td></tr>
            </tbody>
        </table>
        </div>
            
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <!-- First Table for Findings -->
        <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
            <tr>
                <th style="padding: 5px;">Body</th>
                <th style="padding: 5px;">Normal</th>
                <th style="padding: 5px;">Abnormal</th>
                <th style="padding: 5px;">Remarks</th>
            </tr>
            </thead>
            <tbody>
            <tr><td style="padding: 5px;">Skin</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.skin.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.skin.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.skin.type) && annual.abnormalFindings.skin.remarks ? annual.abnormalFindings.skin.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Head/Neck/Scalp</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.headNeckScalp.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.headNeckScalp.type) && annual.abnormalFindings.headNeckScalp.remarks ? annual.abnormalFindings.headNeckScalp.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Eyes/External</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.eyesExternal.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.eyesExternal.type) && annual.abnormalFindings.eyesExternal.remarks ? annual.abnormalFindings.eyesExternal.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Ears</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.ears.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.ears.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.ears.type) && annual.abnormalFindings.ears.remarks ? annual.abnormalFindings.ears.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Face/Sinuses</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.face.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.face.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.face.type) && annual.abnormalFindings.face.remarks ? annual.abnormalFindings.face.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Neck/Thyroid</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.neckThyroid.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.neckThyroid.type) && annual.abnormalFindings.neckThyroid.remarks ? annual.abnormalFindings.neckThyroid.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Chest/Breasts/Axilla</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.chestBreastsAxilla.type) && annual.abnormalFindings.chestBreastsAxilla.remarks ? annual.abnormalFindings.chestBreastsAxilla.remarks : ''}</td>
            </tr>
            </tbody>
        </table>

        <!-- Second Table for Findings -->
        <table border="1" style="width: 48%; border-collapse: collapse;">
            <thead>
            <tr>
                <th style="padding: 5px;">Body</th>
                <th style="padding: 5px;">Normal</th>
                <th style="padding: 5px;">Abnormal</th>
                <th style="padding: 5px;">Remarks</th>
            </tr>
            </thead>
            <tbody>
            <tr><td style="padding: 5px;">Lungs</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.lungs.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.lungs.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.lungs.type) && annual.abnormalFindings.lungs.remarks ? annual.abnormalFindings.lungs.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Heart</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.heart.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.heart.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.heart.type) && annual.abnormalFindings.heart.remarks ? annual.abnormalFindings.heart.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Abdomen</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.abdomen.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.abdomen.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.abdomen.type) && annual.abnormalFindings.abdomen.remarks ? annual.abnormalFindings.abdomen.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Back</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.back.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.back.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.back.type) && annual.abnormalFindings.back.remarks ? annual.abnormalFindings.back.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">G-U System</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.guSystem.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.guSystem.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.guSystem.type) && annual.abnormalFindings.guSystem.remarks ? annual.abnormalFindings.guSystem.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Inguinal/Genitals</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.inguinalGenitals.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.inguinalGenitals.type) && annual.abnormalFindings.inguinalGenitals.remarks ? annual.abnormalFindings.inguinalGenitals.remarks : ''}</td>
            </tr>
            <tr><td style="padding: 5px;">Extremeties</td>
                <td style="padding: 5px;">${!getCheckmark(annual.abnormalFindings.extremities.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.extremities.type) ? '✔' : ''}</td>
                <td style="padding: 5px;">${getCheckmark(annual.abnormalFindings.extremities.type) && annual.abnormalFindings.extremities.remarks ? annual.abnormalFindings.extremities.remarks : ''}</td>
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

          <hr style="border-top: 1px solid black; width: 300px; margin-top: 0.5in; margin-left: auto; margin-right: 0;">

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

export default AnnualCertificate;
