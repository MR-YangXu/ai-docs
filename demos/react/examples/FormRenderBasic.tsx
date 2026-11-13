import { buildFormItems } from "@/utils/formRender";
const fields = buildFormItems<{ name: string }>([
  { name: "name", label: "名称", type: "text" },
]);
export default function Example() {
  return <pre className="demo-output">{JSON.stringify(fields, null, 2)}</pre>;
}
