import React from 'react';
import { LoadingSkeleton } from '@/components/common';

interface NASAImageProps {
    image: {
        title: string;
        url: string;
        description: string;
    };
    loading: boolean;
}

export const NASAImage: React.FC<NASAImageProps> = ({ image, loading }) => {
    return (
        <div className="cc-dashboard-nasa">
            <h3 className="mb-3 text-sm font-semibold">NASA Image</h3>
            {loading ? (
                <>
                    <LoadingSkeleton className="mb-3 h-36 w-full rounded-lg bg-white/40 dark:bg-white/10" />
                    <LoadingSkeleton className="mb-2 h-4 w-2/3 bg-white/30 dark:bg-white/10" />
                    <LoadingSkeleton className="h-3 w-full bg-white/20 dark:bg-white/10" />
                    <LoadingSkeleton className="mt-1 h-3 w-5/6 bg-white/20 dark:bg-white/10" />
                </>
            ) : (
                <>
                    <img
                        src={image.url}
                        alt={image.title}
                        className="mb-3 h-36 w-full rounded-lg object-cover"
                    />
                    <h4 className="mb-1 text-sm font-medium">{image.title}</h4>
                    <p className="text-xs text-muted-foreground">{image.description}</p>
                </>
            )}
        </div>
    );
};