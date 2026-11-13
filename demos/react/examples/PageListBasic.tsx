import { useEffect, useRef, useState } from "react";
import { usePageList } from "@/hooks/usePageList";
import { fetchRows, type Row } from "../../shared/mock";
const initial = { page: 1, page_size: 5, keyword: "" };
export default function Example() {
  const [draft, setDraft] = useState(""),
    [fail, setFail] = useState(false);
  const scenario = useRef({ delay: 300 });
  const {
    tableData,
    loading,
    error,
    pageParams,
    getData,
    onSubmit,
    reset,
    handlePageChange,
  } = usePageList<typeof initial, Row>(initial, {
    initialQuery: initial,
    fetchList: (query, signal) =>
      fetchRows(query, signal, { fail, delay: scenario.current.delay }),
  });
  useEffect(() => {
    void getData();
  }, [getData]);
  return (
    <>
      <div className="demo-actions">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="查询名称"
          placeholder="例如：项目 01"
        />
        <button onClick={() => onSubmit({ keyword: draft })}>查询</button>
        <button
          onClick={() => {
            setDraft("");
            void reset();
          }}
        >
          重置
        </button>
      </div>
      {loading && <p role="status">加载中…</p>}
      {!!error && (
        <p role="alert">
          {String(error)} <button onClick={() => getData()}>重试</button>
        </p>
      )}
      <ul className="demo-list">
        {tableData.map((row) => (
          <li key={row.id}>{row.name}</li>
        ))}
      </ul>
      <div className="demo-actions">
        <button
          disabled={loading || pageParams.currentPage <= 1}
          onClick={() =>
            handlePageChange({ pageNum: pageParams.currentPage - 1 })
          }
        >
          上一页
        </button>
        <span>
          第 {pageParams.currentPage} 页 / 共 {pageParams.total} 条
        </span>
        <button
          disabled={
            loading ||
            pageParams.currentPage * pageParams.pageSize >= pageParams.total
          }
          onClick={() =>
            handlePageChange({ pageNum: pageParams.currentPage + 1 })
          }
        >
          下一页
        </button>
      </div>
    </>
  );
}
