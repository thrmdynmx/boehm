<template>
  <div
    ref="logoRef"
    class="main relative text-white z-[1000] w-fit transition-all px-[25px] duration-200 ease-in-out whitespace-nowrap"
    :class="{
      'bounce-open': (isHovered || (isMobile && isMobileOpen)) && bounceOpen,
      'bounce-close': !isHovered && !(isMobile && isMobileOpen) && bounceClose,
      'px-[0px] py-[0px] cursor-pointer': route.path !== '/',
      active: isMobile && isMobileOpen,
    }"
    :style="mainStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div>
      <Blob class="absolute top-0 left-0 z-[-1]" />
      <div
        class="header h-[57px] absolute top-0 left-0 transition-all duration-200 ease-in-out select-none"
        :class="{
          'text-[10px]  px-[12px] py-[7px]': route.path !== '/',
          'px-[25px] py-[18px]': route.path === '/',
        }"
        @click="handleClick"
      >
        Noah Böhm
      </div>
      <div
        class="info-wrap w-fit overflow-y-hidden transition-all duration-200 relative top-[57px]"
        :style="{
          height:
            isHovered || (isMobile && isMobileOpen) ? infoHeight + 'px' : '0px',
          width:
            isHovered || (isMobile && isMobileOpen) ? infoWidth + 'px' : '0px',
          'pointer-events': contentInteractive ? 'auto' : 'none',
        }"
      >
        <div
          ref="infoRef"
          class="info space-y-1 whitespace-nowrap"
          :style="{ 'pointer-events': contentInteractive ? 'auto' : 'none' }"
        >
          <!-- text here -->
          <RichText v-if="infoData && infoData.info" :content="infoData.info" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Blob from "../components/ui/liquid-glass/Blob.vue";
import RichText from "./RichText.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useInfoStore } from "~/stores/info";

const route = useRoute();
const router = useRouter();

const logoRef = ref(null);
const infoRef = ref(null);
const isHovered = ref(false);
const isMobileOpen = ref(false);
const infoHeight = ref(0);
const infoWidth = ref(0);
const bounceOpen = ref(false);
const bounceClose = ref(false);
const isMobile = ref(false);
const contentInteractive = ref(false); // NEW: control pointer-events

const infoStore = useInfoStore();

// Mobile detection
const detectMobile = () => {
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window;
};

// Fetch info data on mount
onMounted(async () => {
  detectMobile();

  if (isMobile.value) {
    document.addEventListener("click", handleClickAway);
  }

  await infoStore.fetchInfoData();
  await nextTick();

  if (infoRef.value) {
    const originalStyle = infoRef.value.style.cssText;
    infoRef.value.style.width = "auto";
    infoRef.value.style.height = "auto";
    infoRef.value.style.visibility = "hidden";
    infoRef.value.style.position = "absolute";

    infoRef.value.offsetHeight;

    infoHeight.value = infoRef.value.offsetHeight;
    infoWidth.value = infoRef.value.offsetWidth;

    infoRef.value.style.cssText = originalStyle;
  }
});

// Watch for route changes
watch(
  () => route.path,
  (newPath) => {
    if (newPath !== "/" && isMobile.value && isMobileOpen.value) {
      handleMobileClose();
    }
  }
);

onUnmounted(() => {
  if (isMobile.value) {
    document.removeEventListener("click", handleClickAway);
  }
});

// Watch for info updates
watch(
  () => infoStore.info,
  async () => {
    await nextTick();
    if (infoRef.value) {
      const originalStyle = infoRef.value.style.cssText;
      infoRef.value.style.width = "auto";
      infoRef.value.style.height = "auto";
      infoRef.value.style.visibility = "hidden";
      infoRef.value.style.position = "absolute";

      infoRef.value.offsetHeight;

      infoHeight.value = infoRef.value.offsetHeight;
      infoWidth.value = infoRef.value.offsetWidth;

      infoRef.value.style.cssText = originalStyle;
    }
  },
  { deep: true }
);

// Computed
const infoData = computed(() => infoStore.info);

const mainStyle = computed(() => {
  if (route.path !== "/") {
    return { width: "80px", height: "28px" };
  } else if (isHovered.value || (isMobile.value && isMobileOpen.value)) {
    return {
      height: `${78 + infoHeight.value}px`,
      width: `${Math.max(128.56, infoWidth.value) + 50}px`,
    };
  } else {
    return { width: "128.56px", height: "57px" };
  }
});

// Hover handlers
const handleMouseEnter = () => {
  if (route.path === "/") {
    bounceOpen.value = false;
    bounceClose.value = false;
    isHovered.value = true;

    setTimeout(() => {
      bounceOpen.value = true;
      setTimeout(() => (bounceOpen.value = false), 300);
    }, 100);
  }
};

const handleMouseLeave = () => {
  bounceOpen.value = false;
  bounceClose.value = false;
  isHovered.value = false;

  setTimeout(() => {
    bounceClose.value = true;
    setTimeout(() => (bounceClose.value = false), 300);
  }, 100);
};

// Click-away
const handleClickAway = (event) => {
  if (
    isMobile.value &&
    isMobileOpen.value &&
    logoRef.value &&
    !logoRef.value.contains(event.target)
  ) {
    handleMobileClose();
  }
};

// Mobile toggle
const handleMobileToggle = () => {
  if (!isMobile.value) return;

  if (route.path === "/") {
    const projectsElement = document.querySelector(".projects.active");
    if (projectsElement) {
      const projectsComponent = projectsElement.__vueParentComponent;
      if (projectsComponent?.exposed?.handleMobileClose) {
        projectsComponent.exposed.handleMobileClose();
      }
      setTimeout(() => toggleThisComponent(), 50);
      return;
    }

    toggleThisComponent();
  }
};

const toggleThisComponent = () => {
  if (isMobileOpen.value) {
    isMobileOpen.value = false;
    contentInteractive.value = false;
    setTimeout(() => {
      bounceClose.value = true;
      setTimeout(() => (bounceClose.value = false), 300);
    }, 100);
  } else {
    isMobileOpen.value = true;
    contentInteractive.value = false;
    setTimeout(() => (contentInteractive.value = true), 300); // enable after bounce
    setTimeout(() => {
      bounceOpen.value = true;
      setTimeout(() => (bounceOpen.value = false), 300);
    }, 100);
  }
};

const handleMobileClose = () => {
  if (!isMobile.value) return;
  isMobileOpen.value = false;
  contentInteractive.value = false;
  setTimeout(() => {
    bounceClose.value = true;
    setTimeout(() => (bounceClose.value = false), 300);
  }, 100);
};

const handleClick = (event) => {
  if (route.path !== "/") {
    router.push("/");
    return;
  }

  if (isMobile.value && route.path === "/") {
    event.preventDefault();
    event.stopPropagation();
    handleMobileToggle();
  }
};

defineExpose({ logoRef, handleMobileClose });
</script>

<style scoped>
@keyframes bounceOpen {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes bounceClose {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.97);
  }
  100% {
    transform: scale(1);
  }
}
.main {
  white-space: nowrap;
}
.bounce-open {
  animation: bounceOpen 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.bounce-close {
  animation: bounceClose 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
