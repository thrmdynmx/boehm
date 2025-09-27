<template>
  <div
    class="player-container-wrapper mb-[30px]"
    :class="{ 'opacity-0': !isVideoReady }"
  >
    <div
      class="player-container relative select-none absolute left-1/2 -translate-x-1/2"
      :class="{
        fullscreen: isFullscreen,
        'cursor-hidden': isFullscreen && !showControls,
      }"
      ref="playerContainer"
    >
      <!-- Preload icons -->
      <div class="hidden">
        <Icon name="carbon:play-filled-alt" />
        <Icon name="carbon:pause-filled" />
        <Icon name="carbon:maximize" />
        <Icon name="carbon:minimize" />
        <Icon name="carbon:close-large" />
      </div>
      <video
        :src="vimeoUrl + '#t=0.01'"
        class="project-video w-full cursor-pointer"
        :class="{ fullscreen: isFullscreen }"
        playsinline
        ref="videoRef"
        @click="handleClick"
        @timeupdate="updateProgress"
        @mousemove="handleMouseMove"
        @ended="handleVideoEnd"
      >
        Your browser does not support video.
      </video>
      <div class="loading-message" :class="{ 'opacity-0': !isLoading }">
        <Loader />
      </div>
      <div
        v-if="isFullscreen && isMobile"
        class="fullscreen-placeholder w-[100dvw] aspect-[16/9]"
      ></div>

      <div
        class="custom-controls pointer-events-auto"
        :class="{ 'opacity-0': !isVideoReady }"
        @mouseover="handleMouseMove"
        @mouseleave="handleMouseLeave"
        ref="controlsRef"
      >
        <BlobPlayer
          class="absolute top-0 left-0 z-[-1]"
          :opacity="showControls ? 1 : 0"
        />
        <div
          class="container-container"
          :style="{ opacity: showControls ? 1 : 0 }"
        >
          <button @click="togglePlay" class="h-[15px] w-[15px]">
            <Icon
              :class="{ hidden: isPlaying }"
              name="carbon:play-filled-alt"
              class="w-full h-full block"
            />
            <Icon
              :class="{ hidden: !isPlaying }"
              name="carbon:pause-filled"
              class="w-full h-full block"
            />
          </button>
          <div
            class="timeline-container"
            @click="seek"
            @mousemove="handleTimelineHover"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            ref="timelineRef"
          >
            <div class="timeline">
              <div class="progress" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>
          <button @click="toggleFullscreen" class="h-[12px] w-[12px]">
            <Icon
              :class="{ hidden: isFullscreen }"
              name="carbon:maximize"
              class="w-full h-full block"
            />
            <Icon
              :class="{ hidden: !isFullscreen }"
              name="carbon:minimize"
              class="w-full h-full block"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted } from "vue";
import Loader from "../components/Loader.vue";
import BlobPlayer from "../components/ui/liquid-glass/BlobPlayer.vue";
import { useVideoStore } from "@/stores/video";

const props = defineProps({
  vimeoUrl: {
    type: String,
    required: true,
  },
});

const videoStore = useVideoStore();

const isMobile = ref(false);
const videoRef = ref(null);
const timelineRef = ref(null);
const playerContainer = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const progress = ref(0);
const duration = ref(0);
const currentTime = ref(0);
const showControls = ref(true);
const isVideoReady = ref(false);
const isFullscreen = ref(false);
const isScrubbing = ref(false);
const isLoading = ref(false);
let controlsTimeout;
let observer;
let animationFrameId;
const lastClickTime = ref(0);
let clickTimeout;

// Add refs for line positioning
const controlsRef = ref(null);

const emit = defineEmits(["video-ready"]);

// Video playback controls
function togglePlay() {
  if (!videoRef.value) return;

  if (videoRef.value.paused) {
    // Pause any currently playing video
    if (
      videoStore.currentPlaying &&
      videoStore.currentPlaying !== props.vimeoUrl
    ) {
      const otherPlayers = document.querySelectorAll("video");
      otherPlayers.forEach((player) => {
        if (player.src.includes(videoStore.currentPlaying)) {
          player.pause();
        }
      });
    }

    // Start playing this video
    videoRef.value
      .play()
      .then(() => {
        isPlaying.value = true;
        videoStore.setCurrentPlaying(props.vimeoUrl);
        resetControlsTimeout();

        // Scroll the player into view when it starts playing
        if (playerContainer.value) {
          playerContainer.value.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      })
      .catch((error) => {
        console.error("Error playing video:", error);
      });
  } else {
    // Just pause the current video without resetting
    videoRef.value.pause();
    isPlaying.value = false;
    videoStore.setCurrentPlaying(null);
    showControls.value = true;
    clearTimeout(controlsTimeout);
  }
}

// Add keyboard controls
function handleKeyPress(event) {
  // Handle keypresses if this is either:
  // 1. The currently playing video, or
  // 2. The last video that was playing (even if paused)
  if (
    videoStore.currentPlaying !== props.vimeoUrl &&
    videoStore.lastActiveVideo !== props.vimeoUrl
  )
    return;

  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePlay();
      break;
    case "KeyM":
      toggleMute();
      break;
    case "ArrowLeft":
      if (videoRef.value) {
        videoRef.value.currentTime = Math.max(
          0,
          videoRef.value.currentTime - 5
        );
      }
      break;
    case "ArrowRight":
      if (videoRef.value) {
        videoRef.value.currentTime = Math.min(
          videoRef.value.duration,
          videoRef.value.currentTime + 5
        );
      }
      break;
  }
}

