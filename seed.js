const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Car = require("./src/models/car");

async function seedDatabase() {
  try {
    // Connect to the database directly
    const uri =
      process.env.MONGODB_URI ;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    const jsonDir = path.join(__dirname, "json");
    const files = fs
      .readdirSync(jsonDir)
      .filter((file) => file.endsWith(".json"));

    console.log(`Found ${files.length} JSON files to process.`);

    for (const file of files) {
      const filePath = path.join(jsonDir, file);
      try {
        const data = fs.readFileSync(filePath, "utf8");
        const carData = JSON.parse(data);

        // Create and save the car
        const car = new Car(carData);
        await car.save();
        console.log(`Inserted: ${car.brand} ${car.modelName}`);
      } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
      }
    }

    console.log("Seeding completed.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Run the seeder
seedDatabase();
