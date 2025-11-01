import React from 'react';
import { Search, MapPin, Locate, Target } from 'lucide-react';
import { LoadingSkeleton, LocationMap } from '@/components/common';

interface LocationSelectorProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchResults: Array<{ name: string; latitude: number; longitude: number }>;
    setSearchResults: (results: any[]) => void;
    isSearching: boolean;
    setIsSearching: (searching: boolean) => void;
    selectedCoordinates: { lat: number; lng: number } | null;
    setSelectedCoordinates: (coords: { lat: number; lng: number } | null) => void;
    locationSource: 'search' | 'current' | 'map' | null;
    setLocationSource: (source: 'search' | 'current' | 'map' | null) => void;
    isMapClickEnabled: boolean;
    setIsMapClickEnabled: (enabled: boolean) => void;
    loading: boolean;
    searchLocations: (query: string) => void;
    onClearLocation: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    selectedCoordinates,
    setSelectedCoordinates,
    locationSource,
    setLocationSource,
    isMapClickEnabled,
    setIsMapClickEnabled,
    loading,
    searchLocations,
    onClearLocation
}) => {
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsSearching(true);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setSelectedCoordinates({ lat: latitude, lng: longitude });
                    setLocationSource('current');
                    setSearchResults([]);
                    setIsMapClickEnabled(false);
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

    return (
        <div className="cc-dashboard-map">
            <div className="mb-3 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Location</h3>
                    {selectedCoordinates ? (
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
                            onClick={() => setIsMapClickEnabled(!isMapClickEnabled)}
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
                                setSearchTerm(e.target.value);
                                if (e.target.value.length >= 2 && (locationSource === 'current' || locationSource === 'map')) {
                                    setSelectedCoordinates(null);
                                    setLocationSource(null);
                                }
                                if (e.target.value.length > 0 && isMapClickEnabled) {
                                    setIsMapClickEnabled(false);
                                }
                            }}
                            onFocus={() => searchTerm && searchTerm.length >= 2 && searchLocations(searchTerm)}
                        />
                        {isSearching && <div className="search-loader"></div>}

                        {searchResults.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {searchResults.map((location, index) => (
                                    <li
                                        key={index}
                                        className="autocomplete-item"
                                        onClick={() => {
                                            setSelectedCoordinates({
                                                lat: location.latitude,
                                                lng: location.longitude
                                            });
                                            setLocationSource('search');
                                            setSearchTerm(location.name);
                                            setSearchResults([]);
                                            setIsMapClickEnabled(false);
                                        }}
                                    >
                                        <MapPin className="autocomplete-item-icon" />
                                        <span>{location.name}</span>
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
                <div className={`h-80 w-full rounded-lg overflow-hidden ${isMapClickEnabled ? 'cursor-crosshair' : ''}`}>
                    <LocationMap
                        center={undefined}
                        zoom={undefined}
                        onMapClick={(lat, lng) => {
                            if (isMapClickEnabled) {
                                setSelectedCoordinates({ lat, lng });
                                setLocationSource('map');
                                setSearchTerm("");
                                setIsMapClickEnabled(false);
                            }
                        }}
                        weatherLocation={selectedCoordinates}
                        loading={loading}
                    />
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                        {isMapClickEnabled
                            ? <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Click anywhere on the map to set a location</span>
                            : selectedCoordinates
                                ? 'Location selected'
                                : 'Click "Choose on Map" button to select a location'}
                    </div>
                    {selectedCoordinates && (
                        <div className="flex items-center text-xs text-primary">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>
                                Location at: {`${selectedCoordinates.lat.toFixed(4)}°, ${selectedCoordinates.lng.toFixed(4)}°`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};