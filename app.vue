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

/* Prevent double-tap to zoom on mobile devices */
html {
  touch-action: manipulation;
  -ms-touch-action: manipulation;
}

body {
  touch-action: manipulation;
  -ms-touch-action: manipulation;
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}

* {
  touch-action: manipulation;
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
