import React from 'react';
import { LoadingSkeleton } from '@/components/common';
import { getItemIcon } from '@/components/icons';

interface SuggestedItemsProps {
    items: string[];
    loading: boolean;
    isPlaceholder: boolean;
}

export const SuggestedItems: React.FC<SuggestedItemsProps> = ({ items, loading, isPlaceholder }) => {
    return (
        <div className="cc-dashboard-suggested-items">
            <h3 className="mb-3 text-sm font-semibold">Suggested items to have</h3>
            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`suggested-item-card placeholder h-16 w-full flex flex-col items-center justify-center`}
                        >
                            <LoadingSkeleton className="h-6 w-6 mb-2 rounded-full bg-white/40 dark:bg-white/10" />
                            <LoadingSkeleton className="h-3 w-20 bg-white/30 dark:bg-white/10" />
                        </div>
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
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Select a location to see weather-based suggestions
            </p>
        </div>
    );
};