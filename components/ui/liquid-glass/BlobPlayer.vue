<template>
  <div class="blob">
    <LiquidGlassPlayer :opacity="opacity" />
  </div>
</template>

<script setup lang="ts">
import LiquidGlassPlayer from "../liquid-glass/LiquidGlassPlayer.vue";

interface Props {
  opacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  opacity: 1,
});
</script>

<style>
.blob {
  width: 100%;
  height: 100%;
  transition: opacity 200ms ease-in-out;
}
</style>
