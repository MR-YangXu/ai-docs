export const zhSearchFormMessages = {
  search: "查询",
  reset: "重置",
  expand: "展开筛选",
  collapse: "收起筛选",
  submitError: "提交失败，请重试",
  field: "此项",
  required: (label: string) => `请填写${label}`,
  incompleteDateRange: "请选择完整日期范围",
  requiredRange: "请填写完整区间",
  incompleteRange: "请填写完整区间",
  invalidNumber: "请输入有效数字",
  invalidRange: "最小值不能大于最大值",
  range: "区间",
  minimum: "最小值",
  maximum: "最大值",
  separator: "至",
};

export type SearchFormMessages = typeof zhSearchFormMessages;

export const enSearchFormMessages: SearchFormMessages = {
  search: "Search",
  reset: "Reset",
  expand: "Show more filters",
  collapse: "Show fewer filters",
  submitError: "Submission failed. Please try again.",
  field: "this field",
  required: (label) => `Please enter ${label}`,
  incompleteDateRange: "Please select a complete date range",
  requiredRange: "Please enter both range limits",
  incompleteRange: "Please enter both range limits",
  invalidNumber: "Please enter valid numbers",
  invalidRange: "The minimum cannot exceed the maximum",
  range: "Range",
  minimum: "minimum",
  maximum: "maximum",
  separator: "to",
};
