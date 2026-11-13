import { createElement } from 'react';
import type { DataTableColumn } from '../components/DataTable';
export interface CopyFeedback { onCopied?: () => void; onCopyError?: (error: unknown) => void }
export interface RenderColumn<Row extends object> extends DataTableColumn<Row> {
  type?: 'default' | 'enum' | 'nested' | 'clip';
  enumList?: { label: string; value: string | number | boolean }[];
}
export function createRender<Row extends object>(column: RenderColumn<Row>, feedback: CopyFeedback = {}): NonNullable<DataTableColumn<Row>['render']> {
  if (column.render) return column.render;
  return (value, row, index) => {
    if (column.formatter) return column.formatter(value, row, index);
    const text = String(column.type === 'enum' ? column.enumList?.find(option => option.value === value)?.label ?? '—' : value ?? '—');
    if (column.type !== 'clip') return text;
    return createElement('button', { type: 'button', className: 'ai-code-copy', onClick: async () => {
      try {
        if (!navigator.clipboard) throw new Error('当前环境不支持剪贴板，请使用 HTTPS 或手动复制');
        await navigator.clipboard.writeText(String(value ?? '')); feedback.onCopied?.();
      } catch (error) { if (feedback.onCopyError) feedback.onCopyError(error); else window.alert(error instanceof Error ? error.message : '复制失败'); }
    } }, text);
  };
}
export function buildColumns<Row extends object>(columns: RenderColumn<Row>[], feedback: CopyFeedback = {}): DataTableColumn<Row>[] {
  return columns.map(({ type, enumList, ...column }) => ({ ...column,
    ...(column.render || column.formatter || !type || type === 'default' ? {} : { render: createRender({ ...column, type, enumList }, feedback) }),
  }));
}
