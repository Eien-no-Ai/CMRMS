const mongoose = require('mongoose');

const LaboratorySchema = new mongoose.Schema({
    bloodChemistry: {
        bloodSugar: { type: String, default: "" },  // Stores blood sugar data as string
        bloodUreaNitrogen: { type: String, default: "" },
        bloodUricAcid: { type: String, default: "" },
        creatinine: { type: String, default: "" },
        SGOT_AST: { type: String, default: "" },
        SGPT_ALT: { type: String, default: "" },
        totalCholesterol: { type: String, default: "" },
        triglyceride: { type: String, default: "" },
        HDL_cholesterol: { type: String, default: "" },
        LDL_cholesterol: { type: String, default: "" },
    },
    hematology: {
        bleedingTimeClottingTime: { type: String, default: "" },
        completeBloodCount: { type: String, default: "" },
        hematocritAndHemoglobin: { type: String, default: "" },
    },
    clinicalMicroscopyParasitology: {
        routineUrinalysis: { type: String, default: "" },
        routineStoolExamination: { type: String, default: "" },
        katoThickSmear: { type: String, default: "" },
        fecalOccultBloodTest: { type: String, default: "" },
    },
    bloodBankingSerology: {
        antiTreponemaPallidum: { type: String, default: "" },
        antiHCV: { type: String, default: "" },
        bloodTyping: { type: String, default: "" },
        hepatitisBSurfaceAntigen: { type: String, default: "" },
        pregnancyTest: { type: String, default: "" },
        dengueTest: { type: String, default: "" },
        HIVRapidTest: { type: String, default: "" },
        HIVElsa: { type: String, default: "" },
        testForSalmonellaTyphi: { type: String, default: "" },
    },
    microbiology: {
        gramsStain: { type: String, default: "" },
        KOH: { type: String, default: "" },
    },
    isCreatedAt: { type: Date, default: Date.now },
});

const LaboratoryModel = mongoose.model('laboratory', LaboratorySchema);

module.exports = LaboratoryModel;

