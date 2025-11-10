<template>
  <div class="slug-page relative">
    <div v-if="project" class="player-section">
      <Transition name="loader-fade" appear>
        <LoadingDots
          key="player-loader"
          class="player-loader"
          v-if="!isPlayerReady"
        />
      </Transition>
      <Player :vimeoUrl="project.video" @video-ready="handleVideoReady" />
    </div>
    <div v-else-if="!projectsStore.isLoaded" class="page-loader">
      <LoadingDots />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useProjectsStore } from "~/stores/projects";

const route = useRoute();
const projectsStore = useProjectsStore();

const project = ref(null);
const isPlayerReady = ref(false);

function handleVideoReady() {
  isPlayerReady.value = true;
}

async function loadProject() {
  isPlayerReady.value = false;
  project.value = null;
  await projectsStore.fetchProjectsData();
  project.value = projectsStore.getProjectBySlug(route.params.slug);
}

onMounted(async () => {
  await loadProject();
});

watch(
  () => route.params.slug,
  async () => {
    await loadProject();
  }
);
</script>

<style scoped>
.slug-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.player-section {
  position: relative;
  width: 100%;
}

.player-loader,
.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60dvh;
}

.player-loader {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.4s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
