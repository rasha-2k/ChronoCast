import { useState, useEffect, useMemo, useCallback } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import { AppLayout } from "@/components/layout/Layout";
import { LoadingSkeleton, LocationMap } from "@/components/common";
import { ForecastTypeSelector, VariablesSelector, WeatherSummary } from "@/components/ui";
import { ForecastType, WeatherVariable } from "@/types/weather";
import { WeatherForecastResponse } from "@shared/api";
import { Calendar, MapPin, RefreshCcw, Thermometer, Flag, Umbrella, Shield, Glasses, Package, Search, Locate, TrendingUp, Target, AlertTriangle, CloudSun } from "lucide-react";
import WeatherService from "@/services/weather-service";
import { Boot, FanBold, Jacket as JacketIcon, WaterBottle, Gloves as GlovesIcon, Scarf, Raincoat as RaincoatIcon, RunningShoes, WinterHat, BilledCap as Cap, Poncho, ShieldSunOutline, SunglassesFill as Sunglasses, SleevelessJacket, Camera, TShirtBold, CoatLine, MonclerJacket, TwotoneMasks as Mask } from "@/components/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const mockNASAImage = {
  title: "Aurora Over Earth from ISS",
  url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop",
  description: "Beautiful aurora captured from the International Space Station",
};

const getItemIcon = (item: string) => {
  const itemLower = item.toLowerCase();

  if (itemLower === 'weather gear' || itemLower === 'weather-gear') return Umbrella;
  if (itemLower === 'protective items' || itemLower === 'protective-items') return Shield;
  if (itemLower === 'comfort accessories' || itemLower === 'comfort-accessories') return FanBold;
  if (itemLower === 'safety equipment' || itemLower === 'safety-equipment') return GlovesIcon;

  if (itemLower.includes('winter hat')) return WinterHat;
  if (itemLower.includes('cap') || itemLower.includes('hat')) return Cap;
  if (itemLower.includes('umbrella')) return Umbrella;
  if (itemLower.includes('sunglasses') || itemLower.includes('eyewear')) return Sunglasses;
  if (itemLower.includes('glasses')) return Glasses;
  if (itemLower.includes('water bottle') || (itemLower.includes('bottle') && itemLower.includes('water')) || itemLower.includes('extra water')) return WaterBottle;
  if (itemLower.includes('bottle')) return WaterBottle;
  if (itemLower.includes('waterproof shoes') || itemLower.includes('water-proof shoes') || itemLower.includes('rain boots')) return Boot;
  if (itemLower.includes('running shoes') || itemLower.includes('sneakers') || itemLower.includes('shoes') || itemLower.includes('footwear')) return RunningShoes;
  if (itemLower.includes('boots')) return Boot;
  if (itemLower.includes('fan')) return FanBold;
  if (itemLower.includes('light jacket') || itemLower.includes('sleeveless jacket') || itemLower.includes('vest')) return SleevelessJacket;
  if (itemLower.includes('jacket') || itemLower.includes('coat') || itemLower.includes('windbreaker')) return JacketIcon;
  if (itemLower.includes('warm coat') || itemLower.includes('heavy coat') || itemLower.includes('parka')) return CoatLine;
  if (itemLower.includes('thermal') || itemLower.includes('thermale') || itemLower.includes('thermal clothing')) return MonclerJacket;
  if (itemLower.includes('poncho')) return Poncho;
  if (itemLower.includes('raincoat')) return RaincoatIcon;
  if (itemLower.includes('t-shirt') || itemLower.includes('light clothing')) return TShirtBold;
  if (itemLower.includes('mask')) return Mask;
  if (itemLower.includes('scarf')) return Scarf;
  if (itemLower.includes('gloves')) return GlovesIcon;
  if (itemLower.includes('sunscreen') || itemLower.includes('sunblock') || itemLower.includes('spf')) return ShieldSunOutline;
  if (itemLower.includes('camera')) return Camera;

  return Package;
};

