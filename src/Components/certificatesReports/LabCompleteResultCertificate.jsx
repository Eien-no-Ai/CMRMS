import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from "axios";

const LabCompleteResultCertificate = ({ isOpen, onClose, labDetails, verifiedByPathologist}) => {
  const [userData, setUserData] = useState({});
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const imageUrl = `https://cmrms-full.onrender.com/uploads/${userData?.signature}`;
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const pathologistUrl = labDetails?.pathologistSignature;


  useEffect(() => {
    if (isOpen && labDetails && userData && verifiedByPathologist ) {
      generatePDF();
    }
  }, [isOpen, labDetails, userData, verifiedByPathologist]);

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
  
  const fetchImageAsBase64 = async (imageUrl, pathologistUrl) => { 
    try {
      // Fetch both images in parallel using Promise.all
      const [imageResponse, pathologistResponse] = await Promise.all([
        axios.get(imageUrl, { responseType: 'blob' }),
        axios.get(pathologistUrl, { responseType: 'blob' })
      ]);
      
      // Function to convert a blob to Base64
      const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result); // Resolve with the Base64 string
          reader.onerror = reject; // Reject on error
          reader.readAsDataURL(blob); // Read the blob as a Data URL (Base64)
        });
      };
      
      // Convert both images to Base64
      const base64Image = await convertBlobToBase64(imageResponse.data);
      const base64PathologistImage = await convertBlobToBase64(pathologistResponse.data);
  
      return { base64Image, base64PathologistImage }; // Return both Base64 images
    } catch (error) {
      console.error("Error fetching images as base64:", error);
      return { base64Image: null, base64PathologistImage: null }; // Return null if an error occurs
    }
  };
  
  const generatePDF = async () => {
    const signatureUrl = `https://cmrms-full.onrender.com/uploads/${userData?.signature}`;
    const signaturePathologistUrl = labDetails?.pathologistSignature;

    const { base64Image, base64PathologistImage } = await fetchImageAsBase64(signatureUrl, signaturePathologistUrl);  
    // Check if base64Image is not null and has content
    if (!base64Image) {
      console.error("open.");
    }
    if (!base64PathologistImage) {
      console.error("sesame.");
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
    
        const redBloodCellCount = parseFloat(labDetails.Hematology.redBloodCellCount) || 0;
        const hemoglobin = parseFloat(labDetails.Hematology.Hemoglobin) || 0;
        const hematocrit = parseFloat(labDetails.Hematology.Hematocrit) || 0;
        const leukocyteCount = parseFloat(labDetails.Hematology.LeukocyteCount) || 0;
        
        const segmenters = parseFloat(labDetails.Hematology.DifferentialCount.segmenters) || 0;
        const lymphocytes = parseFloat(labDetails.Hematology.DifferentialCount.lymphocytes) || 0;
        const monocytes = parseFloat(labDetails.Hematology.DifferentialCount.monocytes) || 0;
        const eosinophils = parseFloat(labDetails.Hematology.DifferentialCount.eosinophils) || 0;
        const basophils = parseFloat(labDetails.Hematology.DifferentialCount.basophils) || 0;
        
        // Calculating the total
        const total = redBloodCellCount + hemoglobin + hematocrit + leukocyteCount + segmenters + lymphocytes + monocytes + eosinophils + basophils;

        const hematologyHasData = labDetails.Hematology && Object.keys(labDetails.Hematology).length > 0;
        const clinicalMicroscopyParasitologyHasData = labDetails.clinicalMicroscopyParasitology && Object.keys(labDetails.clinicalMicroscopyParasitology).length > 0;
        const bloodBankingSerologyHasData = labDetails.bloodBankingSerology && Object.keys(labDetails.bloodBankingSerology).length > 0;

    const content = document.createElement('div');
    content.style.margin = '0.5in';
    content.innerHTML = `
<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        border: 1px solid black;
    }

    th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
    }

    th {
        font-weight: bold;
    }

    /* Allow page breaks inside rows and table */
    tr {
        page-break-inside: auto; /* Allow rows to break across pages */
    }

    table, tbody {
        page-break-before: auto; /* Allow page breaks before table and tbody */
    }

    /* Printing styles */
    @media print {
        body {
            margin-bottom: 0.5in; /* Set a margin at the bottom */
        }

        /* Allow page breaks inside table content */
        table {
            page-break-inside: auto; /* Allow breaks inside the table */
        }

        tr {
            page-break-inside: auto; /* Allow breaks inside rows */
        }

        td {
            page-break-inside: auto; /* Allow breaks inside cells */
        }
    }
</style>

      <img src="/ub.png" width="200" height="100" style="display: block; margin-left: auto; margin-right: auto;" alt="logo" />
      <p style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        UNIVERSITY OF BAGUIO CLINICAL LABORATORY<br>
        Room F102,1<sup>st</sup> Floor, Commerce Building<br>
        General Luna Road., Baguio City, Philippines 2600
      </p>
      <hr style="border-top: 1px solid black; margin-top: 7px; margin-bottom: 2px;">
      <hr style="border-top: 1px solid black; margin-top: 0; margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
        <div style="text-align: left;">Telefax No.: (074) 442-3071</div>
        <div style="text-align: center;">Website: www.ubaguio.edu</div>
        <div style="text-align: right;">E-mail Address: clinical_lab@e.ubaguio.edu</div>
      </div>

<div style="font-family: 'Times New Roman', Times, serif; font-size: 10pt;">
    <div style="text-align: center; margin-bottom: 10px;"><strong>LABORATORY RESULT FORM</strong></div>

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

${hematologyHasData ? `
<table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
    <thead>
        <tr>
            <th colspan="5" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                I. HEMATOLOGY
            </th>
        </tr>
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
            <td style="border: 1px solid black; padding: 8px;">Red Blood Cell Count</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.redBloodCellCount}</td> 
            <td style="border: 1px solid black; padding: 8px;"><strong> x10^12/L </strong></td>
            <td style="border: 1px solid black; padding: 8px;">MEN <br> FEMALE</td>
            <td style="border: 1px solid black; padding: 8px;">4.0 - 5.5x10^12/L <br> 3.5 - 5.0x10^12/L</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Hemoglobin</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.Hemoglobin}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong> g/L </strong></td>
            <td style="border: 1px solid black; padding: 8px;">MEN <br> FEMALE</td>
            <td style="border: 1px solid black; padding: 8px;">140 - 180 g/L <br> 120 - 180 g/L </td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Hematocrit</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.Hematocrit}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">MEN <br> FEMALE</td>
            <td style="border: 1px solid black; padding: 8px;">0.40 - 0.54 <br> 0.37 - 0.47</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Leukocyte Count</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.LeukocyteCount}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong> x10^9/L </strong></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">5.0 - 10.0x10^9/L</td>
        </tr>
        <tr>
        <td style="border: 1px solid black; padding: 8px;" colspan="1">Differential Count</td>
            <td style="border: 1px solid black; padding: 8px;" colspan="4"></td>
        </tr>

        <tr>
            <td style="border: 1px solid black; padding: 8px;">Segmenters</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.DifferentialCount?.segmenters}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">0.50 - 0.70</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Lymphocytes</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.DifferentialCount?.lymphocytes}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">0.20 - 0.40</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Monocytes</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.DifferentialCount?.monocytes}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">0.00 - 0.07</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Eosinophils</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.DifferentialCount?.eosinophils}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">0.00 - 0.05</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Basophils</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.DifferentialCount?.basophils}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">0.00 - 0.01</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Total</td>
            <td style="border: 1px solid black; padding: 8px;">
                ${total}
            </td>
            <td style="border: 1px solid black; padding: 8px;" colspan="3"></td>

        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Basophils</td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.Hematology?.PlateletCount}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong> x10^9/L </strong></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;">150 - 400x10^9/L</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;" colspan="1">Others</td>
            <td style="border: 1px solid black; padding: 8px;" colspan="4">${labDetails.Hematology?.others}</td>
        </tr>
    </tbody>