// Timeline/progress functionality
function updateProgress() {
  if (!videoRef.value) return;
  currentTime.value = videoRef.value.currentTime;
  const value = (currentTime.value / videoRef.value.duration) * 100;
  progress.value = Math.min(100, Math.max(0, value));

  // Request next frame if video is playing
  if (!videoRef.value.paused) {
    animationFrameId = requestAnimationFrame(updateProgress);
  }
}

function seek(event) {
  if (!timelineRef.value || !videoRef.value) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const pos = Math.max(
    0,
    Math.min((event.clientX - rect.left) / rect.width, 1)
  );
  videoRef.value.currentTime = pos * videoRef.value.duration;
}

// Controls visibility
function handleMouseMove() {
  if (!showControls.value) {
    showControls.value = true;
  }
  resetControlsTimeout();
}

function handleMouseLeave() {
  if (isPlaying.value) {
    clearTimeout(controlsTimeout);
    showControls.value = false;
  }
}

function resetControlsTimeout() {
  clearTimeout(controlsTimeout);
  if (isPlaying.value) {
    controlsTimeout = setTimeout(() => {
      showControls.value = false;
    }, 2000);
  }
}

// Time formatting for hover
function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function handleTimelineHover(event) {
  if (!timelineRef.value || !videoRef.value) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const percentage = x / rect.width;
  const time = Math.max(0, percentage * videoRef.value.duration);

  timelineRef.value.style.setProperty("--x-position", `${x}px`);
  timelineRef.value.style.setProperty("--hover-time", `"${formatTime(time)}"`);
}

// Add fullscreen toggle function
function toggleFullscreen() {
  if (isMobile.value) {
    // For mobile devices
    if (videoRef.value) {
      if (videoRef.value.webkitEnterFullscreen) {
        // iOS Safari
        videoRef.value.webkitEnterFullscreen();
      } else if (videoRef.value.requestFullscreen) {
        // Other mobile browsers
        videoRef.value.requestFullscreen();
      }
    }
    isFullscreen.value = true;
    document.body.style.overflow = "hidden";
  } else {
    // Desktop behavior remains the same
    if (!document.fullscreenElement) {
      playerContainer.value.requestFullscreen();
      isFullscreen.value = true;
      document.body.style.overflow = "hidden";
    } else {
      document.exitFullscreen();
      isFullscreen.value = false;
      document.body.style.overflow = "";
    }
  }
}

// Add the fullscreen change handler function
function handleFullscreenChange() {
  isFullscreen.value = !!(
    document.fullscreenElement || document.webkitFullscreenElement
  );

  // Handle body overflow
  if (isFullscreen.value) {
    document.body.style.overflow = "hidden";
    showControls.value = true; // Show controls when entering fullscreen
    resetControlsTimeout(); // Start the timeout for hiding controls
  } else {
    document.body.style.overflow = "";
    showControls.value = true; // Always show controls when exiting fullscreen
    clearTimeout(controlsTimeout); // Clear any pending timeout
  }
}

// Add fullscreen change event listener
onMounted(() => {
  isMobile.value = window.innerWidth < 768;

  // Initialize video event listeners
  if (videoRef.value) {
    videoRef.value.addEventListener("loadedmetadata", () => {
      isVideoReady.value = true;
      duration.value = videoRef.value.duration;
      updateProgress();
      emit("video-ready");
    });

    // Add waiting event listener for loading state
    videoRef.value.addEventListener("waiting", () => {
      const seekingTimeout = setTimeout(() => {
        isLoading.value = true;
      }, 500);

      // Store the timeout ID so we can clear it when seeking is complete
      videoRef.value.addEventListener(
        "seeked",
        () => {
          clearTimeout(seekingTimeout);
          isLoading.value = false;
        },
        { once: true }
      );
    });

    videoRef.value.addEventListener("playing", () => {
      isLoading.value = false;
    });

    videoRef.value.addEventListener("canplay", () => {
      isLoading.value = false;
    });

    videoRef.value.addEventListener("seeking", () => {
      const seekingTimeout = setTimeout(() => {
        isLoading.value = true;
      }, 500);

      // Store the timeout ID so we can clear it when seeking is complete
      videoRef.value.addEventListener(
        "seeked",
        () => {
          clearTimeout(seekingTimeout);
          isLoading.value = false;
        },
        { once: true }
      );
    });

    // Add play/pause event listeners to start/stop animation frame updates
    videoRef.value.addEventListener("play", () => {
      animationFrameId = requestAnimationFrame(updateProgress);
    });

    videoRef.value.addEventListener("pause", () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    // Add fullscreen change listeners for both standard and webkit
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    // Add video-specific fullscreen listeners for iOS
    videoRef.value.addEventListener("webkitbeginfullscreen", () => {
      isFullscreen.value = true;
    });
    videoRef.value.addEventListener("webkitendfullscreen", () => {
      isFullscreen.value = false;
      document.body.style.overflow = "";
      // Set isPlaying to false since video will be paused
      isPlaying.value = false;
      setCurrentPlaying(null);
    });

    // Add intersection observer
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoRef.value && isPlaying.value) {
            videoRef.value.pause();
            isPlaying.value = false;

            videoStore.setCurrentPlaying(null);
          }
        });
      },
      {
        threshold: 0.1, // When 50% of the video is out of view
      }
    );

    observer.observe(videoRef.value);
  }

  // Initialize controls state
  showControls.value = true;

  // Add keyboard event listener
  window.addEventListener("keydown", handleKeyPress);
});

