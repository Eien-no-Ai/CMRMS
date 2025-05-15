const mongoose = require("mongoose");

const allowedCategories = [
  "Blood Chemistry",
  "Hematology",
  "Clinical Microscopy & Parasitology",
  "Blood Banking And Serology",
  "Other Tests", // ✅ Add this
];

const LaboratoryTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensures test names are unique
    },
    category: {
      type: String,
      required: true,
      enum: allowedCategories, // Restrict category to predefined values
      message: "{VALUE} is not a valid category", // Custom error message
    },
    referenceRange: {
      type: String,
      required: false, // Optional field
    },
    whatShouldBeIncluded: {
      type: [String], // Array of strings for dynamic inclusion
      default: [], // Default to an empty array
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the timestamp when created
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

module.exports = mongoose.model("LaboratoryTest", LaboratoryTestSchema);