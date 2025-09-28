import { defineStore } from "pinia";
import { infoQuery } from "~/queries/info";

// Interface for Portable Text structure
interface PortableTextBlock {
  _type: string;
  style?: string;
  children?: any[];
  markDefs?: any[];
  // Add other properties as needed
}

interface InfoData {
  _id: string;
  info: PortableTextBlock[];
  mainFilm: string;
  _updatedAt: string;
}

export const useInfoStore = defineStore("info", {
  state: () => ({
    info: null as InfoData | null,
    isLoaded: false,
  }),

  actions: {
    async fetchInfoData() {
      const sanity = useSanity();

      try {
        const data = await sanity.fetch(infoQuery);
        if (data) {
          this.info = data;
        }
      } catch (error) {
        console.error("Error fetching info data:", error);
      }
      this.isLoaded = true;
    },
  },
});
