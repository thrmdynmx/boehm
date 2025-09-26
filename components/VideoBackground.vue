<template>
  <video
    :src="src"
    autoplay
    playsinline
    muted
    loop
    class="w-full h-full object-cover z-[-1] fixed top-0 left-0"
  />
</template>

<script setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
});
</script>
