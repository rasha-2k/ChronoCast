import { useState, useCallback, useMemo, useEffect } from 'react';
import { DateObject } from 'react-multi-date-picker';
import WeatherService from '@/services/weather-service';
import { ForecastType } from '@/types/weather';

interface Coordinates {
    lat: number;
    lng: number;
}

export function useWeatherData(
    selectedCoordinates: Coordinates | null,
    forecastType: ForecastType,
    temperatureUnit: 'celsius' | 'fahrenheit',
    values: (DateObject | string | Date | null)[],
    variablesGroups: Record<ForecastType, any[]>,
    validateDateRange: (values: (DateObject | string | Date | null)[]) => string | null
) {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [weeklyWeatherData, setWeeklyWeatherData] = useState<any>(null);
    const [weeklyWeatherLoading, setWeeklyWeatherLoading] = useState<boolean>(false);

    const weatherService = useMemo(() => new WeatherService(), []);
    const weatherRequestCache = useMemo(() => new Map<string, any>(), []);

    const formatDate = useCallback((date: DateObject | string | Date | null): string => {
        if (!date) return '';
        if (date instanceof DateObject) {
            return date.format('YYYY-MM-DD');
        }
        return new DateObject(date).format('YYYY-MM-DD');
    }, []);

    const formatDateISO = useCallback((date: Date): string => {
        return date.toISOString().split('T')[0];
    }, []);

    const getSelectedDateRange = useCallback(() => {
        const validDates = (values || []).filter(Boolean) as (DateObject | string | Date)[];
        const startDate = validDates.length > 0 ? formatDate(validDates[0]) : formatDate(new Date());
        const endDate = validDates.length > 1 ? formatDate(validDates[1]) : startDate;
        return { startDate, endDate };
    }, [values, formatDate]);

    const getWeeklyDateRange = useCallback(() => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 6);
        return { today, endDate };
    }, []);

    const createCacheKey = useCallback((coords: Coordinates, unit: string, extraData?: any) => {
        return JSON.stringify({
            lat: coords.lat,
            lng: coords.lng,
            forecastType,
            temperatureUnit: unit,
            values: values.map(v => v instanceof DateObject ? v.format('YYYY-MM-DD') : new DateObject(v).format('YYYY-MM-DD')),
            ...extraData
        });
    }, [forecastType, values]);

    const fetchWeatherData = useCallback(async () => {
        if (!selectedCoordinates) {
            setWeatherError('Please select a location first');
            return;
        }

        setLoading(true);
        setWeatherError(null);

        try {
            const dateError = validateDateRange(values);
            if (dateError) {
                throw new Error(dateError);
            }

            const allVars = variablesGroups[forecastType].map(v => v.id);
            const currentCacheKey = createCacheKey(selectedCoordinates, temperatureUnit);

            if (weatherRequestCache.has(currentCacheKey)) {
                setWeatherData(weatherRequestCache.get(currentCacheKey));
                setLoading(false);
                return;
            }

            const { startDate, endDate } = getSelectedDateRange();

            const createParams = (unit: 'celsius' | 'fahrenheit') => {
                const params: any = {
                    latitude: selectedCoordinates.lat,
                    longitude: selectedCoordinates.lng,
                    temperature_unit: unit,
                    start_date: startDate,
                    end_date: endDate
                };

                if (forecastType === 'daily') {
                    params.daily = allVars;
                } else if (forecastType === 'hourly') {
                    params.hourly = allVars;
                } else if (forecastType === 'current') {
                    params.current = allVars;
                }

                return params;
            };

            const [celsiusData, fahrenheitData] = await Promise.all([
                weatherService.getForecast(createParams('celsius')),
                weatherService.getForecast(createParams('fahrenheit'))
            ]);

            const celsiusCacheKey = createCacheKey(selectedCoordinates, 'celsius');
            const fahrenheitCacheKey = createCacheKey(selectedCoordinates, 'fahrenheit');

            weatherRequestCache.set(celsiusCacheKey, celsiusData);
            weatherRequestCache.set(fahrenheitCacheKey, fahrenheitData);

            const currentData = temperatureUnit === 'celsius' ? celsiusData : fahrenheitData;
            setWeatherData(currentData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather data');
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    }, [selectedCoordinates, forecastType, temperatureUnit, values, validateDateRange, weatherRequestCache, weatherService, variablesGroups, createCacheKey, getSelectedDateRange]);

    const fetchWeeklyTemperatureData = useCallback(async () => {
        if (!selectedCoordinates) {
            setWeeklyWeatherData(null);
            return;
        }

        setWeeklyWeatherLoading(true);

        try {
            const { today, endDate } = getWeeklyDateRange();
            const weeklyCacheKey = createCacheKey(selectedCoordinates, temperatureUnit, {
                type: 'weekly',
                startDate: formatDateISO(today),
                endDate: formatDateISO(endDate)
            });

            if (weatherRequestCache.has(weeklyCacheKey)) {
                setWeeklyWeatherData(weatherRequestCache.get(weeklyCacheKey));
                setWeeklyWeatherLoading(false);
                return;
            }

            const createParams = (unit: 'celsius' | 'fahrenheit') => ({
                latitude: selectedCoordinates.lat,
                longitude: selectedCoordinates.lng,
                temperature_unit: unit,
                start_date: formatDateISO(today),
                end_date: formatDateISO(endDate),
                daily: ['temperature_2m_max', 'temperature_2m_min']
            });

            const [celsiusData, fahrenheitData] = await Promise.all([
                weatherService.getForecast(createParams('celsius')),
                weatherService.getForecast(createParams('fahrenheit'))
            ]);

            const celsiusWeeklyCacheKey = createCacheKey(selectedCoordinates, 'celsius', {
                type: 'weekly',
                startDate: formatDateISO(today),
                endDate: formatDateISO(endDate)
            });
            const fahrenheitWeeklyCacheKey = createCacheKey(selectedCoordinates, 'fahrenheit', {
                type: 'weekly',
                startDate: formatDateISO(today),
                endDate: formatDateISO(endDate)
            });

            weatherRequestCache.set(celsiusWeeklyCacheKey, celsiusData);
            weatherRequestCache.set(fahrenheitWeeklyCacheKey, fahrenheitData);

            const currentData = temperatureUnit === 'celsius' ? celsiusData : fahrenheitData;
            setWeeklyWeatherData(currentData);
        } catch (error) {
            console.error('Error fetching weekly temperature data:', error);
            setWeeklyWeatherData(null);
        } finally {
            setWeeklyWeatherLoading(false);
        }
    }, [selectedCoordinates, temperatureUnit, weatherService, weatherRequestCache, createCacheKey, getWeeklyDateRange, formatDateISO]);

    // Check cache when temperature unit changes
    useEffect(() => {
        if (!selectedCoordinates) return;

        const cacheKey = createCacheKey(selectedCoordinates, temperatureUnit);
        if (weatherRequestCache.has(cacheKey)) {
            setWeatherData(weatherRequestCache.get(cacheKey));
        }
    }, [temperatureUnit, selectedCoordinates, forecastType, values, weatherRequestCache, createCacheKey]);

    // Check weekly cache when temperature unit changes
    useEffect(() => {
        if (!selectedCoordinates) return;

        const { today, endDate } = getWeeklyDateRange();
        const weeklyCacheKey = createCacheKey(selectedCoordinates, temperatureUnit, {
            type: 'weekly',
            startDate: formatDateISO(today),
            endDate: formatDateISO(endDate)
        });

        if (weatherRequestCache.has(weeklyCacheKey)) {
            setWeeklyWeatherData(weatherRequestCache.get(weeklyCacheKey));
        }
    }, [temperatureUnit, selectedCoordinates, weatherRequestCache, createCacheKey, getWeeklyDateRange, formatDateISO]);

    const clearCache = useCallback(() => {
        weatherRequestCache.clear();
    }, [weatherRequestCache]);

    return {
        weatherData,
        setWeatherData,
        weatherError,
        setWeatherError,
        loading,
        setLoading,
        weeklyWeatherData,
        weeklyWeatherLoading,
        fetchWeatherData,
        fetchWeeklyTemperatureData,
        clearCache
    };
}