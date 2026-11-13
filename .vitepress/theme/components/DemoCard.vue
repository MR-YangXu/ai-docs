<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { withBase } from "vitepress";
const props = defineProps<{
  stack: string;
  id: string;
  title: string;
  description?: string;
  height?: number;
  wide?: boolean;
}>();
const files = ref<{ name: string; code: string; html: string }[]>([]),
  active = ref(0),
  expanded = ref(false),
  codeError = ref(""),
  copied = ref(false);
const host = ref<HTMLElement>(),
  frame = ref<HTMLIFrameElement>(),
  visible = ref(false),
  ready = ref(false),
  error = ref(""),
  generation = ref(0);
const measured = ref(props.height || 240);
const url = computed(() =>
  withBase(`/demos/${props.stack}/index.html?demo=${props.id}`)
);
const modules = import.meta.glob("../../../.generated/snippets/*.json");
let timer: ReturnType<typeof setTimeout>,
  observer: IntersectionObserver,
  copyTimer: ReturnType<typeof setTimeout>;
function begin() {
  visible.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!ready.value) error.value = "示例加载超时，请重试。";
  }, 30000);
}
function receive(event: MessageEvent) {
  if (
    event.origin !== location.origin ||
    event.source !== frame.value?.contentWindow ||
    event.data?.channel !== "ai-doc-demo"
  )
    return;
  if (event.data.type === "ready") {
    ready.value = true;
    error.value = "";
    clearTimeout(timer);
  }
  if (event.data.type === "resize" && Number.isFinite(event.data.height))
    measured.value = Math.max(
      props.height || 240,
      Math.min(1600, event.data.height)
    );
  if (event.data.type === "error") {
    error.value = String(event.data.message);
    clearTimeout(timer);
  }
}
function reset() {
  generation.value++;
  error.value = "";
  ready.value = false;
  begin();
}
async function toggle() {
  expanded.value = !expanded.value;
  if (!expanded.value || files.value.length) return;
  try {
    codeError.value = "";
    const load =
      modules[`../../../.generated/snippets/${props.stack}-${props.id}.json`];
    if (!load) throw new Error("源码文件不存在");
    files.value = ((await load()) as { default: typeof files.value }).default;
  } catch (reason) {
    codeError.value = String(reason);
  }
}
function selectFile(index: number, event: KeyboardEvent) {
  active.value = index;
  (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[index]?.focus();
}
async function copy() {
  try {
    await navigator.clipboard.writeText(files.value[active.value].code);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied.value = false), 1800);
  } catch {
    codeError.value = "复制失败，请选择代码手动复制。";
  }
}
onMounted(() => {
  window.addEventListener("message", receive);
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        begin();
        observer.disconnect();
      }
    },
    { rootMargin: "200px" }
  );
  if (host.value) observer.observe(host.value);
});
onBeforeUnmount(() => {
  window.removeEventListener("message", receive);
  observer?.disconnect();
  clearTimeout(timer);
  clearTimeout(copyTimer);
});
</script>
<template>
  <section
    ref="host"
    class="demo-card"
    :class="{ 'demo-card--wide': wide }"
    :aria-label="title"
  >
    <div
      class="demo-card__preview"
      :style="{ minHeight: `${height || 240}px` }"
    >
      <div v-if="error" class="demo-card__failure" role="alert">
        {{ error }} <button @click="reset">重新加载</button>
      </div>
      <div v-else-if="!ready" class="demo-card__loading" role="status">
        正在准备示例…
      </div>
      <iframe
        v-if="visible"
        ref="frame"
        :key="generation"
        :src="url"
        :title="`${title} · ${stack}`"
        :style="{ height: `${measured}px` }"
        loading="lazy"
      />
    </div>
    <div class="demo-card__description">
      <h3 :id="`demo-${id}`">
        {{ title
        }}<a :href="`#demo-${id}`" :aria-label="`${title}的固定链接`">#</a>
      </h3>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
    <div class="demo-card__toolbar">
      <span>可交互示例</span>
      <div>
        <button @click="reset" :aria-label="`重置${title}`">重置</button
        ><a
          :href="url"
          target="_blank"
          rel="noopener"
          :aria-label="`独立打开${title}`"
          >独立打开 ↗</a
        ><button
          @click="toggle"
          :aria-expanded="expanded"
          :aria-controls="`code-${stack}-${id}`"
        >
          {{ expanded ? "收起代码" : "〈/〉 查看代码" }}
        </button>
      </div>
    </div>
    <div v-if="expanded" :id="`code-${stack}-${id}`" class="demo-card__source">
      <p v-if="codeError" role="alert">{{ codeError }}</p>
      <div v-if="files.length" class="demo-card__files">
        <div role="tablist" aria-label="示例文件">
          <button
            v-for="(file, i) in files"
            :key="file.name"
            role="tab"
            :id="`file-${stack}-${id}-${i}`"
            :aria-controls="`panel-${stack}-${id}`"
            :tabindex="active === i ? 0 : -1"
            :aria-selected="active === i"
            @click="active = i"
            @keydown.right.prevent="selectFile((i + 1) % files.length, $event)"
            @keydown.left.prevent="selectFile((i + files.length - 1) % files.length, $event)"
            @keydown.home.prevent="selectFile(0, $event)"
            @keydown.end.prevent="selectFile(files.length - 1, $event)"
          >
            {{ file.name }}
          </button>
        </div>
        <button @click="copy">{{ copied ? "已复制" : "复制代码" }}</button>
      </div>
      <div
        v-if="files[active]"
        class="demo-card__code"
        role="tabpanel"
        :id="`panel-${stack}-${id}`"
        :aria-labelledby="`file-${stack}-${id}-${active}`"
        tabindex="0"
        v-html="files[active].html"
      />
    </div>
  </section>
</template>
