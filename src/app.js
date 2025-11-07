const express = require("express");
const cors = require("cors");
const path = require("path");
const carsRouter = require("./routes/cars");
const contactRouter = require("./routes/portfolio/Contact");
const healthRouter = require("./routes/health");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URLS
      ? process.env.FRONTEND_URLS.split(",")
      : false,
    credentials: true,
  })
);

app.use(express.json());

// Serve static files from the public directory
app.use("/images", express.static(path.join(__dirname, "../public")));

app.use("/cars", carsRouter);
app.use("/contact", contactRouter);
app.use("/health", healthRouter);

// simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
