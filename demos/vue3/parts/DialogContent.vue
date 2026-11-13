<template>
  <div>
    <p>当前项目：{{ name }}</p>
    <button class="demo-button" @click="onDone">完成并关闭</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ name: string; onDone: () => void }>();
</script>
