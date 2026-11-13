import type { ForwardedRef } from "react";
import type { ColumnVisibility, DataTableProps, DataTableRef } from "./types";
import { SettingOutlined } from "@ant-design/icons";
import { Button, Checkbox, ConfigProvider, Popover, Space, Table } from "antd";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTableColumnResize } from "./column-resize";
import { buildColumns, getVisibility, normalizeColumns } from "./columns";
import { useTableScrollHeight } from "./use-table-scroll-height";
import "./style.scss";

export type {
  ColumnVisibility,
  DataTableCellContext,
  DataTableCellSlots,
  DataTableColumn,
  DataTableMessages,
  DataTablePagination,
  DataTableProps,
  DataTableRef,
} from "./types";

const EMPTY_VISIBILITY = {};

function DataTableInner<Row extends object>(
  {
    columns: rawColumns,
    cellSlots,
    className,
    style,
    toolbar,
    autoHeight = false,
    resizable = false,
    columnSettings = true,
    messages: customMessages,
    columnVisibility,
    defaultColumnVisibility = EMPTY_VISIBILITY,
    onColumnVisibilityChange,
    emptyCellText = "—",
    renderBatchActions,
    rowSelection,
    pagination = false,
    scroll,
    ...tableProps
  }: Omit<DataTableProps<Row>, "ref">,
  ref: ForwardedRef<DataTableRef>,
) {
  const { locale } = useContext(ConfigProvider.ConfigContext);
  const messages = {
    ...(locale?.locale?.startsWith("en")
      ? {
          columnSettings: "Columns",
          columnsTitle: "Visible columns",
          columnsAriaLabel: "Configure visible columns",
          resetColumnWidths: "Reset column widths",
        }
      : {
          columnSettings: "列设置",
          columnsTitle: "显示列",
          columnsAriaLabel: "设置显示列",
          resetColumnWidths: "重置列宽",
        }),
    ...customMessages,
  };
  const { regionRef, scrollHeight } = useTableScrollHeight(autoHeight);
  const columns = normalizeColumns(rawColumns);
  const [initialVisibility] = useState(() => ({ ...defaultColumnVisibility }));
  const [internalVisibility, setInternalVisibility] =
    useState<ColumnVisibility>(initialVisibility);
  const visibility = getVisibility(
    columns,
    columnVisibility ?? internalVisibility,
  );
  const columnKeys = JSON.stringify(columns.map((column) => column.key));

  useEffect(() => {
    const keys: string[] = JSON.parse(columnKeys);
    setInternalVisibility((previous) => {
      const next = Object.fromEntries(
        keys.map((key) => [
          key,
          previous[key] ?? initialVisibility[key] ?? true,
        ]),
      );
      return Object.keys(previous).length === keys.length &&
        keys.every((key) => previous[key] === next[key])
        ? previous
        : next;
    });
  }, [columnKeys, initialVisibility]);

  function updateVisibility(key: string, visible: boolean) {
    const next = { ...visibility, [key]: visible };
    if (columnVisibility === undefined) setInternalVisibility(next);
    onColumnVisibilityChange?.(next);
  }

  if (renderBatchActions && rowSelection?.selectedRowKeys === undefined) {
    throw new Error(
      "DataTable 的批量操作区需要受控的 rowSelection.selectedRowKeys",
    );
  }
  const selectedRowKeys = rowSelection?.selectedRowKeys ?? [];
  const nativeProps = {
    ...tableProps,
    columns: buildColumns(columns, visibility, emptyCellText, cellSlots),
    rowSelection,
    pagination,
    scroll: autoHeight ? { ...scroll, y: scrollHeight } : scroll,
  };
  const { tableProps: resizeTableProps, resetColumnWidths } =
    useTableColumnResize<Row>({
      ...nativeProps,
      ...(typeof resizable === "object" ? resizable : {}),
      enabled: Boolean(resizable),
    });
  useImperativeHandle(ref, () => ({ resetColumnWidths }), [resetColumnWidths]);

  return (
    <div
      className={[
        "ai-code-table",
        autoHeight && "ai-code-table--auto-height",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {(toolbar || columnSettings || (rowSelection && renderBatchActions)) && (
        <div className="ai-code-table__toolbar">
          <Space wrap>
            {toolbar}
            {rowSelection &&
              renderBatchActions?.({ selectedRowKeys: [...selectedRowKeys] })}
          </Space>
          {columnSettings && (
            <Popover
              trigger="click"
              placement="bottomRight"
              title={messages.columnsTitle}
              content={
                <>
                  <div className="ai-code-table__settings">
                    {columns.map((column) => (
                      <Checkbox
                        key={column.key}
                        checked={visibility[column.key]}
                        disabled={column.hideable === false}
                        onChange={(event) =>
                          updateVisibility(column.key, event.target.checked)
                        }
                      >
                        {column.settingLabel ??
                          (typeof column.title === "function"
                            ? column.key
                            : column.title) ??
                          column.key}
                      </Checkbox>
                    ))}
                  </div>
                  {resizable && (
                    <Button
                      block
                      className="ai-code-table__reset-widths"
                      onClick={resetColumnWidths}
                    >
                      {messages.resetColumnWidths}
                    </Button>
                  )}
                </>
              }
            >
              <Button
                icon={<SettingOutlined />}
                aria-label={messages.columnsAriaLabel}
              >
                {messages.columnSettings}
              </Button>
            </Popover>
          )}
        </div>
      )}
      <div className="ai-code-table__region" ref={regionRef}>
        <Table<Row> {...nativeProps} {...resizeTableProps} />
      </div>
    </div>
  );
}

export const DataTable = forwardRef(DataTableInner) as <Row extends object>(
  props: DataTableProps<Row>,
) => React.ReactElement;
export default DataTable;
