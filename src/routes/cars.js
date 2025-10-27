const express = require("express");
const router = express.Router();
const Car = require("../models/car");

// Create a car
router.post("/", async (req, res, next) => {
  try {
    // Basic validation: ensure req.body is an object and has required fields
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "Request body must be a valid JSON object" });
    }
    if (!req.body.brand || !req.body.modelName || !req.body.bodyType) {
      return res
        .status(400)
        .json({ error: "Missing required fields: brand, modelName, bodyType" });
    }
    if (
      !req.body.variants ||
      !Array.isArray(req.body.variants) ||
      req.body.variants.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one variant is required" });
    }

    const car = new Car(req.body);
    await car.save();
    console.log(`Car created: ${car.brand} ${car.modelName} (${car._id})`);
    res.status(201).json(car);
  } catch (err) {
    console.error("Error creating car:", err.message);
    next(err);
  }
});

// List cars (basic) - filter by modelName if provided
router.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.modelName) {
      query.modelName = req.query.modelName;
    }
    const cars = await Car.find(query).limit(50);
    res.json(cars);
  } catch (err) {
    next(err);
  }
});

// Get models by brand - returns modelName, power, and price of the variant with lowest price (and lowest power if tie)
router.get("/models", async (req, res, next) => {
  try {
    if (!req.query.brand) {
      return res
        .status(400)
        .json({ error: "Brand query parameter is required" });
    }
    const cars = await Car.find({ brand: req.query.brand }).limit(50);
    const models = cars.map((car) => {
      if (!car.variants || car.variants.length === 0) {
        return {
          modelName: car.modelName,
          power: null,
          price: null,
        };
      }
      // Find the variant with the lowest price, and if tie, lowest power
      let bestVariant = car.variants[0];
      for (const variant of car.variants) {
        const currentPrice = variant.price?.amount || Infinity;
        const bestPrice = bestVariant.price?.amount || Infinity;
        const currentPower = variant.specifications?.power?.value || Infinity;
        const bestPower = bestVariant.specifications?.power?.value || Infinity;
        if (
          currentPrice < bestPrice ||
          (currentPrice === bestPrice && currentPower < bestPower)
        ) {
          bestVariant = variant;
        }
      }
      return {
        modelName: car.modelName,
        power: bestVariant.specifications?.power
          ? `${bestVariant.specifications.power.value} ${bestVariant.specifications.power.unit}`
          : null,
        price: bestVariant.price,
      };
    });
    res.json(models);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
