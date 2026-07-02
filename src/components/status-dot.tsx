import type { HealthStatus } from "@/core/types";
import { cn } from "@/lib/utils";

const COLORS: Record<HealthStatus, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  error: "bg-danger",
  unknown: "bg-muted-foreground/40",
};

export function StatusDot({ status, className }: { status: HealthStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full ring-4 ring-current/10",
        COLORS[status],
        className,
      )}
      aria-label={status}
    />
  );
}
