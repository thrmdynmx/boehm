<template>
  <div
    ref="logoRef"
    class="main relative text-white z-[1000] w-fit transition-all px-[25px] duration-200 ease-in-out whitespace-nowrap"
    :class="{
      'bounce-open':
        (isHovered || (isMobile && isMobileOpen)) && bounceOpen,
      'bounce-close':
        !isHovered && !(isMobile && isMobileOpen) && bounceClose,
      'px-[0px] py-[0px] cursor-pointer': route.path !== '/',
      'active': isMobile && isMobileOpen,
    }"
    :style="mainStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div>
      <Blob class="absolute top-0 left-0 z-[-1]" />
      <div
        class="header h-[57px] absolute top-0 left-0 transition-all duration-200 ease-in-out"
        :class="{
          'text-[10px]  px-[12px] py-[7px]': route.path !== '/',
          'px-[25px] py-[18px]': route.path === '/',
        }"
      >
        Noah Böhm
      </div>
      <div
        class="info-wrap w-fit overflow-y-hidden transition-all duration-200 relative top-[57px]"
        :style="{
          height:
            isHovered || (isMobile && mobileStore.isMainOpen)
              ? infoHeight + 'px'
              : '0px',
          width:
            isHovered || (isMobile && mobileStore.isMainOpen)
              ? infoWidth + 'px'
              : '0px',
        }"
      >
        <div ref="infoRef" class="info space-y-1 whitespace-nowrap">
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

  // Add click-away listener for mobile
  if (isMobile.value) {
    document.addEventListener("click", handleClickAway);
  }

  await infoStore.fetchInfoData();

  // Wait for next tick to ensure DOM is updated
  await nextTick();

  // Get the height and width of the info element
  if (infoRef.value) {
    // Temporarily make the element visible to measure its natural dimensions
    const originalStyle = infoRef.value.style.cssText;
    infoRef.value.style.width = "auto";
    infoRef.value.style.height = "auto";
    infoRef.value.style.visibility = "hidden";
    infoRef.value.style.position = "absolute";

    // Force a reflow to ensure the element is rendered
    infoRef.value.offsetHeight;

    // Now measure the dimensions
    infoHeight.value = infoRef.value.offsetHeight;
    infoWidth.value = infoRef.value.offsetWidth;

    // Restore original styles
    infoRef.value.style.cssText = originalStyle;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (isMobile.value) {
    document.removeEventListener("click", handleClickAway);
  }
});

// Watch for changes in info data and update dimensions
watch(
  () => infoStore.info,
  async (newInfo) => {
    await nextTick();
    if (infoRef.value) {
      // Temporarily make the element visible to measure its natural dimensions
      const originalStyle = infoRef.value.style.cssText;
      infoRef.value.style.width = "auto";
      infoRef.value.style.height = "auto";
      infoRef.value.style.visibility = "hidden";
      infoRef.value.style.position = "absolute";

      // Force a reflow to ensure the element is rendered
      infoRef.value.offsetHeight;

      // Now measure the dimensions
      infoHeight.value = infoRef.value.offsetHeight;
      infoWidth.value = infoRef.value.offsetWidth;

      // Restore original styles
      infoRef.value.style.cssText = originalStyle;

      console.log("Updated info dimensions:", {
        height: infoHeight.value,
        width: infoWidth.value,
      });
    }
  },
  { deep: true }
);

// Computed properties for info data and main style
const infoData = computed(() => infoStore.info);

const mainStyle = computed(() => {
  if (route.path !== "/") {
    return {
      width: "80px",
      height: "28px",
    };
  } else if (isHovered.value || (isMobile.value && mobileStore.isMainOpen)) {
    return {
      height: `${78 + infoHeight.value}px`,
      width: `${Math.max(128.56, infoWidth.value) + 50}px`,
    };
  } else {
    return {
      width: "128.56px",
      height: "57px",
    };
  }
});

// Hover event handlers
const handleMouseEnter = () => {
  if (route.path === "/") {
    // Reset bounce states
    bounceOpen.value = false;
    bounceClose.value = false;

    isHovered.value = true;

    // Trigger bounce after the transition completes (100ms)
    setTimeout(() => {
      bounceOpen.value = true;
      // Reset bounce after animation completes (300ms)
      setTimeout(() => {
        bounceOpen.value = false;
      }, 300);
    }, 100);
  }
};

const handleMouseLeave = () => {
  // Reset bounce states
  bounceOpen.value = false;
  bounceClose.value = false;

  isHovered.value = false;

  // Trigger bounce after the transition completes (100ms)
  setTimeout(() => {
    bounceClose.value = true;
    // Reset bounce after animation completes (300ms)
    setTimeout(() => {
      bounceClose.value = false;
    }, 300);
  }, 100);
};

// Click-away handler for mobile
const handleClickAway = (event) => {
  if (
    isMobile.value &&
    mobileStore.isMainOpen &&
    logoRef.value &&
    !logoRef.value.contains(event.target)
  ) {
    handleMobileClose();
  }
};

// Mobile-specific handlers
const handleMobileOpen = () => {
  if (isMobile.value && route.path === "/") {
    mobileStore.openMain();

    // Trigger bounce after the transition completes (100ms)
    setTimeout(() => {
      bounceOpen.value = true;
      // Reset bounce after animation completes (300ms)
      setTimeout(() => {
        bounceOpen.value = false;
      }, 300);
    }, 100);
  }
};

const handleMobileClose = () => {
  if (isMobile.value) {
    mobileStore.closeMain();

    // Trigger bounce after the transition completes (100ms)
    setTimeout(() => {
      bounceClose.value = true;
      // Reset bounce after animation completes (300ms)
      setTimeout(() => {
        bounceClose.value = false;
      }, 300);
    }, 100);
  }
};

const handleClick = (event) => {
  if (route.path !== "/") {
    router.push("/");
  } else if (isMobile.value && route.path === "/") {
    event.stopPropagation();
    if (mobileStore.isMainOpen) {
      handleMobileClose();
    } else {
      handleMobileOpen();
    }
  }
};

defineExpose({ logoRef });
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

.show {
  opacity: 1;
  transition: opacity 100ms ease-in;
}

.hide {
  opacity: 0;
  transition: 100ms;
}

.bounce-open {
  animation: bounceOpen 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.bounce-close {
  animation: bounceClose 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