const placeholderItems = [
  "Weather gear",
  "Protective items",
  "Comfort accessories",
  "Safety equipment"
];

export default function Dashboard() {
  const [values, setValues] = useState<(DateObject | string | Date | null)[]>([
    new DateObject(), 
    new DateObject().add(7, "days"),
  ]);
  const [forecastType, setForecastType] = useState<ForecastType>('daily');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{ name: string, latitude: number, longitude: number }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'search' | 'current' | 'map' | null>(null);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [isMapClickEnabled, setIsMapClickEnabled] = useState<boolean>(false);
  
  const [weeklyWeatherData, setWeeklyWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [weeklyWeatherLoading, setWeeklyWeatherLoading] = useState<boolean>(false);
  
  const validateDateRange = useCallback((dateValues: (DateObject | string | Date | null)[]): string | null => {
    if (!dateValues || dateValues.length === 0) {
      return 'Please select at least one date';
    }

    const today = new Date();
    const maxFuture = new Date();
    maxFuture.setDate(today.getDate() + 16); // 16 days in future
    const minPast = new Date();
    minPast.setMonth(today.getMonth() - 3); // 3 months in past

    const toYYYYMMDD = (v: DateObject | string | Date) =>
      v instanceof DateObject
        ? v.format("YYYY-MM-DD")
        : new DateObject(v).format("YYYY-MM-DD");

    const validDates = dateValues.filter(Boolean) as (DateObject | string | Date)[];

    if (validDates.length === 1) {
      const date = new Date(toYYYYMMDD(validDates[0]));

      if (date < minPast) {
        return 'Date cannot be more than 3 months in the past';
      }

      if (date > maxFuture) {
        return 'Date cannot be more than 16 days in the future';
      }
    } else if (validDates.length === 2) {
      const startDate = new Date(toYYYYMMDD(validDates[0]));
      const endDate = new Date(toYYYYMMDD(validDates[1]));

      if (startDate > endDate) {
        return 'Start date must be before end date';
      }

      if (startDate < minPast) {
        return 'Start date cannot be more than 3 months in the past';
      }

      if (endDate > maxFuture) {
        return 'End date cannot be more than 16 days in the future';
      }
    }

    return null;
  }, []);
  
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [variablesInitialized, setVariablesInitialized] = useState<boolean>(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const weatherService = useMemo(() => new WeatherService(), []);
  const weatherRequestCache = useMemo(() => new Map<string, any>(), []);
  
  const getCoordinates = useCallback(() => {
    return selectedCoordinates;
  }, [selectedCoordinates]);
  
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
  
  const getWeeklyDateRange = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    return { today, endDate };
  }, []);
  
  const getSelectedDateRange = useCallback(() => {
    const validDates = (values || []).filter(Boolean) as (DateObject | string | Date)[];
    const startDate = validDates.length > 0 ? formatDate(validDates[0]) : formatDate(new Date());
    const endDate = validDates.length > 1 ? formatDate(validDates[1]) : startDate;
    return { startDate, endDate };
  }, [values, formatDate]);
  
  const createCacheKey = useCallback((coords: { lat: number; lng: number }, unit: string, extraData?: any) => {
    return JSON.stringify({
      lat: coords.lat,
      lng: coords.lng,
      forecastType,
      temperatureUnit: unit,
      values: values.map(v => v instanceof DateObject ? v.format('YYYY-MM-DD') : new DateObject(v).format('YYYY-MM-DD')),
      ...extraData
    });
  }, [forecastType, values]);
  
  const variablesGroups: Record<ForecastType, WeatherVariable[]> = {
    daily: [
      { id: 'temperature_2m_max', name: 'Max Temperature', group: 'daily' },
      { id: 'temperature_2m_min', name: 'Min Temperature', group: 'daily' },
      { id: 'precipitation_sum', name: 'Precipitation Sum', group: 'daily' },
      { id: 'weather_code', name: 'Weather Code', group: 'daily' },
      { id: 'sunrise', name: 'Sunrise', group: 'daily' },
      { id: 'sunset', name: 'Sunset', group: 'daily' },
      { id: 'wind_gusts_10m_max', name: 'Max Wind Gusts', group: 'daily' },
      { id: 'uv_index_max', name: 'UV Index Max', group: 'daily' },
      { id: 'precipitation_probability_max', name: 'Max Precipitation Probability', group: 'daily' }
    ],
    hourly: [
      { id: 'temperature_2m', name: 'Temperature', group: 'hourly' },
      { id: 'relative_humidity_2m', name: 'Relative Humidity', group: 'hourly' },
      { id: 'precipitation', name: 'Precipitation', group: 'hourly' },
      { id: 'weather_code', name: 'Weather Code', group: 'hourly' },
      { id: 'wind_speed_10m', name: 'Wind Speed', group: 'hourly' },
      { id: 'wind_direction_10m', name: 'Wind Direction', group: 'hourly' },
      { id: 'cloud_cover', name: 'Cloud Cover', group: 'hourly' },
      { id: 'visibility', name: 'Visibility', group: 'hourly' },
      { id: 'uv_index', name: 'UV Index', group: 'hourly' }
    ],
    current: [
      { id: 'temperature_2m', name: 'Temperature', group: 'current' },
      { id: 'relative_humidity_2m', name: 'Relative Humidity', group: 'current' },
      { id: 'weather_code', name: 'Weather Code', group: 'current' },
      { id: 'wind_speed_10m', name: 'Wind Speed', group: 'current' },
      { id: 'wind_direction_10m', name: 'Wind Direction', group: 'current' },
      { id: 'cloud_cover', name: 'Cloud Cover', group: 'current' },
      { id: 'visibility', name: 'Visibility', group: 'current' }
    ]
  };
  
  const fetchWeatherData = useCallback(async () => {
    if (!selectedCoordinates) {
      setWeatherError('Please select a location first');
      return;
    }
    
    setLoading(true);
    setWeatherError(null);
    
    try {
      const coordinates = getCoordinates();
      
      if (!coordinates) {
        throw new Error('No location coordinates available');
      }
      
      const dateError = validateDateRange(values);
      if (dateError) {
        throw new Error(dateError);
      }
      
      const allVars = variablesGroups[forecastType].map(v => v.id);
      
      const currentCacheKey = createCacheKey(coordinates, temperatureUnit);
      
      if (weatherRequestCache.has(currentCacheKey)) {
        setWeatherData(weatherRequestCache.get(currentCacheKey));
        setLoading(false);
        return;
      }
      
      const { startDate, endDate } = getSelectedDateRange();
      
      const createParams = (unit: 'celsius' | 'fahrenheit') => {
        const params: {
          latitude: number;
          longitude: number;
          daily?: string[];
          hourly?: string[];
          current?: string[];
          temperature_unit: string;
          start_date: string;
          end_date: string;
        } = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
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
      
      // Fetch both temperature units in parallel
      const [celsiusData, fahrenheitData] = await Promise.all([
        weatherService.getForecast(createParams('celsius')),
        weatherService.getForecast(createParams('fahrenheit'))
      ]);
      
      const celsiusCacheKey = createCacheKey(coordinates, 'celsius');
      const fahrenheitCacheKey = createCacheKey(coordinates, 'fahrenheit');
      
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
  }, [selectedCoordinates, forecastType, temperatureUnit, values, validateDateRange, weatherRequestCache, weatherService, variablesGroups, getCoordinates, formatDate, createCacheKey, getSelectedDateRange]);

  const showLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  useEffect(() => {
    showLoading();
  }, []);
  
  useEffect(() => {
    if (selectedCoordinates) {
      fetchWeatherData();
    }
  }, [selectedCoordinates, forecastType, values, fetchWeatherData]);
  useEffect(() => {
    if (!selectedCoordinates) return;
    
    const coordinates = getCoordinates();
    if (!coordinates) return;
    
    const cacheKey = createCacheKey(coordinates, temperatureUnit);
    
    if (weatherRequestCache.has(cacheKey)) {
      setWeatherData(weatherRequestCache.get(cacheKey));
    }
  }, [temperatureUnit, selectedCoordinates, forecastType, values, weatherRequestCache, getCoordinates, createCacheKey]);

  useEffect(() => {
    if (selectedCoordinates && !variablesInitialized) {
      const defaultVariables = variablesGroups[forecastType]
        .filter(v => 
          v.id.includes('temperature') || 
          v.id.includes('precipitation') || 
          v.id === 'weather_code'
        )
        .map(v => v.id);
      
      const varsToSelect = defaultVariables.length > 0 
        ? defaultVariables 
        : variablesGroups[forecastType].slice(0, 3).map(v => v.id);
      
      setSelectedVariables(varsToSelect);
      setVariablesInitialized(true);
    }
  }, [selectedCoordinates, forecastType, variablesGroups, variablesInitialized]);

  // Geocoding API for city search with autocomplete
  const searchLocations = async (query: string) => {
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
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchLocations(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (event.target instanceof Element &&
        !event.target.closest(".search-input-wrapper")) {
        setSearchResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedCoordinates(null);
    setLocationSource(null);
    setSearchTerm("");
  }, [values]);

  useEffect(() => {
    const validationError = validateDateRange(values);
    setDateValidationError(validationError);
  }, [values, validateDateRange]);


  const refresh = () => {
    showLoading();
    if (selectedCoordinates) {
      setSelectedCoordinates({ ...selectedCoordinates });
      weatherRequestCache.clear();
      fetchWeatherData();
    }
  };

  const clearLocation = () => {
    setSelectedCoordinates(null);
    setLocationSource(null);
    setSearchTerm("");
    setSearchResults([]);
    setWeatherData(null);
    setWeatherError(null);
    setWeeklyWeatherData(null);
    setVariablesInitialized(false); 
    setIsMapClickEnabled(false); 
  };

  const displayedItems = placeholderItems;
  const isPlaceholder = true;

  const fetchWeeklyTemperatureData = useCallback(async () => {
    if (!selectedCoordinates) {
      setWeeklyWeatherData(null);
      return;
    }

    setWeeklyWeatherLoading(true);

    try {
      const coordinates = getCoordinates();
      
      if (!coordinates) {
        setWeeklyWeatherData(null);
        setWeeklyWeatherLoading(false);
        return;
      }

      // Always fetch 7 days starting from today
      const { today, endDate } = getWeeklyDateRange();

      const weeklyCacheKey = createCacheKey(coordinates, temperatureUnit, {
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
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        temperature_unit: unit,
        start_date: formatDateISO(today),
        end_date: formatDateISO(endDate),
        daily: ['temperature_2m_max', 'temperature_2m_min']
      });

      // Fetch both temperature units in parallel
      const [celsiusData, fahrenheitData] = await Promise.all([
        weatherService.getForecast(createParams('celsius')),
        weatherService.getForecast(createParams('fahrenheit'))
      ]);
      
      const celsiusWeeklyCacheKey = createCacheKey(coordinates, 'celsius', {
        type: 'weekly',
        startDate: formatDateISO(today),
        endDate: formatDateISO(endDate)
      });
      const fahrenheitWeeklyCacheKey = createCacheKey(coordinates, 'fahrenheit', {
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
  }, [selectedCoordinates, temperatureUnit, weatherService, weatherRequestCache, getCoordinates, createCacheKey, getWeeklyDateRange, formatDateISO]);

  // Build weekly average temperature data (today + next 6 days) from weeklyWeatherData
  const weeklyTempsData = useMemo(() => {
    try {
      const daily = (weeklyWeatherData as any)?.daily;
      if (!daily) return [] as Array<{ date: string; avgTemp: number }>;

      const dates: string[] = daily.time || daily.date || daily.dates || [];
      const tmax: number[] = daily.temperature_2m_max || [];
      const tmin: number[] = daily.temperature_2m_min || [];
      if (!dates.length || !tmax.length || !tmin.length) return [];

      // Build list with exactly 7 days
      const result = dates.slice(0, 7).map((d, i) => {
        const max = typeof tmax[i] === 'number' ? tmax[i] : null;
        const min = typeof tmin[i] === 'number' ? tmin[i] : null;
        if (max == null || min == null) return null;
        const avg = (max + min) / 2;
        const dateObj = new Date(d);
        const label = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          date: label,
          avgTemp: Number(avg.toFixed(1)),
        };
      }).filter(Boolean) as Array<{ date: string; avgTemp: number }>;

      return result;
    } catch {
      return [] as Array<{ date: string; avgTemp: number }>;
    }
  }, [weeklyWeatherData]);

  // Fetch weekly temperature data independently for the chart
  useEffect(() => {
    if (selectedCoordinates) {
      fetchWeeklyTemperatureData();
    }
  }, [selectedCoordinates, fetchWeeklyTemperatureData]);

  // Handle temperature unit changes for weekly data - check cache first
  useEffect(() => {
    if (!selectedCoordinates) return;
    
    const coordinates = getCoordinates();
    if (!coordinates) return;
    
    const { today, endDate } = getWeeklyDateRange();
    
    const weeklyCacheKey = createCacheKey(coordinates, temperatureUnit, {
      type: 'weekly',
      startDate: formatDateISO(today),
      endDate: formatDateISO(endDate)
    });
    
    if (weatherRequestCache.has(weeklyCacheKey)) {
      setWeeklyWeatherData(weatherRequestCache.get(weeklyCacheKey));
    }
  }, [temperatureUnit, selectedCoordinates, weatherRequestCache, getCoordinates, createCacheKey, getWeeklyDateRange, formatDateISO]);

  return (
    <AppLayout>
      <div className="cc-dashboard-page">
        {/* KPIs */}
        <div className="cc-dashboard-kpis">
          {[
            { t: "Risk Index", v: "75%", icon: Thermometer, c: "text-emerald-300" },
            { t: "Space Weather", v: "M-Class", icon: Thermometer, c: "text-fuchsia-300" },
            { t: "Updated", v: "2 min ago", icon: RefreshCcw, c: "text-amber-300" },
          ].map((k) => (
            <div key={k.t} className="cc-dashboard-kpi">
              <div className="cc-dashboard-kpi-row">
                <div>
                  <p className="cc-dashboard-kpi-label">{k.t}</p>
                  <p className={`cc-dashboard-kpi-value ${k.c}`}>{k.v}</p>
                </div>
                <k.icon className={`cc-dashboard-kpi-icon ${k.c}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="cc-dashboard-main">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-1">
            <div className="cc-dashboard-controls">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Controls</h3>
                <button
                  onClick={refresh}
                  className="dashboard-refresh-button"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
              <div className="space-y-4">
                <ForecastTypeSelector
                  forecastType={forecastType}
                  onChange={(type) => {
                    setForecastType(type);
                    setSelectedVariables([]);
                    setVariablesInitialized(false); // Reset initialization flag
                  }}
                />
                <label className="block text-xs">
                  <span className="mb-1 inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date
                  </span>
                  <DatePicker
                    value={values as any}
                    onChange={setValues as any}
                    dateSeparator=" to "
                    rangeHover
                    range
                    format="DD-MM-YYYY"
                    inputClass="dashboard-input"
                    containerStyle={{ width: "100%" }}
                    className="cc-datepicker"
                    arrowClassName="cc-datepicker-arrow"
                    calendarPosition="bottom-center"
                    placeholder="Select date or range"
                    maxDate={new DateObject().add(16, "days")}
                    minDate={new DateObject().subtract(3, "months")}
                  />
                  {dateValidationError && (
                    <div className="mt-2">
                      <p className="text-red-500 text-xs">{dateValidationError}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Suggested Items Section */}
            <div className="cc-dashboard-suggested-items">
              <h3 className="mb-3 text-sm font-semibold">
                Suggested items to have
              </h3>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <LoadingSkeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {displayedItems.map((item, index) => {
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

            <div className="cc-dashboard-nasa">
              <h3 className="mb-3 text-sm font-semibold">NASA Image</h3>
              {loading ? (
                <LoadingSkeleton className="mb-3 h-36 w-full" />
              ) : (
                <>
                  <img src={mockNASAImage.url} alt={mockNASAImage.title} className="mb-3 h-36 w-full rounded-lg object-cover" />
                  <h4 className="mb-1 text-sm font-medium">{mockNASAImage.title}</h4>
                  <p className="text-xs text-muted-foreground">{mockNASAImage.description}</p>
                </>
              )}
            </div>
          </div>

          {/* Map + Viz */}
          <div className="space-y-6 lg:col-span-3">
            <div className="cc-dashboard-map">
              <div className="mb-3 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Location</h3>
                  {selectedCoordinates ? (
                    <button
                      onClick={clearLocation}
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
                        // Disable map click mode when user starts typing
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
                    onClick={() => {
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
                    }}
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
                  </>
                )}

              </div>

            </div>
            <div className="cc-dashboard-weather">
              <div className="weather-dashboard-controls">
                  <div className="weather-controls-container">
                    <VariablesSelector
                      variables={variablesGroups[forecastType]}
                      selectedVariables={selectedVariables}
                      onSelectVariables={(variables) => {
                        setSelectedVariables(variables);
                      }}
                    />
                  </div>
              </div>

              {loading ? (
                <div className="weather-dashboard-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading weather data...</p>
                </div>
              ) : weatherError ? (
                <div className="weather-dashboard-error">
                  <div className="error-icon"><AlertTriangle className="h-12 w-12" /></div>
                  <p>{weatherError}</p>
                  <button
                    onClick={() => {
                      setWeatherError(null);
                      fetchWeatherData();
                    }}
                    className="retry-button"
                  >
                    Retry
                  </button>
                </div>
              ) : weatherData ? (
                <div className="weather-dashboard-content">
                  <WeatherSummary
                    data={weatherData}
                    forecastType={forecastType}
                    temperatureUnit={temperatureUnit}
                    selectedVariables={selectedVariables}
                    onToggleUnit={(unit) => {
                      setTemperatureUnit(unit);
                    }}
                  />
                </div>
              ) : (
                <div className="weather-dashboard-empty">
                  <div className="empty-icon"><CloudSun className="h-12 w-12" /></div>
                  <p>{!selectedCoordinates ? "Select a location to view weather forecast" : "Select forecast options above"}</p>
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="cc-dashboard-timeline">
                <h3 className="mb-3 text-sm font-semibold">Weekly Temperature Trend</h3>
                {weeklyWeatherLoading ? (
                  <div className="weather-dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading temperature data...</p>
                  </div>
                ) : weeklyTempsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <LineChart data={weeklyTempsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" strokeOpacity={0.3} />
                      <XAxis dataKey="date" padding={{ left: 40, right: 40 }} />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip
                        formatter={(value: any) => `${value}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`}
                        cursor={{ stroke: "var(--accent)", strokeOpacity: 0.4 }}
                      />
                      <Line type="monotone" dataKey="avgTemp" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="weather-dashboard-empty">
                    <div className="empty-icon"><TrendingUp className="h-12 w-12" /></div>
                    <p>{!selectedCoordinates
                      ? 'Select a location to view weekly temperatures'
                      : 'Weekly temperature data is not available'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}


