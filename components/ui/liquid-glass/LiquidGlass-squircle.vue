<template>
  <div
    ref="liquidGlassRoot"
    class="effect pointer-events-none"
    :class="[props.containerClass]"
    :style="{ ...baseStyle, ...filterStyle }"
  >
    <div :class="cn('slot-container', props.class)">
      <slot />
    </div>

    <svg class="filter" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter :id="uniqueId" color-interpolation-filters="sRGB">
          <feImage
            x="0"
            y="0"
            width="100%"
            height="100%"
            :href="displacementDataUri"
            result="map"
          />
          <feDisplacementMap
            id="redchannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + rOffset"
            result="dispRed"
          />
          <feColorMatrix
            in="dispRed"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="red"
          />
          <feDisplacementMap
            id="greenchannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + gOffset"
            result="dispGreen"
          />
          <feColorMatrix
            in="dispGreen"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="green"
          />
          <feDisplacementMap
            id="bluechannel"
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale + bOffset"
            result="dispBlue"
          />
          <feColorMatrix
            in="dispBlue"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
            result="blue"
          />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur :stdDeviation="displace" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  type HTMLAttributes,
  onMounted,
  onUnmounted,
  ref,
  useId,
} from "vue";
import { cn } from "~/lib/utils";

// Generate unique ID for this component instance
const uniqueId = ref(`displacementFilter_${useId()}`);

interface Props {
  radius?: number;
  border?: number;
  lightness?: number;
  displace?: number;
  blend?: string;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  alpha?: number;
  blur?: number;
  rOffset?: number;
  gOffset?: number;
  bOffset?: number;
  scale?: number;
  frost?: number;
  squircle?: boolean;
  class?: HTMLAttributes["class"];
  containerClass?: HTMLAttributes["class"];
}

// Props definition
const props = withDefaults(defineProps<Props>(), {
  radius: 16,
  border: 0.07,
  lightness: 50,
  blend: "difference",
  xChannel: "R",
  yChannel: "B",
  alpha: 0.93,
  blur: 11,
  rOffset: 0,
  gOffset: 10,
  bOffset: 20,
  scale: -180,
  frost: 0.05,
  squircle: false,
});

// Refs
const liquidGlassRoot = ref<HTMLElement | null>(null);
const dimensions = reactive({
  width: 0,
  height: 0,
});

let observer: ResizeObserver | null = null;