</table>
` : ''}

${clinicalMicroscopyParasitologyHasData ? `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
        <thead>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    II. CLINICAL MICROSCOPY AND PARASITOLOGY
                </th>
            </tr>
            <tr>
                <th colspan="1" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Routine Urinalysis
                </th>
                <th colspan="1" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    LMP:  ${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.LMP}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    MACROSCOPIC EXAMINATION
                </th>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 8px;" colspan="1">Color</td>
                <td style="border: 1px solid black; padding: 8px;" colspan="1">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.macroscopicExam?.color}</td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 8px;" colspan="1">Appearance</td>
                <td style="border: 1px solid black; padding: 8px;" colspan="1">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.macroscopicExam?.appearance}</td>
            </tr>
        </tbody>
    </table>

<table style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th colspan="6" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                CHEMICAL EXAMINATION
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Sugar</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.sugar}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Urobilinogen</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.urobilinogen}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Leukocyte</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.leukocytes}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Albumin</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.albumin}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Ketones</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.ketones}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Reaction</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.reaction}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Blood</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.blood}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Nitrite</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.nitrites}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Specific Gravity</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.specificGravity}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Bilirubin</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.chemicalExam?.bilirubin}</td>
            <td style="border: 1px solid black; padding: 8px;"colspan="4"></td>
        </tr>
    </tbody>
