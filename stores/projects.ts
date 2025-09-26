import { defineStore } from "pinia";
import { projectsQuery } from "~/queries/projects";

// Update the interface to reflect Portable Text structure
interface PortableTextBlock {
  _type: string;
  style?: string;
  children?: any[];
  markDefs?: any[];
  // Add other properties as needed
}

interface projectsData {
  _id: string;
  title: string;
  slug: string;
  _updatedAt: string;
  video: any;
  client: string;
  info: PortableTextBlock[];
}

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    projects: [] as projectsData[],
    isLoaded: false,
  }),

  actions: {
    async fetchProjectsData() {
      const sanity = useSanity();

      try {
        const data = await sanity.fetch(projectsQuery);
        if (data && data.length > 0) {
          this.projects = data;
        }
      } catch (error) {
        console.error("Error fetching projects data:", error);
      }
      this.isLoaded = true;
    },

    getProjectBySlug(slug: string) {
      return this.projects.find((project) => project.slug === slug) || null;
    },
  },
});
