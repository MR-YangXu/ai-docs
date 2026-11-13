import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  createListController,
  type Query,
  type PageResult,
  type ListOptions,
} from "../utils/adminCore";
export function usePageList<
  Q extends Query,
  Row,
  Result extends PageResult<Row> = PageResult<Row>,
>(initialQuery: Q, options: ListOptions<Q, Row, Result>) {
  const reference = useRef<ReturnType<
    typeof createListController<Q, Row, Result>
  > | null>(null);
  if (!reference.current)
    reference.current = createListController(initialQuery, options);
  const controller = reference.current;
  controller.setOptions(options);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    controller.activate();
    return controller.dispose;
  }, [controller]);
  return { ...controller, ...state, pageParams: controller.pageParams() };
}
