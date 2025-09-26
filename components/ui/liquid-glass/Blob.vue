<template>
  <div class="blob">
    <LiquidGlass :squircle="squircle" />
  </div>
</template>

<script setup lang="ts">
import LiquidGlass from "../liquid-glass/LiquidGlass.vue";

interface Props {
  squircle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  squircle: true,
});
</script>

<style>
.blob {
  width: 100%;
  height: 100%;
}
</style>
