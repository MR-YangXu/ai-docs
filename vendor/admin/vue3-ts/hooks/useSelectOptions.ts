import { ref, shallowRef, onMounted, onScopeDispose } from 'vue';
/** 返回独立选项状态，由页面组合字段配置，不修改外部配置。 */
export function useSelectOptions<Row, Value extends string | number | boolean>(fetcher: (signal: AbortSignal) => Promise<Row[]>, map: (row: Row) => { label: string; value: Value }) {
  const options = shallowRef<{ label: string; value: Value }[]>([]);
  const loading = ref(true), error = shallowRef<Error | null>(null);
  let request: AbortController | undefined;
  async function reload() {
    request?.abort(); const current = new AbortController(); request = current;
    loading.value = true; error.value = null;
    try {
      const rows = await fetcher(current.signal);
      if (!Array.isArray(rows)) throw new Error('选项接口必须返回数组');
      if (!current.signal.aborted) options.value = rows.map(map);
    } catch (reason) { if (!current.signal.aborted) error.value = reason instanceof Error ? reason : new Error(String(reason)); }
    finally { if (!current.signal.aborted) loading.value = false; }
  }
  onMounted(() => { void reload(); });
  onScopeDispose(() => request?.abort());
  return { options, loading, error, reload };
}
