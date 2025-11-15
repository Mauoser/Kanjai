const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini - it automatically uses GEMINI_API_KEY from environment
const genAI = new GoogleGenAI({});

// Generate mnemonic for kanji
const generateMnemonic = async (kanji, type = "meaning", style = "visual") => {
  try {
    const prompts = {
      meaning: `Create a memorable, ${style} mnemonic story to remember that the Japanese kanji "${kanji.character}" means "${kanji.meaning}".
                The story should be vivid, emotional, and unforgettable.
                If the kanji contains radicals, incorporate them into the story.
                Make it 2-3 sentences maximum. Be creative and use humor when appropriate.
                Example format: "See those three flames on top? That's fire burning! But wait - it looks like a person... OH NO, THEY'RE ON FIRE!"`,

      reading: `Create a memorable mnemonic to remember that the Japanese kanji "${
        kanji.character
      }" is pronounced "${kanji.onyomi?.[0] || kanji.kunyomi?.[0]}".
                Use sound associations and wordplay. Make it funny and memorable.
                2 sentences maximum.
                Example: "Your CAR (か) is on fire! Feel the HEAT (ひ) burning!"`,
    };

    const prompt = prompts[type] || prompts.meaning;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("AI mnemonic generation failed:", error);
    // Fallback to a default mnemonic
    return type === "meaning"
      ? `Remember ${kanji.character} means ${kanji.meaning} by visualizing it.`
      : `${kanji.character} sounds like ${
          kanji.onyomi?.[0] || kanji.kunyomi?.[0]
        }.`;
  }
};

// Ai-Sensei chat response
const aiSenseiChat = async (message, context = {}) => {
  try {
    const systemPrompt = `You are Ai-Sensei, a friendly and encouraging Japanese language tutor AI.
    You help students learn kanji through memorable mnemonics, visual associations, and patient explanations.
    Keep responses concise (2-3 sentences) unless asked for more detail.
    Use emojis occasionally to be friendly 🌸
    If asked about a specific kanji, provide helpful memory tips.
    Current context: ${JSON.stringify(context)}`;

    const fullPrompt = `${systemPrompt}\n\nStudent: ${message}\nAi-Sensei:`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: fullPrompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Ai-Sensei chat failed:", error);
    return "Hmm, I'm having trouble thinking right now. Let's try again! 🤔";
  }
};

// Generate visual description for image generation
const generateVisualDescription = async (kanji) => {
  try {
    const prompt = `Describe a simple, memorable visual scene that represents the Japanese kanji "${kanji.character}" (${kanji.meaning}).
    The description should be suitable for generating an illustration.
    Make it vivid but simple, incorporating the visual elements of the kanji character itself.
    One sentence only.
    Example: "Three flames dancing on top of burning logs with a stick figure person surrounded by orange fire."`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Visual description generation failed:", error);
    return `A visual representation of ${kanji.meaning}`;
  }
};

// Personalized learning recommendations
const getPersonalizedTip = async (userProgress) => {
  try {
    const prompt = `Based on this learning data: ${JSON.stringify(
      userProgress
    )},
    provide ONE short, specific study tip to improve retention.
    Focus on their weak areas. Keep it to one sentence.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Personalized tip generation failed:", error);
    return "Keep practicing consistently to improve your retention!";
  }
};

// Use CommonJS exports
module.exports = {
  generateMnemonic,
  aiSenseiChat,
  generateVisualDescription,
  getPersonalizedTip,
};
