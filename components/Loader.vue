<template>
  <div class="loading bg-transparent">
    <span class="loading__dot"></span>
    <span class="loading__dot"></span>
    <span class="loading__dot"></span>
  </div>
</template>

<style scoped>
.loading__dot {
  animation: dot ease-in-out 1s infinite;
  background-color: rgb(255, 255, 255);
  display: inline-block;
  height: 2px;
  width: 2px;
  margin: 1.5px;
  border-radius: 50%;
  mix-blend-mode: difference;
}

.loading__dot:nth-of-type(2) {
  animation-delay: 0.2s;
}

.loading__dot:nth-of-type(3) {
  animation-delay: 0.3s;
}

@keyframes dot {
  0% {
    background-color: white;
  }
  50% {
    background-color: rgba(255, 255, 255, 0.074);
  }
  100% {
    background-color: rgb(255, 255, 255);
  }
}
</style>