// Computed squircle clip-path
const squircleClipPath = computed(() => {
  if (!props.squircle || dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  const width = dimensions.width;
  const height = dimensions.height;

  // Calculate radius as a percentage of the smaller dimension
  const radius = Math.min(width, height) * 0.15; // 15% of smallest dimension

  // Generate a proper squircle path using mathematical formula
  // A squircle is a shape between a square and a circle
  const generateSquirclePath = (w: number, h: number, r: number) => {
    // Clamp radius to not exceed half of the smaller dimension
    const maxRadius = Math.min(w, h) / 2;
    const clampedRadius = Math.min(r, maxRadius);

    // Create the squircle path using cubic bezier curves
    const c = clampedRadius * 0.5522847498; // Magic number for perfect circles

    return `M ${clampedRadius} 0 
            L ${w - clampedRadius} 0 
            C ${w - c} 0 ${w} ${c} ${w} ${clampedRadius} 
            L ${w} ${h - clampedRadius} 
            C ${w} ${h - c} ${w - c} ${h} ${w - clampedRadius} ${h} 
            L ${clampedRadius} ${h} 
            C ${c} ${h} 0 ${h - c} 0 ${h - clampedRadius} 
            L 0 ${clampedRadius} 
            C 0 ${c} ${c} 0 ${clampedRadius} 0 
            Z`;
  };

  return `path("${generateSquirclePath(width, height, radius)}")`;
});

const baseStyle = computed(() => {
  const style: any = {
    "--frost": props.frost,
  };

  if (props.squircle) {
    // Use a large border-radius to create squircle effect
    // This is more reliable than clip-path for squircle shapes
    const width = dimensions.width;
    const height = dimensions.height;
    const aspectRatio = width / height;

    // For very wide/short components (like logo), use more aggressive rounding
    let radiusMultiplier = 0.3; // Default 30% (increased from 25%)

    if (aspectRatio > 4) {
      // Extremely wide components - use 60% for super squircle effect
      radiusMultiplier = 0.6;
    } else if (aspectRatio > 3) {
      // Very wide components (logo) - use 50% for strong squircle effect
      radiusMultiplier = 0.5;
    } else if (aspectRatio > 2) {
      // Wide components - use 40% (increased from 30%)
      radiusMultiplier = 0.4;
    }

    // Use the smaller dimension with the appropriate multiplier
    const minDimension = Math.min(width, height);
    const squircleRadius =
      minDimension > 0 ? Math.min(minDimension * radiusMultiplier, 80) : 80;
    style["border-radius"] = `${squircleRadius}px`;
  } else {
    style["border-radius"] = `${props.radius}px`;
  }

  return style;
});

const filterStyle = computed(() => {
  return {
    "backdrop-filter": `url(#${uniqueId.value})`,
  };
});

// Computed displacement image
const displacementImage = computed(() => {
  const border =
    Math.min(dimensions.width, dimensions.height) * (props.border * 0.5);
  const yBorder =
    Math.min(dimensions.width, dimensions.height) * (props.border * 0.5);

  // Calculate squircle radius for SVG (same logic as baseStyle)
  let squircleRadius = props.radius;

  if (props.squircle) {
    const width = dimensions.width;
    const height = dimensions.height;
    const aspectRatio = width / height;

    let radiusMultiplier = 0.3; // Default 30% (increased from 25%)

    if (aspectRatio > 4) {
      radiusMultiplier = 0.6; // Extremely wide components
    } else if (aspectRatio > 3) {
      radiusMultiplier = 0.5; // Very wide components
    } else if (aspectRatio > 2) {
      radiusMultiplier = 0.4; // Wide components
    }

    const minDimension = Math.min(width, height);
    squircleRadius =
      minDimension > 0 ? Math.min(minDimension * radiusMultiplier, 80) : 80;
  }

  return `
    <svg viewBox="0 0 ${dimensions.width} ${
    dimensions.height
  }" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${dimensions.width}" height="${
    dimensions.height
  }" fill="black"></rect>
      <rect x="0" y="0" width="${dimensions.width}" height="${
    dimensions.height
  }" rx="${squircleRadius}" fill="url(#red)" />
      <rect x="0" y="0" width="${dimensions.width}" height="${
    dimensions.height
  }" rx="${squircleRadius}" fill="url(#blue)" style="mix-blend-mode: ${
    props.blend
  }" />
      <rect 
        x="${border}" 
        y="${yBorder}" 
        width="${dimensions.width - border * 2}" 
        height="${dimensions.height - border * 2}" 
        rx="${squircleRadius}" 
        fill="hsl(0 0% ${props.lightness}% / ${props.alpha})" 
        style="filter:blur(${props.blur}px)" 
      />
    </svg>
  `;
});

// Data URI for SVG filter
const displacementDataUri = computed(() => {
  const encoded = encodeURIComponent(displacementImage.value);
  return `data:image/svg+xml,${encoded}`;
});

// Lifecycle hooks
onMounted(() => {
  if (!liquidGlassRoot.value) return;

  observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;

    let width = 0;
    let height = 0;

    if (entry.borderBoxSize && entry.borderBoxSize?.length) {
      width = entry.borderBoxSize[0]!.inlineSize;
      height = entry.borderBoxSize[0]!.blockSize;
    } else if (entry.contentRect) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    }

    dimensions.width = width;
    dimensions.height = height;
  });

  observer.observe(liquidGlassRoot.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.effect {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 1;
  will-change: width, height;

  background: light-dark(
    hsl(0 0% 100% / var(--frost, 0)),
    hsl(0 0% 0% / var(--frost, 0))
  );
  /* box-shadow: 0 0 2px 1px
      light-dark(
        color-mix(in oklch, #ffffff, #0000 85%),
        color-mix(in oklch, #ffffff, #0000 90%)
      )
      inset,
    0 0 10px 4px
      light-dark(
        color-mix(in oklch, #ffffff, #0000 90%),
        color-mix(in oklch, #ffffff, #0000 95%)
      )
      inset,
    0px 4px 16px rgba(255, 255, 255, 0.1), 0px 8px 24px rgba(255, 255, 255, 0.1),
    0px 16px 56px rgba(255, 255, 255, 0.1),
    0px 4px 16px rgba(255, 255, 255, 0.1) inset,
    0px 8px 24px rgba(255, 255, 255, 0.1) inset,
    0px 16px 56px rgba(255, 255, 255, 0.1) inset; */

  box-shadow: inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 0 20px 0 rgba(0, 0, 0, 0.06);
}

.slot-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  position: relative;
  pointer-events: none;
  will-change: width, height;
}

.filter {
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  will-change: width, height;
}
</style>
