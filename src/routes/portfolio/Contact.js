const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../../models/connectionRequest");
const { sendTelegramMessage } = require("../../Utils/telegram");

// API key middleware (no changes)
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

    // 3. SEND THE RESPONSE - This makes your API fast
    res.status(201).json({
      message: "Your words are in my inbox. Thanks for connecting!",
      id: connectionRequest._id,
    });

    // 4. FIRE AND FORGET NOTIFICATION (in the background)
    // The user is not waiting for this to finish
    try {
      const notificationMessage = `
<b>New Contact Request!</b> 📬
---------------------------
<b>From:</b> ${name}
<b>Email:</b> ${email}
<b>Source:</b> ${source}
<b>Message:</b>
<pre>${message}</pre>
      `;

      // We don't 'await' this. Just let it run.
      sendTelegramMessage(notificationMessage);
    } catch (notificationError) {
      // Log the error, but the user is already gone.
      console.error(
        "Failed to send Telegram notification in background:",
        notificationError
      );
    }
  } catch (err) {
    console.error("Error creating connection request:", err.message);
    next(err);
  }
});

module.exports = router;
