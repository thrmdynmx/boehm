<template>
  <div
    ref="logoRef"
    class="projects relative text-white z-[1000] w-fit transition-all duration-200 ease-in-out whitespace-nowrap select-none"
    :class="{
      'bounce-open': route.path === '/' && !isMobile && isHovered && bounceOpen,
      'bounce-close':
        route.path === '/' && !isMobile && !isHovered && bounceClose,
      active: isMobile && isMobileOpen,
    }"
    :style="mainStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div>
      <Blob class="absolute top-0 left-0 z-[-1]" />
      <div class="header h-[57px] overflow-hidden" @click="handleClick">
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
            route.path === '/' && (isHovered || (isMobile && isMobileOpen))
              ? infoHeight + 'px'
              : '0px',
          width:
            route.path === '/' && (isHovered || (isMobile && isMobileOpen))
              ? infoWidth + 'px'
              : '0px',
        }"
      >
        <div
          ref="projectsRef"
          class="projects space-y-1 whitespace-nowrap pb-[18px] px-[25px]"
        >
          <LinkButton
            v-for="(project, index) in projects"
            :key="project._id"
            :to="`/${project.slug}`"
            class="project-item"
            @click="handleProjectClick(project.title, index)"
          >
            {{ project.title }}
          </LinkButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Blob from "../components/ui/liquid-glass/Blob.vue";

const projectsStore = useProjectsStore();
const projects = computed(() => projectsStore.projects);
const route = useRoute();
const router = useRouter();

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
const currentProjectTitle = ref("");
const isLastProject = ref(false);
const isMobile = ref(false);
const activeMobileBubble = useState("activeMobileBubble", () => null);

const detectMobile = () => {
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window;
};

const handleProjectClick = async (projectTitle, projectIndex) => {
  currentProjectTitle.value = projectTitle;
  isLastProject.value = projectIndex === projects.value.length - 1;
  await nextTick();
  await measureProjectTitleWidth();
};

const measureProjectTitleWidth = async () => {
  await nextTick();
  if (projectTitleRef.value) {
    const originalStyle = projectTitleRef.value.style.cssText;
    projectTitleRef.value.style.width = "auto";
    projectTitleRef.value.style.visibility = "hidden";
    projectTitleRef.value.style.position = "absolute";
    projectTitleRef.value.offsetWidth;
    projectTitleWidth.value = projectTitleRef.value.offsetWidth;
    projectTitleRef.value.style.cssText = originalStyle;
  }
};

const measureProjectsDimensions = async () => {
  await nextTick();
  if (projectsRef.value) {
    const originalStyle = projectsRef.value.style.cssText;
    projectsRef.value.style.width = "auto";
    projectsRef.value.style.height = "auto";
    projectsRef.value.style.visibility = "hidden";
    projectsRef.value.style.position = "absolute";
    projectsRef.value.offsetHeight;
    infoHeight.value = projectsRef.value.offsetHeight;
    infoWidth.value = projectsRef.value.offsetWidth;
    projectsRef.value.style.cssText = originalStyle;
  }
};

watch(
  () => projectsStore.isLoaded,
  async (isLoaded) => {
    if (isLoaded) {
      await measureProjectsDimensions();
      if (route.path !== "/") {
        const currentSlug = route.params.slug;
        if (currentSlug) setProjectTitleFromSlug(currentSlug);
      }
    }
  },
  { immediate: true }
);

const setProjectTitleFromSlug = (slug) => {
  if (slug && projects.value.length > 0) {
    const project = projects.value.find((p) => p.slug === slug);
    if (project) currentProjectTitle.value = project.title;
  }
};

onMounted(async () => {
  detectMobile();
  if (isMobile.value) {
    document.addEventListener("click", handleClickAway);
  }
  await projectsStore.fetchProjectsData();
  await measureProjectsDimensions();
  await measureProjectTitleWidth();
  if (route.path !== "/") {
    shouldUseDynamicWidth.value = true;
    const currentSlug = route.params.slug;
    if (currentSlug) setProjectTitleFromSlug(currentSlug);
  }
});

const isNotIndexPage = computed(() => route.path !== "/");

