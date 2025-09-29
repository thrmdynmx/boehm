<template>
  <div
    ref="logoRef"
    class="projects relative text-white z-[1000] w-fit transition-all duration-200 ease-in-out whitespace-nowrap"
    :class="{
      'bounce-open': (isHovered || (isMobile && isMobileOpen)) && bounceOpen,
      'bounce-close': !isHovered && !(isMobile && isMobileOpen) && bounceClose,
    }"
    :style="mainStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div>
      <Blob class="absolute top-0 left-0 z-[-1]" />
      <div class="header h-[57px] overflow-hidden">
        <div
          class="header-content relative transition-all duration-500"
          :class="
            route.path !== '/' ? '-translate-y-[121px]' : '-translate-y-[0]'
          "
        >
          <div class="header-text pt-[18px] px-[25px]">Selected Projects</div>
          <div class="h-[100px]"></div>
          <div
            ref="projectTitleRef"
            class="project-title w-full text-center whitespace-nowrap"
          >
            {{ currentProjectTitle }}
          </div>
          <div class="h-[100px]"></div>
        </div>
      </div>
      <div
        class="projects-wrap w-fit overflow-y-hidden transition-all duration-200"
        :style="{
          height:
            isHovered || (isMobile && isMobileOpen) ? infoHeight + 'px' : '0px',
          width:
            isHovered || (isMobile && isMobileOpen) ? infoWidth + 'px' : '0px',
        }"
      >
        <div
          ref="projectsRef"
          class="projects space-y-1 whitespace-nowrap pb-[18px] px-[25px]"
        >
          <NuxtLink
            v-for="(project, index) in projects"
            :key="project._id"
            :to="`/${project.slug}`"
            class="project-item"
            @click="handleProjectClick(project.title, index)"
          >
            {{ project.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Blob from "../components/ui/liquid-glass/Blob.vue";

const testTitle = "testi";

const projectsStore = useProjectsStore();

const projects = computed(() => projectsStore.projects);

const route = useRoute();

const logoRef = ref(null);
const projectsRef = ref(null);
const projectTitleRef = ref(null);
const isHovered = ref(false);
const isMobileOpen = ref(false);
const infoHeight = ref(0);
const infoWidth = ref(0);
const projectTitleWidth = ref(0);
const bounceOpen = ref(false);
const bounceClose = ref(false);
const widthTransitionTimeout = ref(null);
const shouldUseDynamicWidth = ref(false);
const currentProjectTitle = ref("Test Title Test Title Test Title");
const isLastProject = ref(false);
const isMobile = ref(false);

// Mobile detection
const detectMobile = () => {
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window;
};

// Function to handle project click
const handleProjectClick = async (projectTitle, projectIndex) => {
  // Update the current project title
  currentProjectTitle.value = projectTitle;

  // Check if this is the last project
  isLastProject.value = projectIndex === projects.value.length - 1;

  // Wait for DOM update and then measure the new width
  await nextTick();
  await measureProjectTitleWidth();
};

// Function to measure project title width
const measureProjectTitleWidth = async () => {
  await nextTick();

  if (projectTitleRef.value) {
    // Temporarily make the element visible to measure its natural dimensions
    const originalStyle = projectTitleRef.value.style.cssText;
    projectTitleRef.value.style.width = "auto";
    projectTitleRef.value.style.visibility = "hidden";
    projectTitleRef.value.style.position = "absolute";

    // Force a reflow to ensure the element is rendered
    projectTitleRef.value.offsetWidth;

    // Now measure the width
    projectTitleWidth.value = projectTitleRef.value.offsetWidth;

    // Restore original styles
    projectTitleRef.value.style.cssText = originalStyle;
  }
};

// Function to measure projects dimensions
const measureProjectsDimensions = async () => {
  await nextTick();

  // Get the height and width of the projects element
  if (projectsRef.value) {
    // Temporarily make the element visible to measure its natural dimensions
    const originalStyle = projectsRef.value.style.cssText;
    projectsRef.value.style.width = "auto";
    projectsRef.value.style.height = "auto";
    projectsRef.value.style.visibility = "hidden";
    projectsRef.value.style.position = "absolute";

    // Force a reflow to ensure the element is rendered
    projectsRef.value.offsetHeight;

    // Now measure the dimensions
    infoHeight.value = projectsRef.value.offsetHeight;
    infoWidth.value = projectsRef.value.offsetWidth;

    // Restore original styles
    projectsRef.value.style.cssText = originalStyle;
  }
};

// Watch for when projects are loaded and recalculate dimensions
watch(
  () => projectsStore.isLoaded,
  async (isLoaded) => {
    if (isLoaded) {
      await measureProjectsDimensions();

      // Set project title based on current slug if not on home page
      if (route.path !== "/") {
        const currentSlug = route.params.slug;
        if (currentSlug) {
          setProjectTitleFromSlug(currentSlug);
        }
      }
    }
  },
  { immediate: true }
);

// Function to set current project title based on slug
const setProjectTitleFromSlug = (slug) => {
  if (slug && projects.value.length > 0) {
    const project = projects.value.find((p) => p.slug === slug);
    if (project) {
      currentProjectTitle.value = project.title;
    }
  }
};

// Fetch projects data on mount
onMounted(async () => {
  detectMobile();

  // Add click-away listener for mobile
  if (isMobile.value) {
    document.addEventListener("click", handleClickAway);
  }

  // Fetch projects data first
  await projectsStore.fetchProjectsData();

  // Measure projects dimensions (will be recalculated when projects load)
  await measureProjectsDimensions();

  // Measure project title width on mount
  await measureProjectTitleWidth();

  // Set initial shouldUseDynamicWidth based on current route
  if (route.path !== "/") {
    shouldUseDynamicWidth.value = true;
    // Set project title based on current slug
    const currentSlug = route.params.slug;
    if (currentSlug) {
      setProjectTitleFromSlug(currentSlug);
    }
  }
});

// Computed property to determine if we should use dynamic width
const isNotIndexPage = computed(() => route.path !== "/");

// Watch for route changes to remeasure project title width
watch(
  () => route.path,
  async (newPath, oldPath) => {
    // Clear any existing timeout
    if (widthTransitionTimeout.value) {
      clearTimeout(widthTransitionTimeout.value);
    }

    // Set project title based on new slug if not on home page
    if (newPath !== "/") {
      const newSlug = route.params.slug;
      if (newSlug) {
        setProjectTitleFromSlug(newSlug);
      }
    }

    // If leaving index page, wait before measuring and changing width
    if (oldPath === "/" && newPath !== "/") {
      // Immediately set to not use dynamic width (keeps 166.73px)
      shouldUseDynamicWidth.value = false;

      handleMouseLeave();

      widthTransitionTimeout.value = setTimeout(async () => {
        await measureProjectTitleWidth();
        // Now enable dynamic width after measurement
        shouldUseDynamicWidth.value = true;
      }, 100);
    } else if (newPath === "/") {
      // Going back to index page - immediately use static width
      shouldUseDynamicWidth.value = false;
      await measureProjectTitleWidth();
    } else {
      // For other route changes, measure immediately and use dynamic width
      await measureProjectTitleWidth();
      shouldUseDynamicWidth.value = true;
    }
  },
  { immediate: false }
);

// Computed properties for main style
const mainStyle = computed(() => {
  if (isHovered.value || (isMobile.value && isMobileOpen.value)) {
    return {
      height: `${57 + infoHeight.value}px`,
      width: `${Math.max(166.73, infoWidth.value)}px`,
    };
  } else {
    // Use project title width + 50px padding when not on index page and shouldUseDynamicWidth is true, otherwise use default 166.73px
    const baseWidth =
      isNotIndexPage.value && shouldUseDynamicWidth.value
        ? projectTitleWidth.value + 50
        : 166.73;
    return {
      height: "57px",
      width: `${baseWidth}px`,
    };
  }
});

// Hover event handlers
const handleMouseEnter = () => {
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
    isMobileOpen.value &&
    logoRef.value &&
    !logoRef.value.contains(event.target)
  ) {
    handleMobileClose();
  }
};

// Mobile-specific handlers
const handleMobileOpen = () => {
  if (isMobile.value && route.path === "/") {
    isMobileOpen.value = true;

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
    isMobileOpen.value = false;

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
  if (isMobile.value && route.path === "/") {
    event.stopPropagation();
    if (isMobileOpen.value) {
      handleMobileClose();
    } else {
      handleMobileOpen();
    }
  }
};

// Cleanup timeout on unmount
onUnmounted(() => {
  if (widthTransitionTimeout.value) {
    clearTimeout(widthTransitionTimeout.value);
  }

  if (isMobile.value) {
    document.removeEventListener("click", handleClickAway);
  }
});

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

.bounce-open {
  animation: bounceOpen 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.bounce-close {
  animation: bounceClose 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.project-item {
  display: block;
}
</style>
