const mongoose = require("mongoose");

const LaboratorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "clinics" },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages" },
    packageNumber: { type: Number },
    ORNumber: { type: String, default: "" },

    // Flexible array of selected tests with category and custom fields
    tests: [
      {
        category: { type: String }, // e.g., "Blood Chemistry"
        name: { type: String, required: true }, // e.g., "Blood Sugar Test"
        referenceRange: { type: String, default: "" },

        // Dynamic fields expected to be included for this test
        whatShouldBeIncluded: {
          type: [String],
          default: [],
        },
        
      },
    ],

    labResult: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const LaboratoryModel = mongoose.model("laboratory", LaboratorySchema);

module.exports = LaboratoryModel;