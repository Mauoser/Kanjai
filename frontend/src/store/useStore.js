import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      token: null,
      isAuthenticated: false,

      // Auth actions
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () => {
        // Clear localStorage keys
        localStorage.removeItem("kanjai-storage");
        localStorage.removeItem("token");
        return set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      // Learning state
      currentLesson: null,
      currentReview: null,
      lessonQueue: [],
      reviewQueue: [],

      setLessonQueue: (lessons) => set({ lessonQueue: lessons }),
      setReviewQueue: (reviews) => set({ reviewQueue: reviews }),

      nextLesson: () =>
        set((state) => ({
          currentLesson: state.lessonQueue[0],
          lessonQueue: state.lessonQueue.slice(1),
        })),

      nextReview: () =>
        set((state) => ({
          currentReview: state.reviewQueue[0],
          reviewQueue: state.reviewQueue.slice(1),
        })),

      // Settings
      settings: {
        soundEnabled: true,
        autoPlayAudio: false,
        lessonBatchSize: 5,
        reviewBatchSize: 10,
        preferredMnemonicStyle: "visual",
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "kanjai-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        settings: state.settings,
      }),
    }
  )
);

export default useStore;