</table>

<table style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th colspan="6" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                MICROSCOPIC EXAMINATION
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Pus Cells</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.pusCells}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Epithelial Cells</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.epithelialCells}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Red Blood Cells</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.RBC}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Mucuc Threads</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.mucusThreads}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Bacteria</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.bacteria}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Crystals</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.crystals}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Yeast Cells</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.yeastCells}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Amorpheous</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.amorphous}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Cast</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.casts}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Others</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineUrinalysis?.microscopicExam?.others}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>/hpf</strong></td>
        </tr>
    </tbody>
</table>

<table style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                ROUTINE FECALYSIS
            </th>
            <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                MICROSCOPIC EXAMINATION
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Color</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineFecalysis?.color}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Direct Fecal Smear</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineFecalysis?.microscopicExam?.directFecalSmear}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Consistency</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineFecalysis?.consistency}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Kato Fecal Smear</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.clinicalMicroscopyParasitology?.routineFecalysis?.microscopicExam?.katoThickSmear}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"colspan="1"><strong>Others</strong></td>
            <td style="border: 1px solid black; padding: 8px;"colspan="3">${labDetails.clinicalMicroscopyParasitology?.routineFecalysis?.others}</td>
        </tr>
    </tbody>
</table>
    ` : ''}

${bloodBankingSerologyHasData ? `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
        <thead>
            <tr>
                <th colspan="4" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    III. SEROLOGY
                </th>
            </tr>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Hepatitis B Surface Antigen Determination (Screening Test Only)
                </th>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Anti-HAV Test (Screening Test Only)
                </th>
            </tr>
        </thead>
            <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen?.methodUsed}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.antiHAVTest?.methodUsed}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen?.lotNumber}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.antiHAVTest.lotNumber}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Date</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen?.expirationDate}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Date</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.antiHAVTest?.expirationDate}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.hepatitisBSurfaceAntigen?.result}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.antiHAVTest?.result}</td>
        </tr>
    </tbody>
</table>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
        <thead>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Serum Pregnancy
                </th>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Test for Treponema pallidum / Syphillis
                </th>
            </tr>
        </thead>
            <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.serumPregnancy?.methodUsed}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.treponemaPallidumTest?.methodUsed}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.serumPregnancy?.lotNumber}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.treponemaPallidumTest.lotNumber}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Date</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.serumPregnancy?.expirationDate}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Dater</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.treponemaPallidumTest?.expirationDate}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.serumPregnancy?.result}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.treponemaPallidumTest?.result}</td>
        </tr>
    </tbody>
</table>

    <table style="width: 100%; border-collapse: collapse; margin-top: 0.5in; border: 1px solid black;">
        <thead>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Salmonella typhi
                </th>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Blood Typing
                </th>
            </tr>
        </thead>
            <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.salmonellaTyphi?.methodUsed}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.bloodTyping?.ABOType}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.salmonellaTyphi?.lotNumber}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.bloodTyping.RhType}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Date</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.salmonellaTyphi?.expirationDate}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.salmonellaTyphi?.result}</td>
            <td style="border: 1px solid black; padding: 8px;"></td>
            <td style="border: 1px solid black; padding: 8px;"></td>
        </tr>
    </tbody>
</table>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
        <thead>
            <tr>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Test for Dengue
                </th>
                <th colspan="2" style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">
                    Others
                </th>
            </tr>
        </thead>
            <tbody>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.testDengue?.methodUsed}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Method Used:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.others?.methodUsed}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.testDengue?.lotNumber}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Lot No.</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.others.lotNumber}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Date</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.testDengue?.expirationDate}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Expiration Dater</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.others?.expirationDate}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.testDengue?.result}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Result</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${labDetails.bloodBankingSerology?.others?.result}</td>
        </tr>
    </tbody>
</table>


    
    ` : ''}


<div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-start; margin-top:50px;">
  <div style="text-align: left; width: 48%;">
    ${base64Image ? `<img src="${base64Image}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
    <strong>Name:</strong> ${userData?.lastname} ${userData?.firstname} ${userData?.middlename || ''} <br>
    <strong>License Number:</strong> ___________________ <br>
    <div>Medical Pathologist</div>
  </div>
  
  <div style="text-align: left; width: 48%; text-align: right;">
      ${base64PathologistImage ? `<img src="${base64PathologistImage}" alt="Signature" style="max-width: 200px; max-height: 50px; margin-right: 10px;" />` : ''}
    <strong>Name:</strong> ${verifiedByPathologist?.lastname} ${verifiedByPathologist?.firstname} ${verifiedByPathologist?.middlename || ''} <br>
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

export default LabCompleteResultCertificate;