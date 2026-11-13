/** 工具集内部状态逻辑。请求与业务响应转换由调用方提供。 */
export type Query = { page?: number; page_size?: number; page_sizes?: number[]; total?: number };
export interface PageResult<Row> {
  list: Row[];
  total: number;
}
export interface ListOptions<Q extends Query, Row, Result extends PageResult<Row> = PageResult<Row>> {
  initialQuery: Q;
  fetchList: (query: Q, signal: AbortSignal) => Promise<Result>;
  keepPrevious?: boolean;
  persistKey?: string;
  isRefreshData?: boolean;
  onError?: (error: unknown) => void;
}
export interface ListState<Q, Row, Result = PageResult<Row>> {
  result: Result | undefined;
  query: Q;
  tableData: Row[];
  total: number;
  loading: boolean;
  error: unknown;
}

/** 克隆查询和配置的可变部分，保留回调；日期不转成字符串。 */
export function clone<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) return value.map(clone) as T;
  if (value && Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])) as T;
  return value;
}
export function createListController<Q extends Query, Row, Result extends PageResult<Row> = PageResult<Row>>(initialQuery: Q, initialOptions: ListOptions<Q, Row, Result>) {
  let options = initialOptions;
  const initial = clone(options.initialQuery);
  let state: ListState<Q, Row, Result> = { result: undefined, query: clone(initialQuery), tableData: [], total: 0, loading: false, error: null };
  let sequence = 0;
  let request: AbortController | undefined;
  let active = true;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<typeof state>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const updateQuery = (patch: Partial<Q>) => publish({ query: { ...state.query, ...clone(patch) } });
  const pageParams = () => ({
    currentPage: Number(state.query.page) || 1,
    pageSize: Number(state.query.page_size) || 10,
    pageSizes: state.query.page_sizes ?? [10, 20, 50, 100],
    total: state.total,
  });
  const getData = async (): Promise<Result | undefined> => {
    if (!active) return;
    const ticket = ++sequence;
    request?.abort();
    const currentRequest = new AbortController();
    request = currentRequest;
    publish({ loading: true, error: null, ...(options.keepPrevious ? {} : { tableData: [], total: 0, result: undefined }) });
    const query = clone(state.query);
    // 仅移除工具集自己的展示状态；业务字段保持原样。
    delete query.total;
    delete query.page_sizes;
    try {
      let result = await options.fetchList(query, currentRequest.signal);
      if (!active || ticket !== sequence) return;
      const validate = (value: PageResult<Row>) => {
        if (!value || !Array.isArray(value.list) || !Number.isFinite(value.total) || value.total < 0)
          throw new Error('fetchList 必须返回 { list: 数组, total: 非负数 }');
      };
      validate(result);
      const lastPage = Math.max(1, Math.ceil(result.total / pageParams().pageSize));
      if (pageParams().currentPage > lastPage) {
        updateQuery({ page: lastPage } as Partial<Q>);
        result = await options.fetchList({ ...query, page: lastPage }, currentRequest.signal);
        if (!active || ticket !== sequence) return;
        validate(result);
      }
      publish({ result, tableData: result.list, total: result.total });
      if (options.persistKey && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(
            options.persistKey,
            JSON.stringify({ page: state.query.page, page_size: state.query.page_size }),
          );
        } catch {
          /* 分页记忆属于可选增强，存储失败不使已成功的查询失败。 */
        }
      }
      return result;
    } catch (error) {
      if (active && ticket === sequence) {
        publish({ error });
        options.onError?.(error);
      }
      // 查询错误通过 error/onError 暴露，模板事件不会产生未处理拒绝。
      return undefined;
    } finally {
      if (active && ticket === sequence) publish({ loading: false });
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setOptions: (next: ListOptions<Q, Row, Result>) => {
      options = next;
    },
    activate: () => {
      active = true;
    },
    dispose: () => {
      active = false;
      sequence++;
      request?.abort();
    },
    pageParams,
    getData,
    onSubmit: (form: Partial<Q>) => {
      updateQuery({ ...form, page: 1 } as Partial<Q>);
      return getData();
    },
    handlePageChange: ({ pageNum }: { pageNum: number }) => {
      updateQuery({ page: pageNum } as Partial<Q>);
      return getData();
    },
    handleSizeChange: ({ pageSize }: { pageSize: number }) => {
      updateQuery({ page: 1, page_size: pageSize } as Partial<Q>);
      return getData();
    },
    reset: () => {
      sequence++;
      request?.abort();
      publish({ query: { ...clone(initial), page: 1 }, result: undefined, tableData: [], total: 0, error: null, loading: false });
      return options.isRefreshData === false ? Promise.resolve(undefined) : getData();
    },
    restorePagination: () => {
      if (!options.persistKey || typeof localStorage === 'undefined') return;
      try {
        const saved = JSON.parse(localStorage.getItem(options.persistKey) ?? 'null');
        if (
          saved &&
          Number.isInteger(saved.page) &&
          saved.page > 0 &&
          Number.isInteger(saved.page_size) &&
          saved.page_size > 0
        )
          updateQuery({ page: saved.page, page_size: saved.page_size } as Partial<Q>);
      } catch {
        /* 忽略损坏或不可用的可选分页缓存。 */
      }
    },
  };
}

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}
export interface FieldMap {
  key: string;
  value: string;
}
export function getFiltedOptions(raw: unknown[], map: FieldMap): SelectOption[] {
  return raw.map((entry) => {
    if (!entry || typeof entry !== 'object') throw new Error('选项必须为对象');
    const record = entry as Record<string, unknown>;
    const value = record[map.value];
    if (!['string', 'number', 'boolean'].includes(typeof value) || record[map.key] === undefined)
      throw new Error('选项映射字段缺失或类型不支持');
    return { label: String(record[map.key]), value: value as SelectOption['value'] };
  });
}
export function createOptionsController(write: (field: string, options: SelectOption[]) => void) {
  const tickets = new Map<string, number>();
  let active = true;
  const next = (field: string) => {
    const id = (tickets.get(field) ?? 0) + 1;
    tickets.set(field, id);
    return id;
  };
  return {
    activate: () => {
      active = true;
    },
    dispose: () => {
      active = false;
      tickets.forEach((_, key) => next(key));
    },
    setFieldOptions: (field: string, raw: unknown[], map: FieldMap) => {
      next(field);
      if (active) write(field, getFiltedOptions(raw, map));
    },
    loadFieldOptions: async (field: string, fetcher: () => Promise<unknown[]>, map: FieldMap) => {
      const id = next(field);
      try {
        const raw = await fetcher();
        if (active && tickets.get(field) === id) write(field, getFiltedOptions(raw, map));
      } catch (error) {
        if (active && tickets.get(field) === id) throw error;
      }
    },
  };
}
/** 取消不作为业务失败展示，调用方可据此忽略过期操作。 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
export function createActionController(
  refresh?: () => void | Promise<unknown>,
  notify?: (text: string) => void,
  onPending?: (keys: string[]) => void,
) {
  const pending = new Map<string, { promise: Promise<unknown>; controller: AbortController }>();
  let generation = 0;
  let active = true;
  return {
    activate: () => {
      active = true;
    },
    dispose: () => {
      active = false;
      generation++;
      pending.forEach(({ controller }) => controller.abort());
      pending.clear();
    },
    exec: <T>(
      task: (signal: AbortSignal) => Promise<T>,
      success?: string | ((result: T) => string | undefined | false),
      key = 'default',
    ): Promise<T> => {
      if (!active) return Promise.reject(new DOMException('操作所属组件已销毁', 'AbortError'));
      if (pending.has(key)) return pending.get(key)!.promise as Promise<T>;
      const ticket = generation;
      const controller = new AbortController();
      const checkActive = () => {
        if (!active || ticket !== generation || controller.signal.aborted)
          throw new DOMException('操作已取消', 'AbortError');
      };
      const promise = Promise.resolve()
        .then(() => { checkActive(); return task(controller.signal); })
        .then(async (result) => {
          checkActive();
          if (active && ticket === generation) {
            const message = typeof success === 'function' ? success(result) : success;
            if (message) notify?.(message);
            await refresh?.();
          }
          checkActive();
          return result;
        })
        .catch((error: unknown) => { checkActive(); throw error; })
        .finally(() => {
          if (active && ticket === generation) {
            pending.delete(key);
            onPending?.([...pending.keys()]);
          }
        });
      pending.set(key, { promise, controller });
      onPending?.([...pending.keys()]);
      return promise;
    },
  };
}
