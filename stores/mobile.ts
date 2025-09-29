import { defineStore } from "pinia";
import { ref } from "vue";

export const useMobileStore = defineStore("mobile", () => {
  const isMainOpen = ref(false);
  const isProjectsOpen = ref(false);

  const openMain = () => {
    isMainOpen.value = true;
    isProjectsOpen.value = false;
  };

  const openProjects = () => {
    isProjectsOpen.value = true;
    isMainOpen.value = false;
  };

  const closeMain = () => {
    isMainOpen.value = false;
  };

  const closeProjects = () => {
    isProjectsOpen.value = false;
  };

  const closeAll = () => {
    isMainOpen.value = false;
    isProjectsOpen.value = false;
  };

  return {
    isMainOpen,
    isProjectsOpen,
    openMain,
    openProjects,
    closeMain,
    closeProjects,
    closeAll,
  };
});
