function isVNode(node) {
  return !!(
    node &&
    typeof node === "object" &&
    (node.componentOptions || typeof node.tag === "string" || node.isComment === true)
  );
}

function pageIndex(table, index) {
  const page = table && table.pageView;
  if (!page) return index + 1;
  return (page.current - 1) * page.size + index + 1;
}

function plainText(value) {
  if (value === null || value === undefined) return "--";
  return String(value);
}

function callRender(render, h, payload) {
  if (render.length >= 2) return render(h, payload);
  return render({
    value: payload.row[payload.column.prop],
    $column: payload.column,
    h,
    $$index: payload.$$index,
    row: payload.row,
    $index: payload.index,
    column: payload.column,
    index: payload.index,
  });
}

function normalizeNode(h, node) {
  if (Array.isArray(node)) return node;
  if (isVNode(node)) return node;
  if (node === null || node === undefined) return h("span", "--");
  return h("span", String(node));
}

export default {
  name: "TableCell",
  functional: true,
  props: {
    row: { type: Object, required: true },
    column: { type: Object, required: true },
    index: Number,
    table: Object,
    header: Boolean,
  },
  render(h, context) {
    const props = context.props;
    const column = props.column;
    const row = props.row || {};
    const index = props.index || 0;
    const table = props.table;
    const payload = { row, column, index, $$index: pageIndex(table, index) };
    if (props.header) {
      const header = column.renderCellHeader;
      if (typeof header === "string" && table && table.$scopedSlots[header]) {
        return table.$scopedSlots[header]({
          row,
          column,
          $column: column,
          $index: index,
          $$index: payload.$$index,
        });
      }
      if (typeof header === "function") return normalizeNode(h, callRender(header, h, payload));
      return h("span", column.label || "");
    }
    const render = column.render;
    if (typeof render === "string") {
      const slot = table && table.$scopedSlots[render];
      if (!slot) return h("span", "--");
      return slot({ row, column, $column: column, $index: index, $$index: payload.$$index });
    }
    if (column.prop && table && table.$scopedSlots[column.prop] && typeof render !== "function") {
      return table.$scopedSlots[column.prop]({ row, column, index, $index: index });
    }
    if (typeof render === "function") return normalizeNode(h, callRender(render, h, payload));
    const value = column.formatter
      ? column.formatter(row, column, row[column.prop], index)
      : row[column.prop];
    return h("span", plainText(value));
  },
};
