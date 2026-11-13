/** 列的稳定 key。只计算，不写回 column。 */

export function resolveColumnKey(column, index = 0, parentKey = "") {
  if (!column) return `col-${index}`;
  if (column.key) return column.key;
  const semantic = columnSemantic(column);
  if (semantic) return parentKey ? `${parentKey}.${semantic}` : semantic;
  if (column.label) {
    const labelKey = `${column.label}-${index}`;
    return parentKey ? `${parentKey}.${labelKey}` : labelKey;
  }
  return parentKey ? `${parentKey}.col-${index}` : `col-${index}`;
}

function columnSemantic(column) {
  if (column.prop) return `prop_${column.prop}`;
  if (column.type) return `type_${column.type}`;
  if (typeof column.render === "string" && column.render) return `render_${column.render}`;
  if (typeof column.renderCellHeader === "string" && column.renderCellHeader) {
    return `header_${column.renderCellHeader}`;
  }
  const renderName = namedFunction(column.render, "renderFn");
  if (renderName) return renderName;
  return namedFunction(column.renderCellHeader, "headerFn");
}

function namedFunction(fn, prefix) {
  if (typeof fn === "function" && fn.name) return `${prefix}_${fn.name}`;
  return "";
}
