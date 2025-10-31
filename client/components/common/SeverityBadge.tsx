import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type SeverityLevel = "low" | "medium" | "high";

const severityVariants = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function SeverityBadge({ severity, className }: { severity: SeverityLevel; className?: string }) {
  return (
    <Badge
      id={`severity-badge-${severity}`}
      variant="outline"
      className={cn(
        severityVariants[severity],
        "font-medium",
        className
      )}
    >
      {severity.toUpperCase()}
    </Badge>
  );
}
