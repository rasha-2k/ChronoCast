import { LoadingSkeleton } from "@/components/common";
import { LucideIcon } from "lucide-react";

interface SuggestedItemsProps {
    items: string[];
    eventName?: string;
    loading: boolean;
    isPlaceholder: boolean;
    getItemIcon: (item: string) => LucideIcon;
}

export const SuggestedItems = ({
    items,
    eventName,
    loading,
    isPlaceholder,
    getItemIcon
}: SuggestedItemsProps) => (
    <div className="cc-dashboard-suggested-items">
        <h3 className="mb-3 text-sm font-semibold">
            {eventName ? `Suggested items to have for ${eventName}` : "Suggested items to have"}
        </h3>
        {loading ? (
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <LoadingSkeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
                {items.map((item, index) => {
                    const Icon = getItemIcon(item);
                    return (
                        <div
                            key={index}
                            className={`suggested-item-card ${isPlaceholder ? 'placeholder' : ''}`}
                        >
                            <Icon className={`h-6 w-6 mb-2 ${isPlaceholder ? 'text-muted-foreground' : 'text-primary'}`} />
                            <p className="text-xs text-center font-medium">{item}</p>
                        </div>
                    );
                })}
            </div>
        )}
        {isPlaceholder && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Click on an event on the map to see specific suggestions
            </p>
        )}
    </div>
);