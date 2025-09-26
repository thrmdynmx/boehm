import { defineStore } from "pinia";

export const useVideoStore = defineStore("video", {
  state: () => ({
    currentPlaying: null as string | null,
    lastActiveVideo: null as string | null,
  }),
  actions: {
    setCurrentPlaying(url: string | null) {
      if (this.currentPlaying) {
        this.lastActiveVideo = this.currentPlaying;
      }
      this.currentPlaying = url;
    },
  },
});
