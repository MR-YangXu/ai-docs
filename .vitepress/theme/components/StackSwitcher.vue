<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { catalog, stacks } from "../../catalog-proxy";
const { page } = useData();
const current = computed(() => page.value.relativePath.split("/")[1]);
const slug = computed(() =>
  page.value.relativePath.split("/")[2]?.replace(/\.md$/, "")
);
function target(stack: string) {
  return withBase(
    catalog.find((e) => e.stack === stack && e.slug === slug.value)?.route ||
      `/components/${stack}/`
  );
}
</script>
<template>
  <nav class="stack-switcher" aria-label="选择技术栈">
    <a
      v-for="(stack, id) in stacks"
      :key="id"
      :href="target(id)"
      :class="{ 'is-active': current === id }"
      :aria-current="current === id ? 'page' : undefined"
      ><span class="stack-switcher__dot" :class="id" />{{ stack.name
      }}<small>{{ stack.language }}</small></a
    >
  </nav>
</template>
