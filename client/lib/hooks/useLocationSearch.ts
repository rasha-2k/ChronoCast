import { useState, useEffect, useCallback } from 'react';

interface LocationResult {
    name: string;
    latitude: number;
    longitude: number;
}

export function useLocationSearch() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const searchLocations = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }

            const data = await response.json();

            if (data.results) {
                const results = data.results.map((item: any) => ({
                    name: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}${item.country ? `, ${item.country}` : ''}`,
                    latitude: item.latitude,
                    longitude: item.longitude
                }));

                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching for locations:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchLocations(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, searchLocations]);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
        setSearchResults([]);
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults,
        isSearching,
        setIsSearching,
        searchLocations,
        clearSearch
    };
}