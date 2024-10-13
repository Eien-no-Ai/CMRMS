const mongoose = require('mongoose');

const PhysicalTherapySchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patients', required: true },
    SOAPSummary: {type:String},
    isCreatedAt: { type: Date, default: Date.now },
});

const PhysicalTherapyModel = mongoose.model('physicaltherapies', PhysicalTherapySchema);

module.exports = PhysicalTherapyModel;