import type { HTMLAttributes, ReactNode } from "react";

type StatusTone = "success" | "warning" | "danger" | "info";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: StatusTone;
  children: ReactNode;
}

export function StatusBadge({ tone, children, className = "", ...props }: StatusBadgeProps) {
  return (
    <span className={`status status-${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
