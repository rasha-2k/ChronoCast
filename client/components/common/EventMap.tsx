import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { AppEvent } from "@/pages/Dashboard";

interface EventMapProps {
    events: AppEvent[];
    center?: [number, number];
    zoom?: number;
    onEventSelect?: (event: AppEvent) => void;
    onMapClick?: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
    high: "red",
    medium: "orange",
    low: "green",
};

const MapFocus = ({ events, center, zoom }: { events: AppEvent[]; center?: [number, number]; zoom?: number }) => {
    const map = useMap();
    if (center && zoom) {
        map.setView(center, zoom);
        return null;
    }
    if (events.length === 0) return null;
    const bounds = events.map((e) => [e.location.lat, e.location.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [50, 50] });
    return null;
};

const getDivIcon = (severity: string) =>
    L.divIcon({
        html: `<div style="
        background-color: ${SEVERITY_COLORS[severity.toLowerCase()] || "blue"};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 3px rgba(0,0,0,0.5);
    "></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

const MapClickClear = ({ onMapClick }: { onMapClick?: () => void }) => {
    useMapEvents({
        click: () => {
            onMapClick?.();
        },
    });
    return null;
};

const EventMap = ({ events, center, zoom, onEventSelect, onMapClick }: EventMapProps) => {
    const defaultCenter: [number, number] = [20, 0];
    const defaultZoom = 2;

    return (
        <MapContainer
            center={center ?? defaultCenter}
            zoom={zoom ?? defaultZoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <MapFocus events={events} center={center} zoom={zoom} />
            <MapClickClear onMapClick={onMapClick} />

            {events.map((event) => (
                <Marker
                    key={event.id}
                    position={[event.location.lat, event.location.lng]}
                    icon={getDivIcon(event.severity)}
                    eventHandlers={
                        onEventSelect
                            ? {
                                click: (e: any) => {
                                    if (e && e.originalEvent) {
                                        if (typeof e.originalEvent.stopPropagation === "function") e.originalEvent.stopPropagation();
                                        if (typeof e.originalEvent.stopImmediatePropagation === "function") e.originalEvent.stopImmediatePropagation();
                                    }
                                    onEventSelect(event);
                                },
                            }
                            : undefined
                    }
                >
                    <Popup>
                        <strong>{event.name}</strong>
                        <br />
                        {event.description}
                        <br />
                        Probability: {event.probability}%
                        <br />
                        Severity: {event.severity}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default EventMap;
