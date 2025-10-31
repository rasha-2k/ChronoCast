import { LoadingSkeleton } from "@/components/common";

interface NASAImageProps {
    loading: boolean;
    image: {
        title: string;
        url: string;
        description: string;
    };
}

export const NASAImage = ({ loading, image }: NASAImageProps) => (
    <div className="cc-dashboard-nasa">
        <h3 className="mb-3 text-sm font-semibold">NASA Image</h3>
        {loading ? (
            <LoadingSkeleton className="mb-3 h-36 w-full" />
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
