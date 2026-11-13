// 仅用于演示。业务项目应替换为自己的请求层，并返回约定的数据结构。
export const rows = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name: `项目 ${String(i + 1).padStart(2, "0")}`,
  status: i % 2,
  count: i * 3,
  owner: { name: i % 2 ? "林夏" : "周宁" },
}));
export function wait(ms = 300, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("请求已取消", "AbortError"));
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("请求已取消", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
export async function fetchRows(
  query,
  signal,
  { fail = false, delay = 300 } = {}
) {
  await wait(delay, signal);
  if (fail) throw new Error("模拟请求失败，请关闭失败开关后重试");
  const matches = rows.filter(
    (row) => !query.keyword || row.name.includes(query.keyword)
  );
  const page = query.page || 1,
    size = query.page_size || 5;
  return {
    list: matches.slice((page - 1) * size, page * size),
    total: matches.length,
  };
}