watch(
  () => route.path,
  async (newPath, oldPath) => {
    if (widthTransitionTimeout.value)
      clearTimeout(widthTransitionTimeout.value);
    if (newPath !== "/") {
      const newSlug = route.params.slug;
      if (newSlug) setProjectTitleFromSlug(newSlug);
    }
    if (oldPath === "/" && newPath !== "/") {
      shouldUseDynamicWidth.value = false;
      handleMouseLeave();
      widthTransitionTimeout.value = setTimeout(async () => {
        await measureProjectTitleWidth();
        shouldUseDynamicWidth.value = true;
      }, 100);
    } else if (newPath === "/") {
      shouldUseDynamicWidth.value = false;
      await measureProjectTitleWidth();
    } else {
      await measureProjectTitleWidth();
      shouldUseDynamicWidth.value = true;
    }
  }
);

const mainStyle = computed(() => {
  if (
    (isHovered.value && route.path === "/" && !isMobile.value) ||
    (isMobile.value && isMobileOpen.value && route.path === "/")
  ) {
    return {
      height: `${57 + infoHeight.value}px`,
      width: `${Math.max(166.73, infoWidth.value)}px`,
    };
  } else {
    const baseWidth =
      isNotIndexPage.value && shouldUseDynamicWidth.value
        ? projectTitleWidth.value + 50
        : 166.73;
    return { height: "57px", width: `${baseWidth}px` };
  }
});

// Hover only desktop + "/"
const handleMouseEnter = () => {
  if (isMobile.value || route.path !== "/") return;
  bounceOpen.value = false;
  bounceClose.value = false;
  isHovered.value = true;
  setTimeout(() => {
    bounceOpen.value = true;
    setTimeout(() => (bounceOpen.value = false), 300);
  }, 100);
};
const handleMouseLeave = () => {
  if (isMobile.value || route.path !== "/") return;
  bounceOpen.value = false;
  bounceClose.value = false;
  isHovered.value = false;
  setTimeout(() => {
    bounceClose.value = true;
    setTimeout(() => (bounceClose.value = false), 300);
  }, 100);
};

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

const openComponent = () => {
  if (isMobileOpen.value) return;
  isMobileOpen.value = true;
  setTimeout(() => {
    bounceOpen.value = true;
    setTimeout(() => (bounceOpen.value = false), 300);
  }, 100);
};

const closeComponent = (skipStateUpdate = false) => {
  if (!isMobileOpen.value) return;
  isMobileOpen.value = false;
  if (!skipStateUpdate && activeMobileBubble.value === "projects") {
    activeMobileBubble.value = null;
  }
  setTimeout(() => {
    bounceClose.value = true;
    setTimeout(() => (bounceClose.value = false), 300);
  }, 100);
};

const handleMobileToggle = () => {
  if (!isMobile.value || route.path !== "/") return;
  if (isMobileOpen.value) {
    closeComponent();
  } else {
    activeMobileBubble.value = "projects";
    openComponent();
  }
};

const handleMobileClose = () => {
  if (!isMobile.value) return;
  closeComponent();
};

const handleClick = (event) => {
  if (!isMobile.value) return; // desktop has no click toggle

  if (route.path === "/") {
    if (isMobileOpen.value) {
      return; // already open → let links work
    }
    event.preventDefault();
    event.stopPropagation();
    handleMobileToggle();
  } else {
    router.push("/"); // mobile, not home → go home
  }
};

watch(
  () => route.path,
  (newPath) => {
    if (newPath !== "/" && isMobile.value && isMobileOpen.value) {
      closeComponent();
    }

    // ✅ when going back to home, reset state to closed
    if (newPath === "/") {
      if (isMobile.value && isMobileOpen.value) {
        closeComponent();
      }
      isHovered.value = false;
    }
  }
);

watch(activeMobileBubble, (value) => {
  if (!isMobile.value) return;
  if (value !== "projects" && isMobileOpen.value) {
    closeComponent(true);
  }
});

onUnmounted(() => {
  if (widthTransitionTimeout.value) clearTimeout(widthTransitionTimeout.value);
  if (isMobile.value) {
    document.removeEventListener("click", handleClickAway);
  }
});

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
