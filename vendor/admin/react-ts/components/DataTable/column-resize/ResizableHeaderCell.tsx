import type { MouseEvent as ReactMouseEvent, ThHTMLAttributes } from "react";
import { HolderOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import {
  clampWidth,
  DEFAULT_MAX_WIDTH,
  DEFAULT_MIN_WIDTH,
  getNumberWidth,
  joinClassName,
} from "./widths";

interface ResizableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  maxWidth?: number;
  minWidth?: number;
  onColumnResize?: (width: number) => void;
  onColumnResizeEnd?: (width: number) => void;
  resizable?: boolean;
  width?: number | string;
}

export function ResizableHeaderCell(props: ResizableHeaderCellProps) {
  const {
    children,
    className,
    maxWidth = DEFAULT_MAX_WIDTH,
    minWidth = DEFAULT_MIN_WIDTH,
    onColumnResize,
    onColumnResizeEnd,
    resizable,
    style,
    width,
    ...rest
  } = props;
  const numberWidth = getNumberWidth(width);
  const cleanupResize = useRef<(() => void) | null>(null);
  const headerCellStyle =
    numberWidth == null
      ? style
      : {
          ...style,
          width: numberWidth,
          minWidth,
          maxWidth,
        };

  useEffect(() => {
    return () => {
      cleanupResize.current?.();
    };
  }, []);

  function handleResizeStart() {
    document.body.classList.add("resizable-antd-table-column-resizing");
  }

  function handleResizeMouseDown(event: ReactMouseEvent<HTMLSpanElement>) {
    if (numberWidth == null) return;

    event.preventDefault();
    event.stopPropagation();
    cleanupResize.current?.();
    handleResizeStart();

    const startX = event.clientX;
    const startWidth = numberWidth;
    let latestWidth = startWidth;

    function handleMouseMove(moveEvent: MouseEvent) {
      latestWidth = clampWidth(
        startWidth + moveEvent.clientX - startX,
        minWidth,
        maxWidth,
      );
      onColumnResize?.(latestWidth);
    }

    function handleMouseUp() {
      cleanupResize.current?.();
      onColumnResizeEnd?.(latestWidth);
    }

    cleanupResize.current = () => {
      document.body.classList.remove("resizable-antd-table-column-resizing");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      cleanupResize.current = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <th
      {...rest}
      className={joinClassName(
        className,
        resizable ? "resizable-antd-table-column" : undefined,
      )}
      style={headerCellStyle}
    >
      <div className="resizable-antd-table-column__title">
        <span className="resizable-antd-table-column__title-text">
          {children}
        </span>
        {resizable && numberWidth != null && (
          <span
            aria-hidden="true"
            className="resizable-antd-table-column__grip"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={handleResizeMouseDown}
          >
            <HolderOutlined />
          </span>
        )}
      </div>
    </th>
  );
}
