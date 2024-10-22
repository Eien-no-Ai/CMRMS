const mongoose = require('mongoose');

const PhysicalExamStudentSchema = new mongoose.Schema({
    temperature : { type: Number, required: true },
    bloodPressure : { type: Number, required: true },
    pulseRate : { type: Number, required: true },
    respirationRate : { type: Number, required: true },
    height : { type: Number, required: true },
    weight : { type: Number, required: true },
    bodyBuilt : { type: String, required: true },
    visualAcuity : { type: String, required: true },
    abnormalFindings :{
        skin:{
            skin: { type: Boolean, default: false},
            remarks: { type: String, default: '' },
        },
        headNeckScalp:{
            headNeckScalp: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        eyesExternal:{
            eyesExternal: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        pupils:{
            pupils: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        ears:{
            ears: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        noseSinuses:{
            noseSinuses: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        mouthThroat:{
            mouthThroat: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        neckThyroid:{
            neckThyroid: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        chestBreastsAxilla:{
            chestBreastsAxilla: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        lungs:{
            lungs: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        heart:{
            heart: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        abdomen:{
            abdomen: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        back:{
            back: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        anusRectum:{
            anusRectum: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        urinary:{
            urinary: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        inguinalGenitals:{
            inguinalGenitals: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        reflexes:{
            reflexes: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        extremities:{
            extremities: { type: Boolean, default: false },
            remarks: { type: String, default: '' },
        },
        LMP:{type:Date},
    }


});

const PhysicalExamModelStudent = mongoose.model('PhysicalExamStudent', PhysicalExamStudentSchema);

module.exports = PhysicalExamModelStudent;
