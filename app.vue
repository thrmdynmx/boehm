<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import Blob from "~/components/ui/liquid-glass/Blob.vue";
</script>

<style>
html,
body {
  overflow: hidden;
  height: 100dvh;
}

body {
  font-family: Inter, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  background: black;
  color: white;
}

/* .blob {
  transition: width 0.2s, height 0.2s;
}

.blob.transition-position {
  transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s;
}

.blob.transition-away {
  transition: width 0.2s 0.2s, height 0.2s 0.2s, top 0.2s, left 0.2s;
} */

.header {
  font-weight: bold;
}
</style>
