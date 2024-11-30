const mongoose = require('mongoose');

const PhysicalExamStudentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients'},
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages" },
    laboratoryId: { type: mongoose.Schema.Types.ObjectId, ref: "laboratory" },
    packageNumber: { type: String, required: true },
    temperature : { type: String, required: true },
    bloodPressure : { type: String, required: true },
    pulseRate : { type: String, required: true },
    respirationRate : { type: String, required: true },
    height : { type: String, required: true },
    weight : { type: String, required: true },
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
    },
    isCreatedAt: { type: Date, default: Date.now },
},
{ timestamps: true }
);

const PhysicalExamModelStudent = mongoose.model('PhysicalExamStudent', PhysicalExamStudentSchema);

module.exports = PhysicalExamModelStudent;