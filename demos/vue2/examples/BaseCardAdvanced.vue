<template>
  <div class="demo-surface">
    <base-card
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
      </div></base-card
    >
  </div>
</template>
<script>
import BaseCard from "@/components/BaseCard/index.vue";
export default {
  components: { BaseCard },
  data() {
    return { count: 0 };
  },
};
</script>
