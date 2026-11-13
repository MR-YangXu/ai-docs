import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
/** 选项请求独立于字段配置；失败通过 error 暴露，reload 可重试。 */
export function useSelectOptions<Row, Value extends string | number | boolean>(fetcher: (signal: AbortSignal) => Promise<Row[]>, map: (row: Row) => { label: string; value: Value }) {
  const latest = useRef({ fetcher, map });
  useLayoutEffect(() => { latest.current = { fetcher, map }; });
  const request = useRef<AbortController | undefined>(undefined);
  const [state, setState] = useState<{ options: { label: string; value: Value }[]; loading: boolean; error: Error | null }>({ options: [], loading: true, error: null });
  const reload = useCallback(async () => {
    request.current?.abort();
    const current = new AbortController(); request.current = current;
    setState(previous => ({ ...previous, loading: true, error: null }));
    try {
      const rows = await latest.current.fetcher(current.signal);
      if (!Array.isArray(rows)) throw new Error('选项接口必须返回数组');
      if (!current.signal.aborted) setState({ options: rows.map(latest.current.map), loading: false, error: null });
    } catch (error) {
      if (!current.signal.aborted) setState(previous => ({ ...previous, loading: false, error: error instanceof Error ? error : new Error(String(error)) }));
    }
  }, []);
  useEffect(() => { void reload(); return () => request.current?.abort(); }, [reload]);
  return { ...state, reload };
}
