export interface Row {
  id: number;
  name: string;
  status: number;
  count: number;
  owner: { name: string };
}
export const rows: Row[];
export function wait(ms?: number, signal?: AbortSignal): Promise<void>;
export function fetchRows(
  query: { page?: number; page_size?: number; keyword?: string },
  signal?: AbortSignal,
  settings?: { fail?: boolean; delay?: number }
): Promise<{ list: Row[]; total: number }>;
