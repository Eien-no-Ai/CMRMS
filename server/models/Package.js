const mongoose = require("mongoose");

// Schema to keep track of auto-incremented package number
const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true }, // `id` is a string identifier for the counter
  seq: { type: Number, default: 0 }, // `seq` is the counter value
});

const Counter = mongoose.model("Counter", CounterSchema);
const { Schema, Types } = mongoose;
const PackageSchema = new mongoose.Schema({
  packageNumber: { type: Number, unique: true },
  name: { type: String },
  packageFor: { type: String },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "patients" },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "clinics" },
  laboratoryId: { type: mongoose.Schema.Types.ObjectId, ref: "laboratory" },

  // ✅ Add it here
  packageClickCount: { type: Number, default: 0 },

  tests: [
    {
      category: { type: String, required: true },
      name: { type: String, required: true },
      referenceRange: { type: String, default: "" },
      whatShouldBeIncluded: { type: [String], default: [] },
    }
  ],

  xrayType: { type: String, default: "" },
  xrayDescription: { type: String, default: "" },
  isCreatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
});


PackageSchema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "packageNumber" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      if (!counter) {
        console.error("Counter document not found or failed to create.");
        return next(new Error("Failed to generate package number."));
      }

      doc.packageNumber = counter.seq;
      next();
    } catch (error) {
      console.error("Error in pre-save hook:", error);
      next(error);
    }
  } else {
    next();
  }
});


const PackageModel = mongoose.model("packages", PackageSchema);

module.exports = PackageModel;