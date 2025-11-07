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

// Get models by brand - returns modelName, bodyType, generation, power, and price of the variant with lowest price (and lowest power if tie)
router.get("/models", async (req, res, next) => {
  try {
    if (!req.query.brand) {
      return res
        .status(400)
        .json({ error: "Brand query parameter is required" });
    }
    const cars = await Car.find({
      brand: { $regex: new RegExp(`^${req.query.brand}$`, "i") },
    }).limit(50);
    const models = cars.map((car) => {
      if (!car.variants || car.variants.length === 0) {
        return {
          modelName: car.modelName,
          bodyType: car.bodyType,
          generation: car.generation,
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
        bodyType: car.bodyType,
        generation: car.generation,
        power: bestVariant.specifications?.power
          ? `${bestVariant.specifications.power.value} ${bestVariant.specifications.power.unit}`
          : null,
        price: bestVariant.price,
        image:
          bestVariant?.images?.mainImage || car.baseImageGallery?.[0] || null,
      };
    });
    res.json(models);
  } catch (err) {
    next(err);
  }
});

// Get cars and brands by originCountry - returns brands with their associated cars (modelName, bodyType, generation, power, price)
router.get("/by-country", async (req, res, next) => {
  try {
    if (!req.query.originCountry) {
      return res
        .status(400)
        .json({ error: "originCountry query parameter is required" });
    }
    const cars = await Car.find({
      originCountry: req.query.originCountry,
    }).limit(50);
    const brands = {};
    cars.forEach((car) => {
      if (!brands[car.brand]) {
        brands[car.brand] = [];
      }
      // Find the variant with the lowest price, and if tie, lowest power
      let bestVariant =
        car.variants && car.variants.length > 0 ? car.variants[0] : null;
      if (bestVariant) {
        for (const variant of car.variants) {
          const currentPrice = variant.price?.amount || Infinity;
          const bestPrice = bestVariant.price?.amount || Infinity;
          const currentPower = variant.specifications?.power?.value || Infinity;
          const bestPower =
            bestVariant.specifications?.power?.value || Infinity;
          if (
            currentPrice < bestPrice ||
            (currentPrice === bestPrice && currentPower < bestPower)
          ) {
            bestVariant = variant;
          }
        }
      }
      brands[car.brand].push({
        modelName: car.modelName,
        bodyType: car.bodyType,
        generation: car.generation,
        power: bestVariant?.specifications?.power
          ? `${bestVariant.specifications.power.value} ${bestVariant.specifications.power.unit}`
          : null,
        price: bestVariant?.price || null,
        image:
          bestVariant?.images?.mainImage || car.baseImageGallery?.[0] || null,
      });
    });
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

// Get all cars sorted alphabetically by brand and modelName
router.get("/all", async (req, res, next) => {
  try {
    const cars = await Car.find({}).sort({ brand: 1, modelName: 1 });
    const results = cars.map((car) => {
      // Find the variant with the lowest price, and if tie, lowest power
      let bestVariant =
        car.variants && car.variants.length > 0 ? car.variants[0] : null;
      if (bestVariant) {
        for (const variant of car.variants) {
          const currentPrice = variant.price?.amount || Infinity;
          const bestPrice = bestVariant.price?.amount || Infinity;
          const currentPower = variant.specifications?.power?.value || Infinity;
          const bestPower =
            bestVariant.specifications?.power?.value || Infinity;
          if (
            currentPrice < bestPrice ||
            (currentPrice === bestPrice && currentPower < bestPower)
          ) {
            bestVariant = variant;
          }
        }
      }
      return {
        brand: car.brand,
        modelName: car.modelName,
        bodyType: car.bodyType,
        generation: car.generation,
        power: bestVariant?.specifications?.power
          ? `${bestVariant.specifications.power.value} ${bestVariant.specifications.power.unit}`
          : null,
        price: bestVariant?.price || null,
        image:
          bestVariant?.images?.mainImage || car.baseImageGallery?.[0] || null,
      };
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Get list of unique origin countries
router.get("/countries", async (req, res, next) => {
  try {
    const countries = await Car.distinct("originCountry");
    res.json(countries);
  } catch (err) {
    next(err);
  }
});

// Search countries by query string - returns countries where originCountry contains the query (case-insensitive)
router.get("/search-countries", async (req, res, next) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const query = req.query.q;
    const countries = await Car.distinct("originCountry", {
      originCountry: { $regex: new RegExp(query, "i") },
    });
    res.json(countries);
  } catch (err) {
    next(err);
  }
});

// Search brands by query string - returns brands where brand contains the query (case-insensitive)
router.get("/search-brands", async (req, res, next) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const query = req.query.q;
    const brands = await Car.distinct("brand", {
      brand: { $regex: new RegExp(query, "i") },
    });
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

// Search cars by query string - returns cars where brand or modelName contains the query (case-insensitive)
router.get("/search-car", async (req, res, next) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const query = req.query.q;
    const cars = await Car.find({
      $or: [
        { brand: { $regex: new RegExp(query, "i") } },
        { modelName: { $regex: new RegExp(query, "i") } },
      ],
    }).limit(50);
    const results = cars.map((car) => {
      // Find the variant with the lowest price, and if tie, lowest power
      let bestVariant =
        car.variants && car.variants.length > 0 ? car.variants[0] : null;
      if (bestVariant) {
        for (const variant of car.variants) {
          const currentPrice = variant.price?.amount || Infinity;
          const bestPrice = bestVariant.price?.amount || Infinity;
          const currentPower = variant.specifications?.power?.value || Infinity;
          const bestPower =
            bestVariant.specifications?.power?.value || Infinity;
          if (
            currentPrice < bestPrice ||
            (currentPrice === bestPrice && currentPower < bestPower)
          ) {
            bestVariant = variant;
          }
        }
      }
      return {
        brand: car.brand,
        modelName: car.modelName,
        bodyType: car.bodyType,
        generation: car.generation,
        power: bestVariant?.specifications?.power
          ? `${bestVariant.specifications.power.value} ${bestVariant.specifications.power.unit}`
          : null,
        price: bestVariant?.price || null,
        image:
          bestVariant?.images?.mainImage || car.baseImageGallery?.[0] || null,
      };
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Get list of unique brands
router.get("/brands", async (req, res, next) => {
  try {
    const brands = await Car.distinct("brand");
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
