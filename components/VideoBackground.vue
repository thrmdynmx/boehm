<template>
  <div class="w-full h-full object-cover z-[-1] fixed top-0 left-0">
    <video
      :src="src"
      ref="videoRef"
      autoplay
      playsinline
      muted
      loop
      class="main-video w-full h-full object-cover"
      :class="{ 'opacity-0': !isPlaying, 'opacity-100': isPlaying }"
      crossorigin="anonymous"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, provide } from "vue";

const props = defineProps({
  src: { type: String, required: true },
});

const isPlaying = ref(false);
const videoRef = ref(null);

onMounted(() => {
  const v = videoRef.value;
  if (!v) return;
  v.addEventListener(
    "playing",
    () => {
      isPlaying.value = true;
    },
    { passive: true }
  );
  v.addEventListener(
    "pause",
    () => {
      isPlaying.value = false;
    },
    { passive: true }
  );
});

// Provide to descendants so they can read frames for canvas/WebGL fallback
provide("videoRef", videoRef);
provide("videoSrc", props.src);
</script>

<style scoped>
.main-video {
  transition: opacity 0.5s ease-in-out;
}
.main-video.opacity-0 {
  opacity: 0;
}
.main-video.opacity-50 {
  opacity: 0.5;
}
</style>
