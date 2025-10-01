import { cn } from "@/lib/utils";

export type SeverityLevel = "low" | "medium" | "high";

export function SeverityBadge({ severity, className }: { severity: SeverityLevel; className?: string }) {
  return (
    <span
      id={`severity-badge-${severity}`}
      className={cn(
        `severity-badge severity-badge-${severity}`,
        `badge-${severity}`,
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-inset",
        className,
      )}
    >
      {severity.toUpperCase()}
    </span>
  );
}
