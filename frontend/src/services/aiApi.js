import api from "./api";

export const aiAPI = {
  generateMnemonic: (kanjiId, type = "meaning", style = "visual") =>
    api.post("/ai/mnemonic", { kanjiId, type, style }),

  chat: (message, kanjiId = null, lessonContext = null) =>
    api.post("/ai/chat", { message, kanjiId, lessonContext }),

  getTip: () => api.get("/ai/tip"),

  generateBatch: (kanjiIds) => api.post("/ai/batch-mnemonics", { kanjiIds }),
};
