import api from "./api";

export const contentAPI = {
  generateContent: (count = 5) => api.post("/content/generate", { count }),

  getUserKanji: (params) => api.get("/content/kanji", { params }),

  adaptDifficulty: (kanjiId, performance) =>
    api.post("/content/adapt", { kanjiId, performance }),

  // Add timestamp to prevent caching
  getRecommendations: () =>
    api.get("/content/recommendations", {
      params: { _t: Date.now() },
    }),
};
