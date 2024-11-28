const mongoose = require('mongoose');

const AnnualExamSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients' },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'packages' },
    laboratoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'laboratory' },
    packageNumber: { type: String, required: true },

    changes: {
        year: { type: String, required: false },
        bloodPressure: { type: String, required: false },
        pulseRate: { type: String, required: false },
        respirationRate: { type: String, required: false },
        height: { type: String, required: false },
        weight: { type: String, required: false },
        bmi: { type: String, required: false },
        wasteLine: { type: String, required: false },
        hipLine: { type: String, required: false },
        dateExamined: { type: String, required: false },
    },
    
    abnormalFindings: {
        skin: { skin: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        headNeckScalp: { headNeckScalp: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        eyesExternal: { eyesExternal: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        ears: { ears: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        face: { face: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        neckThyroid: { neckThyroid: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        chestBreastsAxilla: { chestBreastsAxilla: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        lungs: { lungs: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        heart: { heart: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        abdomen: { abdomen: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        back: { back: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        guSystem: { guSystem: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        inguinalGenitals: { inguinalGenitals: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
        extremities: { extremities: { type: Boolean, default: false }, remarks: { type: String, default: '' } },
    },

    labExam: {
        chestXray: { type: String, default: '' },
        urinalysis: { type: String, default: '' },
        completeBloodCount: { type: String, default: '' },
        fecalysis: { type: String, default: '' },
    },

    others: {
        medications: { type: String, default: '' },
        remarksRecommendations: { type: String, default: '' },
    }
}, { timestamps: true });

const AnnualExamModel = mongoose.model('AnnualExam', AnnualExamSchema);

module.exports = AnnualExamModel;
