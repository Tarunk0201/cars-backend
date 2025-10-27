const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConnectionRequestSchema = new Schema(
  {
    source: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true, collection: "Connection request" }
);

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = ConnectionRequest;
