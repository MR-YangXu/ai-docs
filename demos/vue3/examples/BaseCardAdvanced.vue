<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/BaseCard/index.vue";
const count = ref(0);
</script>
<template>
  <div class="demo-surface">
    <BaseCard
      ><template #title
        ><div class="demo-actions">
          <span>今日处理</span><button @click="count++">增加一项</button>
        </div></template
      >
      <div class="demo-metrics">
        <div>
          <strong>{{ count }}</strong
          ><span>已处理</span>
        </div>
        <div><strong>32</strong><span>待处理</span></div>
      </div></BaseCard
    >
  </div>
</template>
