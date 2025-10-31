import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-5 w-full animate-pulse rounded-md bg-muted", className)}
    />
  );
}
