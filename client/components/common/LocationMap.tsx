import React from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface LocationMapProps {
    center?: [number, number];
    zoom?: number;
    onMapClick?: (lat: number, lng: number) => void;
    weatherLocation?: { lat: number; lng: number };
}

const MapFocus = ({ center, zoom, weatherLocation }: {
    center?: [number, number];
    zoom?: number;
    weatherLocation?: { lat: number; lng: number };
}) => {
    const map = useMap();
    const initialRenderRef = React.useRef(true);
    const locationChangedRef = React.useRef(false);
    const previousCenterRef = React.useRef<string | null>(null);
    const previousWeatherLocationRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (!center && !weatherLocation) {
            return;
        }

        const currentCenterString = center ? JSON.stringify(center) : null;
        const currentWeatherLocationString = weatherLocation ?
            JSON.stringify([weatherLocation.lat, weatherLocation.lng]) : null;

        const isInitialRender = initialRenderRef.current;
        const isCenterChange = currentCenterString !== previousCenterRef.current && currentCenterString !== null;
        const isWeatherLocationChange = currentWeatherLocationString !== previousWeatherLocationRef.current &&
            currentWeatherLocationString !== null;

        if (isInitialRender || (isCenterChange || isWeatherLocationChange)) {
            locationChangedRef.current = true;

            setTimeout(() => {
                if (!map.getContainer()) return;

                if (center && zoom) {
                    map.setView(center, zoom, { animate: false });
                } else if (weatherLocation) {
                    map.setView([weatherLocation.lat, weatherLocation.lng], 10, { animate: false });
                }
            }, 0);

            setTimeout(() => {
                locationChangedRef.current = false;
            }, 100);

            initialRenderRef.current = false;
            previousCenterRef.current = currentCenterString;
            previousWeatherLocationRef.current = currentWeatherLocationString;
        }
    }, [map, center, zoom, weatherLocation]);

    return null;
};

const MapClickHandler = ({ onMapClick }: {
    onMapClick?: (lat: number, lng: number) => void;
}) => {
    const map = useMap();
    const currentViewRef = React.useRef<{ center: L.LatLng, zoom: number } | null>(null);

    React.useEffect(() => {
        const updateCurrentView = () => {
            currentViewRef.current = {
                center: map.getCenter(),
                zoom: map.getZoom()
            };
        };

        updateCurrentView();

        map.on('moveend', updateCurrentView);
        map.on('zoomend', updateCurrentView);

        return () => {
            map.off('moveend', updateCurrentView);
            map.off('zoomend', updateCurrentView);
        };
    }, [map]);

    useMapEvents({
        click: (e) => {
            if (!onMapClick) return;

            const previousView = currentViewRef.current;

            const originalSetView = map.setView;
            const originalFitBounds = map.fitBounds;

            map.setView = function () { return this; };
            map.fitBounds = function () { return this; };

            onMapClick(e.latlng.lat, e.latlng.lng);

            map.setView = originalSetView;
            map.fitBounds = originalFitBounds;

            if (previousView) {
                setTimeout(() => {
                    if (map.getContainer()) {
                        map.setView(previousView.center, previousView.zoom, { animate: false });
                    }
                }, 100);
            }
        },
    });
    return null;
};

const getWeatherIcon = () =>
    L.divIcon({
        html: `<div style="color: currentColor;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin pin-icon">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
    </div>`,
        className: "lucide-map-pin-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });

const WeatherLocationMarker = ({ weatherLocation }: { weatherLocation?: { lat: number; lng: number } }) => {
    const map = useMap();
    const markerRef = React.useRef<L.Marker | null>(null);
    const previousLocationRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        const currentLocationString = weatherLocation
            ? JSON.stringify([weatherLocation.lat, weatherLocation.lng])
            : null;

        if (currentLocationString === previousLocationRef.current) {
            return;
        }

        if (markerRef.current) {
            map.removeLayer(markerRef.current);
            markerRef.current = null;
        }

        if (weatherLocation) {
            markerRef.current = L.marker([weatherLocation.lat, weatherLocation.lng], {
                icon: getWeatherIcon(),
                zIndexOffset: 1000
            }).addTo(map);

            markerRef.current.bindPopup(`
                <strong>Weather Forecast Location</strong><br />
                Latitude: ${weatherLocation.lat.toFixed(4)}<br />
                Longitude: ${weatherLocation.lng.toFixed(4)}
            `);


            setTimeout(() => {
                if (map.getContainer()) {
                    map.setView([weatherLocation.lat, weatherLocation.lng], 10, { animate: false });
                }
            }, 0);
        }

        previousLocationRef.current = currentLocationString;
    }, [map, weatherLocation]);

    React.useEffect(() => {
        return () => {
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
                markerRef.current = null;
            }
        };
    }, [map]);

    return null;
};

const LocationMap = ({ center, zoom, onMapClick, weatherLocation }: LocationMapProps) => {
    const defaultCenter: [number, number] = [20, 0];
    const defaultZoom = 2;

    const hasUserInteracted = React.useRef(false);

    const handleMapInteraction = React.useCallback(() => {
        hasUserInteracted.current = true;
    }, []);

    return (
        <MapContainer
            center={center ?? defaultCenter}
            zoom={zoom ?? defaultZoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            doubleClickZoom={true}
            dragging={true}
        >
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Component to detect user interactions with map */}
            {React.createElement(() => {
                const map = useMap();

                React.useEffect(() => {
                    const handleInteraction = () => {
                        hasUserInteracted.current = true;
                    };

                    map.on('dragstart', handleInteraction);
                    map.on('zoomstart', handleInteraction);

                    return () => {
                        map.off('dragstart', handleInteraction);
                        map.off('zoomstart', handleInteraction);
                    };
                }, [map]);

                return null;
            })}

            <MapFocus
                center={hasUserInteracted.current ? undefined : center}
                zoom={hasUserInteracted.current ? undefined : zoom}
                weatherLocation={undefined}
            />
            <MapClickHandler onMapClick={onMapClick} />
            <WeatherLocationMarker weatherLocation={weatherLocation} />
        </MapContainer>
    );
};

export default LocationMap;
