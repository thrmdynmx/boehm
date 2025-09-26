<template>
  <div>
    <div v-if="project">
      <Player :vimeoUrl="project.video" />
    </div>
    <div v-else-if="!projectsStore.isLoaded"></div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useProjectsStore } from "~/stores/projects";

const route = useRoute();
const projectsStore = useProjectsStore();

const project = ref(null);

onMounted(async () => {
  await projectsStore.fetchProjectsData();
  project.value = projectsStore.getProjectBySlug(route.params.slug);
});
</script>
