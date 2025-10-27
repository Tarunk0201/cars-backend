const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define sub-schema for Price
const PriceSchema = new Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
  },
  { _id: false }
); // Prevent _id for subdocuments unless needed

// Define sub-schema for Specifications (Value/Unit pairs)
const SpecValueUnitSchema = new Schema(
  {
    value: { type: Schema.Types.Mixed, required: true }, // Use Mixed for flexibility (number or string)
    unit: { type: String, required: true },
    type: { type: String }, // Optional: e.g., for mileage (City/Highway/ARAI)
  },
  { _id: false }
);

// Define sub-schema for Acceleration
const AccelerationSchema = new Schema(
  {
    zeroToHundredKmh: SpecValueUnitSchema,
    // Add others if needed (e.g., zeroToSixtyMph)
  },
  { _id: false }
);

// Define sub-schema for Safety Rating
const SafetyRatingSchema = new Schema(
  {
    agency: { type: String },
    stars: { type: Number, min: 0, max: 5 },
  },
  { _id: false }
);

// Define sub-schema for Images
const ImageSchema = new Schema(
  {
    mainImage: { type: String, required: true },
    gallery: [{ type: String }], // Array of image URLs/paths
    thumbnail: { type: String },
  },
  { _id: false }
);

// --- Define sub-schema for VARIANTS ---
const VariantSchema = new Schema(
  {
    variantId: { type: String, required: true, unique: true }, // Unique identifier within the model
    variantName: { type: String, required: true },
    price: { type: PriceSchema, required: true },
    fuelType: {
      type: String,
      required: true,
      enum: [
        "Petrol",
        "Diesel",
        "CNG",
        "Electric",
        "Plug-in Hybrid (Electric + Petrol)",
        "Hybrid",
      ],
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic"],
    },
    specifications: {
      engineDisplacement: SpecValueUnitSchema,
      power: SpecValueUnitSchema,
      cylinders: { type: Number },
      mileage: SpecValueUnitSchema,
      topSpeed: SpecValueUnitSchema,
      acceleration: AccelerationSchema,
      kerbWeight: SpecValueUnitSchema,
      co2Emissions: SpecValueUnitSchema,
      // Add other variant-specific specs here
    },
    keyFeatures: [{ type: String }], // Features specific to this variant
    availableColors: [{ type: String }],
    safetyRating: SafetyRatingSchema,
    images: ImageSchema, // Images specific to this variant
  },
  { timestamps: true }
); // Add createdAt/updatedAt for variants if needed

// --- Define the MAIN CAR MODEL Schema ---
const CarSchema = new Schema(
  {
    // Use a custom ID or let MongoDB generate _id
    // modelId: { type: String, required: true, unique: true },
    brand: { type: String, required: true, index: true }, // Add index for faster brand filtering
    modelName: { type: String, required: true, index: true },
    generation: { type: String },
    modelYearStart: { type: Number },
    originCountry: { type: String },
    bodyType: { type: String, required: true, index: true },
    baseDescription: { type: String },
    commonFeatures: [{ type: String }],
    baseImageGallery: [{ type: String }], // Common images for the model shape

    // --- Embed the Variants Array ---
    variants: [VariantSchema], // Array of variant subdocuments
  },
  { timestamps: true }
); // Add createdAt/updatedAt timestamps for the whole car model

// Create the Mongoose Model
const Car = mongoose.model("Car", CarSchema); // Collection name will be 'cars'

module.exports = Car;
