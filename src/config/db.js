const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — skipping DB connection");
    return;
  }

  // Use a short timeout so failed connections return quickly during dev
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Connected to MongoDB");
}

module.exports = { connectDB };
