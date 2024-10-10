const e = require('express');
const mongoose = require('mongoose');

const LaboratoryResultsSchema = new mongoose.Schema({
    //
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients'},
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'clinics'},
    Hematology: {
        redBloodCellCount: { type: String, default: "" },
        Hemoglobin: { type: String, default: "" },
        Hematocrit: { type: String, default: "" },
        LeukocyteCount: { type: String, default: "" },
        DifferentialCount: { 
            segmenters: { type: String, default: "" },
            lymphocytes: { type: String, default: "" },
            monocytes: { type: String, default: "" },
            eosinophils: { type: String, default: "" },
            basophils: { type: String, default: "" },
            total: { type: String, default: "" },
        },
        PlateletCount: { type: String, default: "" },
        others: { type: String, default: "" }
    },
    //
    clinicalMicroscopyParasitology: {
        routineUrinalysis: {
            macroscopicExam: { 
                color: { type: String, default: "" },
                appearance: { type: String, default: "" },
            },
            // LMP: { type: String, default: "" },
            chemicalExam: {
                sugar: { type: String, default: "" },
                albumin: { type: String, default: "" },
                blood: { type: String, default: "" },
                bilirubin: { type: String, default: "" },
                urobilinogen: { type: String, default: "" },
                ketones: { type: String, default: "" },
                nitrites: { type: String, default: "" },
                leukocytes: { type: String, default: "" },
                reaction: { type: String, default: "" },
                specificGravity: { type: String, default: "" },
            },
            microscopicExam: {
                pusCells: { type: String, default: "" },
                RBC: { type: String, default: "" },
                epithelialCells: { type: String, default: "" },
                casts: { type: String, default: "" },
                crystals: { type: String, default: "" },
                bacteria: { type: String, default: "" },
                yeastCells: { type: String, default: "" },
                mucusThreads: { type: String, default: "" },
                amorphous: { type: String, default: "" },
                others: { type: String, default: "" }
            }, 
        },
        
        routineFecalysis: { 
            color: { type: String, default: "" },
            consistency: { type: String, default: "" },
            bacteria: { type: String, default: "" },
            microscopicExam: {
                directFecalSmear: { type: String, default: "" },
                katoThickSmear: { type: String, default: "" },
            },
            others: { type: String, default: "" },
        },
    },
    //
    bloodBankingSerology: {
        hepatitisBSurfaceAntigen: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        serumPregnancy: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        salmonellaTyphi: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        testDengue: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        antiHAVTest: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        treponemaPallidumTest: {
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        },
        bloodTyping: {
            ABOType: { type: String, default: "" },
            RhType: { type: String, default: "" },
        },
        others:{
            methodUsed: { type: String, default: "" },
            lotNumber: { type: String, default: "" },
            expirationDate: {type: Date, default: "" },
            result: { type: String, default: "" },
        }
    },
    labNumber: { type: String, default: "" },
    isCreatedAt: { type: Date, default: Date.now },
});

const LaboratoryResultsModel = mongoose.model('laboratoryResults', LaboratoryResultsSchema);

module.exports = LaboratoryResultsModel;