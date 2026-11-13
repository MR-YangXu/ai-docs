<script setup lang="ts">
import { withBase } from "vitepress";
import { catalog, stacks } from "../../catalog-proxy";
defineProps<{ stack?: string }>();
</script>
<template>
  <div class="component-overview">
    <template v-for="(info, id) in stacks" :key="id"
      ><section v-if="!stack || stack === id">
        <div class="component-overview__heading">
          <span>{{ info.ui }}</span>
          <h2>
            {{ info.name }}<small>{{ info.language }}</small>
          </h2>
          <p>从可运行的示例开始，找到项目需要的能力。</p>
        </div>
        <div class="component-overview__grid">
          <a
            v-for="entry in catalog.filter((e) => e.stack === id)"
            :key="entry.slug"
            :href="withBase(entry.route)"
            ><span class="component-overview__category">{{ entry.group }}</span
            ><strong>{{ entry.name }}</strong
            ><span>{{ entry.label }}</span>
            <p>{{ entry.description }}</p>
            <span class="component-overview__arrow" aria-hidden="true"
              >↗</span
            ></a
          >
        </div>
      </section></template
    >
  </div>
</template>
