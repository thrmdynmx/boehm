<template>
  <div
    class="link-button block w-fit"
    @click="navigate"
    role="button"
    tabindex="0"
    @keyup.enter="navigate"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
});

const navigate = () => {
  if (props.to) {
    router.push(props.to);
  }
};
</script>

<style scoped>
.link-button {
  cursor: pointer;
  outline: none;
}
</style>
