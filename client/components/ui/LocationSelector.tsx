import { MapPin, Search, Locate, Target } from "lucide-react";
import { LocationMap, LoadingSkeleton } from "@/components/common";

interface Coordinates {
    lat: number;
    lng: number;
}

interface LocationState {
    coordinates: Coordinates | null;
    source: 'search' | 'current' | 'map' | null;
}

interface LocationSelectorProps {
    location: LocationState;
    searchTerm: string;
    searchResults: Array<{ name: string; latitude: number; longitude: number }>;
    isSearching: boolean;
    isMapClickEnabled: boolean;
    loading: boolean;
    onLocationUpdate: (update: Partial<LocationState>) => void;
    onClearLocation: () => void;
    onSearchTermChange: (term: string) => void;
    onSearchResultsClear: () => void;
    onMapClickToggle: () => void;
    onMapClick: (lat: number, lng: number) => void;
    setIsSearching: (isSearching: boolean) => void;
}

export const LocationSelector = ({
    location,
    searchTerm,
    searchResults,
    isSearching,
    isMapClickEnabled,
    loading,
    onLocationUpdate,
    onClearLocation,
    onSearchTermChange,
    onSearchResultsClear,
    onMapClickToggle,
    onMapClick,
    setIsSearching
}: LocationSelectorProps) => {
    const currentCoordinates = location.coordinates || null;

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsSearching(true);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    onLocationUpdate({
                        coordinates: { lat: latitude, lng: longitude },
                        source: 'current'
                    });
                    onSearchResultsClear();
                    setIsSearching(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please check your browser permissions.');
                    setIsSearching(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleSearchSelect = (result: { name: string; latitude: number; longitude: number }) => {
        onLocationUpdate({
            coordinates: { lat: result.latitude, lng: result.longitude },
            source: 'search'
        });
        onSearchTermChange(result.name);
        onSearchResultsClear();
    };

    return (
        <div className="cc-dashboard-map">
            <div className="mb-3 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Location</h3>
                    {currentCoordinates ? (
                        <button
                            onClick={onClearLocation}
                            className="dashboard-refresh-button"
                            title="Clear the current weather location"
                        >
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            Clear Location
                        </button>
                    ) : (
                        <button
                            onClick={onMapClickToggle}
                            className={`dashboard-refresh-button ${isMapClickEnabled ? 'bg-primary/20 border-primary' : ''}`}
                            title={isMapClickEnabled ? "Cancel map selection" : "Click to choose a location on the map"}
                        >
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {isMapClickEnabled ? 'Cancel Selection' : 'Choose on Map'}
                        </button>
                    )}
                </div>

                <div className="location-selector-controls flex items-center space-x-2">
                    <div className={`search-input-wrapper flex-1 relative ${searchResults.length > 0 ? 'results-visible' : ''}`}>
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for a city..."
                            className="location-search-input"
                            value={searchTerm || ""}
                            onChange={(e) => {
                                onSearchTermChange(e.target.value);
                                if (e.target.value.length >= 2 && (location.source === 'current' || location.source === 'map')) {
                                    onLocationUpdate({ coordinates: null, source: null });
                                }
                            }}
                        />
                        {isSearching && <div className="search-loader"></div>}

                        {searchResults.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {searchResults.map((result, index) => (
                                    <li
                                        key={index}
                                        className="autocomplete-item"
                                        onClick={() => handleSearchSelect(result)}
                                    >
                                        <MapPin className="autocomplete-item-icon" />
                                        <span>{result.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={handleCurrentLocation}
                        className="location-action-button current-location-button"
                    >
                        <Locate className={`location-action-icon ${isSearching ? 'animate-pulse' : ''}`} />
                        Use my location
                    </button>
                </div>
            </div>

            <div className="relative">
                {loading ? (
                    <LoadingSkeleton className="h-80 w-full" />
                ) : (
                    <>
                        <div className={`h-80 w-full rounded-lg overflow-hidden ${isMapClickEnabled ? 'cursor-crosshair' : ''}`}>
                            <LocationMap
                                onMapClick={onMapClick}
                                center={undefined}
                                zoom={undefined}
                                weatherLocation={currentCoordinates}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">
                                {isMapClickEnabled
                                    ? <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3" /> Click anywhere on the map to set a location
                                    </span>
                                    : currentCoordinates
                                        ? 'Location selected'
                                        : 'Click "Choose on Map" button to select a location'}
                            </div>
                            {currentCoordinates && (
                                <div className="flex items-center text-xs text-primary">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>
                                        Location at: {currentCoordinates.lat.toFixed(4)}°, {currentCoordinates.lng.toFixed(4)}°
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};