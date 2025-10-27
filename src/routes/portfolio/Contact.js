const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../../models/connectionRequest");
const { sendEmail } = require("../../config/email");

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or missing API key" });
  }

  next();
};

// POST endpoint to store contact request
router.post("/send", checkApiKey, async (req, res, next) => {
  try {
    const { source, name, email, message } = req.body;

    if (!source || !name || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields: source, name, email, message",
      });
    }

    const connectionRequest = new ConnectionRequest({
      source,
      name,
      email,
      message,
    });

    await connectionRequest.save();
    console.log(`Connection request created: ${connectionRequest._id}`);

    try {
      const now = new Date();
      const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      const formattedDate = now.toLocaleString("en-US", dateOptions);

      const emailSubject = `New Contact Request from ${name}`;
      const emailHtml = `
        <h2>New Contact Request</h2>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Received at:</strong> ${formattedDate}</p>
      `;
      await sendEmail(process.env.ADMIN_EMAIL, emailSubject, emailHtml);
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    res.status(201).json({
      message: "Your words are in my inbox. Thanks for connecting!",
      id: connectionRequest._id,
    });
  } catch (err) {
    console.error("Error creating connection request:", err.message);
    next(err);
  }
});

module.exports = router;
