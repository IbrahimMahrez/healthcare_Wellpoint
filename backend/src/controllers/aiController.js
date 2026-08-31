const asyncHandler = require("express-async-handler");
const { GoogleGenAI } = require("@google/genai");

let client = null;

const getClient = () => {
  if (!client && process.env.GEMINI_API_KEY) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
};

const SYSTEM_PROMPT = `
You are a preliminary health-guidance assistant inside a healthcare app.

You do NOT diagnose conditions or replace a licensed doctor.

Give general, cautious health guidance and suggest which medical
specialty the user should consult.

Always include a short safety disclaimer.

If symptoms sound urgent or like an emergency, such as:
- chest pain
- difficulty breathing
- severe bleeding
- stroke signs
- loss of consciousness
- severe allergic reaction

Clearly tell the user to seek emergency medical care immediately.

Do not claim certainty about a diagnosis.
`;

// @desc    AI chatbot triage endpoint
// @route   POST /api/ai/query
// @access  Private

const aiQuery = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  const gemini = getClient();

  if (!gemini) {
    res.status(503);
    throw new Error("AI service is not configured");
  }

  const conversationHistory = history
    .map((h) => {
      const role = h.role === "assistant" ? "Assistant" : "User";

      return `${role}: ${h.content}`;
    })
    .join("\n");

  const prompt = `
${SYSTEM_PROMPT}

Previous conversation:
${conversationHistory || "No previous conversation."}

Current user message:
${message}

Answer the user clearly and safely.
`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const reply =
    response.text ||
    "Sorry, I couldn't process your request.";

  res.status(200).json({
    success: true,
    reply,
    disclaimer:
      "This is general guidance only and not a medical diagnosis. Consult a licensed doctor.",
  });
});

module.exports = {
  aiQuery,
};