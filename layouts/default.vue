<template>
  <div>
    <VideoBackground
      :src="videoSrc"
      :class="route.path !== '/' ? 'hide-video' : 'show-video'"
    />

    <div
      class="absolute h-fit w-fit top-[50dvh] -translate-y-[50%] left-[50%] translate-x-[-50%] flex flex-col justify-center items-center transition-[opacity] duration-500"
    >
      <Main />

      <div
        class="spacer transition-all duration-500"
        :class="route.path !== '/' ? 'h-[85dvh]' : 'h-[20px]'"
      ></div>

      <Projects
        ref="projectsRef"
        :class="
          route.path !== '/' ? 'pointer-events-none' : 'pointer-events-auto'
        "
      />
    </div>

    <slot />
  </div>
</template>

<script setup>
import { useProjectsStore } from "~/stores/projects";

import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";

const projectsStore = useProjectsStore();

const route = useRoute();

const videoSrc = computed(() => {
  return "/vid.mp4";
});

onMounted(async () => {
  await projectsStore.fetchProjectsData();
  console.log(projectsStore.projects);
});
</script>

<style>
.hide-video {
  opacity: 0;
  transition: opacity 500ms 300ms ease-out, filter 500ms 300ms ease-in;
  filter: blur(10px);
}

.show-video {
  opacity: 1;
  transition: opacity 500ms 500ms;
  filter: blur(0px);
}
</style>
