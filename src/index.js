const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT;

// Try to connect to DB but don't block server start if it fails.
connectDB().catch((err) => {
  console.error("Initial DB connection failed:", err.message || err);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
