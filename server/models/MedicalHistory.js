const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients' },
    conditions: {
        noseThroatDisorders: { type: Boolean, default: false },
        earTrouble: { type: Boolean, default: false },
        asthma: { type: Boolean, default: false },
        tuberculosis: { type: Boolean, default: false },
        lungDiseases: { type: Boolean, default: false },
        highBloodPressure: { type: Boolean, default: false },
        heartDiseases: { type: Boolean, default: false },
        rheumaticFever: { type: Boolean, default: false },
        diabetesMellitus: { type: Boolean, default: false },
        endocrineDisorder: { type: Boolean, default: false },
        cancerTumor: { type: Boolean, default: false },
        mentalDisorder: { type: Boolean, default: false },
        headNeckInjury: { type: Boolean, default: false },
        hernia: { type: Boolean, default: false },
        rheumatismJointPain: { type: Boolean, default: false },
        eyeDisorders: { type: Boolean, default: false },
        stomachPainUlcer: { type: Boolean, default: false },
        abdominalDisorders: { type: Boolean, default: false },
        kidneyBladderDiseases: { type: Boolean, default: false },
        std: { type: Boolean, default: false },
        familialDisorder: { type: Boolean, default: false },
        tropicalDiseases: { type: Boolean, default: false },
        chronicCough: { type: Boolean, default: false },
        faintingSeizures: { type: Boolean, default: false },
        frequentHeadache: { type: Boolean, default: false },
        dizziness: { type: Boolean, default: false },
    },
    malaria: {
        hasMalaria: { type: String, enum: ['Yes', 'No'] },
        lastAttackDate: { type: String },
    },
    operations: {
        undergoneOperation: { type: String, enum: ['Yes', 'No']},
        listOperations: { type: String },
    },
    signature: {
        fileName: { type: String,  },
        fileType: { type: String,  },
        // fileSize: { type: Number, required: true, max: 5 * 1024 * 1024 }, // Max size 5MB
    },

    familyHistory: {
        diseases: {
            heartDisease: { type: Boolean, default: false },
            tuberculosis: { type: Boolean, default: false },
            kidneyDisease: { type: Boolean, default: false },
            asthma: { type: Boolean, default: false },
            hypertension: { type: Boolean, default: false },
            diabetes: { type: Boolean, default: false },
            cancer: { type: Boolean, default: false },
        },
        allergies: {
            hasAllergies: { type: String, enum: ['Yes', 'No', 'Not Sure'] },
            allergyList: { type: String },
        },
    },

    personalHistory: {
        tobaccoUse: {
            usesTobacco: { type: String, enum: ['Yes', 'No'] },
            sticksPerDay: { type: Number },
            quitSmoking: { type: String, enum: ['Yes', 'No'] },
            quitWhen: { type: String },
        },
        alcoholUse: {
            drinksAlcohol: { type: String, enum: ['Yes', 'No'] },
            drinksPerDay: { type: Number },
            quitDrinking: { type: String, enum: ['Yes', 'No'] },
            quitWhen: { type: String },
        },
        forWomen: {
            pregnant:{ type: String, enum: ['Yes', 'No'] },
            months:{type: String},
            lastMenstrualPeriod:{type: String},
            abortionOrMiscarriage:{type:String, enum:['Abortion','Miscarriage']},
            dysmenorrhea:{type:String, enum:['Yes','No']},
        },
    }
});

const MedicalHistoryModel = mongoose.model('medicalHistory', MedicalHistorySchema);

module.exports = MedicalHistoryModel;
