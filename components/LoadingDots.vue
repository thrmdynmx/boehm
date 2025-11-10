<template>
  <div class="loading-dots-wrapper">
    <div class="loader">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<style scoped>
.loading-dots-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
  height: 100%;
}

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;

  backdrop-filter: blur(10px);
  box-shadow: inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 0 20px 0 rgba(0, 0, 0, 0.06);
  animation: l3 1s infinite ease-in-out;
}

.dot:nth-of-type(2) {
  animation-delay: 0.15s;
}

.dot:nth-of-type(3) {
  animation-delay: 0.3s;
}

@keyframes l3 {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