function handleClick(event) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastClickTime.value;

  if (timeDiff < 200) {
    // Double click detected - toggle fullscreen and play state
    toggleFullscreen();
    togglePlay();
    lastClickTime.value = 0; // Reset the time
  } else {
    // First click - execute play/pause immediately
    togglePlay();
    lastClickTime.value = currentTime;
  }
}

// Add mobile scrubbing functions
function handleTouchStart(event) {
  if (!timelineRef.value || !videoRef.value) return;
  isScrubbing.value = true;
  handleTouchMove(event);
}

function handleTouchMove(event) {
  if (!isScrubbing.value || !timelineRef.value || !videoRef.value) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const touch = event.touches[0];
  const pos = Math.max(
    0,
    Math.min((touch.clientX - rect.left) / rect.width, 1)
  );
  videoRef.value.currentTime = pos * videoRef.value.duration;
}

function handleTouchEnd() {
  isScrubbing.value = false;
}

function handleVideoEnd() {
  if (videoRef.value) {
    videoRef.value.currentTime = 0.01;
    isPlaying.value = false;
    videoStore.setCurrentPlaying(null);
  }
}

// Add watcher for currentPlaying changes
watch(
  () => videoStore.currentPlaying,
  (newUrl) => {
    if (newUrl !== props.vimeoUrl && videoRef.value) {
      isPlaying.value = false;
    }
  }
);

// Add cleanup for observer
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style>
.player-container-wrapper {
  height: calc(60dvh + 42px);
  transition: opacity 0.2s ease-in-out;
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeIn 1.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.project-video.fullscreen {
  cursor: default;
}

.project-video {
  height: 60dvh;
  max-width: unset;
  width: auto;
  border-radius: 15px;
}

.player-container {
  height: fit-content;
  width: fit-content;
}

.custom-controls {
  height: fit-content;
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 10px;
  gap: 10px;
  pointer-events: auto;
  width: 80%;
  z-index: 100;
  transition: opacity 0.2s ease-in-out;
  border-radius: 3px;
  font-family: "Helvetica Neue";
  position: relative;
}

.fullscreen .custom-controls {
  position: fixed;
  bottom: 100px;
  left: 20%;
  width: 60%;
  transform: none;
}

.custom-controls.opacity-0 {
  opacity: 0;
  pointer-events: none;
}

.custom-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  text-align: left;
  width: 100%;
}

.custom-buttons div {
  flex: 1;
}

.container-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: opacity 0.2s ease-in-out;
}

.timeline-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  height: 20px;
  position: relative;
  cursor: pointer;
  touch-action: none;
}

.timeline {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  margin: 9px 0;
  overflow: hidden;
}

.progress {
  position: absolute;
  height: 100%;
  background: white;
  will-change: width;
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button:focus {
  outline: none;
}

.timeline-container::before {
  content: "";
  position: absolute;
  height: 8px;
  width: 2px;
  background: rgba(255, 255, 255, 0.8);
  top: 6px;
  left: var(--x-position, -100px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  will-change: left;
  border-radius: 10px;
}

.timeline-container:hover::after {
  opacity: 1;
}

.timeline-container:hover::before {
  opacity: 1;
}

.project-video {
  overflow: hidden;
}

.project-video.fullscreen {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cursor-hidden {
  cursor: none !important;
}

.cursor-hidden * {
  cursor: none !important;
}

@media (max-width: 768px) {
  .custom-buttons {
    display: grid;

    align-items: center;
    text-align: left;
    width: 100%;
  }

  .project-video {
    width: 100%;
    height: unset;
  }

  .project-video.fullscreen {
    width: 100%;
  }

  .fullscreen .custom-controls {
    display: none;
  }
  .custom-controls {
    width: calc(80%);
    transform: none;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
  }

  .player-container-wrapper {
    height: unset;
  }

  .reset-pos {
    display: none;
  }

  .timeline {
    height: 4px;
  }

  .timeline-container {
    width: 80%;
  }

  .timeline-container::before {
    display: none;
  }

  .timeline-container::after {
    display: none;
  }

  .progress {
    transition: none;
  }

  .player-container {
    width: calc(100vw - 20px);
  }
}

.loading-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}
</style>
