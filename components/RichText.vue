<template>
  <div class="rich-text" v-html="transformedContent"></div>
</template>

<script setup>
import blockContentToHtml from "@sanity/block-content-to-html";
import { decode } from "html-entities";
import { computed } from "vue";

const props = defineProps({
  content: {
    type: Array,
    required: true,
  },
});

// Custom serializer for Sanity block content
const serializers = {
  types: {
    block: (props) => {
      const { node } = props;
      const style = node.style || "normal";

      // Handle different block styles
      if (style === "h1") return `<h1>${props.children.join("")}</h1>`;
      if (style === "h2") return `<h2>${props.children.join("")}</h2>`;
      if (style === "h3") return `<h3>${props.children.join("")}</h3>`;
      if (style === "h4") return `<h4>${props.children.join("")}</h4>`;
      if (style === "blockquote")
        return `<blockquote>${props.children.join("")}</blockquote>`;

      // Default to paragraph
      let content = props.children.join("");

      // Handle line breaks
      content = content.split("[object HTMLBRElement]").join("<br/>");

      // Add <br /> if the paragraph is empty
      if (!content.trim()) {
        content = "<br />";
      }

      return `<p>${content}</p>`;
    },
    lineBreak: () => {
      // Return an actual <br/> tag for lineBreak elements
      return "<br />";
    },
  },
  marks: {
    link: ({ mark, children }) => {
      const target = mark.blank ? "_blank" : "_self";
      const rel = mark.blank ? "noopener noreferrer" : "";
      return `<a href="${
        mark.href
      }" target="${target}" rel="${rel}">${children.join("")}</a>`;
    },
    em: ({ children }) => {
      return `<em>${children.join("")}</em>`;
    },
    strong: ({ children }) => {
      return `<strong>${children.join("")}</strong>`;
    },
    code: ({ children }) => {
      return `<code>${children.join("")}</code>`;
    },
  },
};

const transformedContent = computed(() => {
  if (!props.content || !Array.isArray(props.content)) return "";

  try {
    // Process the content
    const rawHtml = blockContentToHtml({
      blocks: props.content.map((block) => {
        // Handle explicit lineBreak elements
        if (block._type === "lineBreak") {
          return {
            _type: "lineBreak",
            _key: block._key,
          };
        }
        return block;
      }),
      serializers,
    });

    // Clean up any remaining [object HTMLBRElement] instances
    const cleanedHtml = rawHtml.replace(/\[object HTMLBRElement\]/g, "<br/>");

    // Decode HTML entities before rendering
    return decode(cleanedHtml);
  } catch (error) {
    console.error("Error processing rich text content:", error);
    return "";
  }
});
</script>

<style>
.rich-text {
  line-height: 1.1;
}

.rich-text p {
  line-height: 0.8;
}

.rich-text a {
  text-decoration: underline;
  color: inherit;
}

.rich-text a:hover {
  opacity: 0.8;
}

.rich-text p {
  margin: 0.5rem 0;
}

.rich-text p:first-child {
  margin-top: 0;
}

.rich-text p:last-child {
  margin-bottom: 0;
}

.rich-text h1,
.rich-text h2,
.rich-text h3,
.rich-text h4 {
  margin: 1rem 0 0.5rem 0;
  font-weight: bold;
}

.rich-text h1:first-child,
.rich-text h2:first-child,
.rich-text h3:first-child,
.rich-text h4:first-child {
  margin-top: 0;
}

.rich-text blockquote {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 2px solid currentColor;
  opacity: 0.8;
}

.rich-text strong {
  font-weight: 400;
}

.rich-text em {
  font-style: italic;
}

.rich-text code {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
</style>
