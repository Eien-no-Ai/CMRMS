const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    HbsAgScreening: {type:String},
    "WIDAL/Typhidot": {type:String},
    CBC: {type:String},
    Urinalysis: {type:String},
    PregnancyTest: {type:String},
    Fecalysis: {type:String},
    ChestXray: {type:String},
    Dental: {type:String},
    VDRL: {type:String},
    DrugTest: {type:String},
    HIVTest: {type:String},
    Optometry: {type:String},
});

const PackageModel = mongoose.model('packages', PackageSchema);

module.exports = PackageModel;