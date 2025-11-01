import { useState, useEffect, useMemo } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { Calendar, RefreshCcw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { ForecastTypeSelector } from "@/components/ui";
import { KPICard } from "@/components/ui/KPICard";
import { SuggestedItems } from "@/components/ui/SuggestedItems";
import { NASAImage } from "@/components/ui/NASAImage";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { WeatherDashboardComponent } from "@/components/ui/WeatherDashboard";

import { ForecastType } from "@/types/weather";
import { useWeatherData } from "@/lib/hooks/useWeatherData";
import { useLocationSearch } from "@/lib/hooks/useLocationSearch";
import { useDateValidation } from "@/lib/hooks/useDateValidation";
import { DASHBOARD_KPIS, MOCK_NASA_IMAGE, PLACEHOLDER_ITEMS, VARIABLES_GROUPS } from "@/lib/constants";

export default function Dashboard() {
  const [values, setValues] = useState<(DateObject | string | Date | null)[]>([
    new DateObject(),
    new DateObject().add(7, "days"),
  ]);

  const [forecastType, setForecastType] = useState<ForecastType>('daily');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [variablesInitialized, setVariablesInitialized] = useState<boolean>(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'search' | 'current' | 'map' | null>(null);
  const [isMapClickEnabled, setIsMapClickEnabled] = useState<boolean>(false);

  const { dateValidationError, validateDateRange } = useDateValidation(values);
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    searchLocations,
    clearSearch
  } = useLocationSearch();

  const {
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
  } = useWeatherData(
    selectedCoordinates,
    forecastType,
    temperatureUnit,
    values,
    VARIABLES_GROUPS,
    validateDateRange
  );

  useEffect(() => {
    if (selectedCoordinates && !variablesInitialized) {
      const defaultVariables = VARIABLES_GROUPS[forecastType]
        .filter(v =>
          v.id.includes('temperature') ||
          v.id.includes('precipitation') ||
          v.id === 'weather_code'
        )
        .map(v => v.id);

      const varsToSelect = defaultVariables.length > 0
        ? defaultVariables
        : VARIABLES_GROUPS[forecastType].slice(0, 3).map(v => v.id);

      setSelectedVariables(varsToSelect);
      setVariablesInitialized(true);
    }
  }, [selectedCoordinates, forecastType, variablesInitialized]);

  useEffect(() => {
    if (selectedCoordinates) {
      fetchWeatherData();
    }
  }, [selectedCoordinates, forecastType, values, fetchWeatherData]);

  useEffect(() => {
    if (selectedCoordinates) {
      fetchWeeklyTemperatureData();
    }
  }, [selectedCoordinates, fetchWeeklyTemperatureData]);

  useEffect(() => {
    setSelectedCoordinates(null);
    setLocationSource(null);
    setSearchTerm("");
  }, [values, setSearchTerm]);

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
  }, [setSearchResults]);

  useEffect(() => {
    const showLoading = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 600);
    };
    showLoading();
  }, [setLoading]);

  const weeklyTempsData = useMemo(() => {
    try {
      const daily = (weeklyWeatherData as any)?.daily;
      if (!daily) return [] as Array<{ date: string; avgTemp: number }>;

      const dates: string[] = daily.time || daily.date || daily.dates || [];
      const tmax: number[] = daily.temperature_2m_max || [];
      const tmin: number[] = daily.temperature_2m_min || [];
      if (!dates.length || !tmax.length || !tmin.length) return [];

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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
    if (selectedCoordinates) {
      setSelectedCoordinates({ ...selectedCoordinates });
      clearCache();
      fetchWeatherData();
    }
  };

  const handleClearLocation = () => {
    setSelectedCoordinates(null);
    setLocationSource(null);
    clearSearch();
    setSearchResults([]);
    setWeatherData(null);
    setWeatherError(null);
    setVariablesInitialized(false);
    setIsMapClickEnabled(false);
  };

  const handleForecastTypeChange = (type: ForecastType) => {
    setForecastType(type);
    setSelectedVariables([]);
    setVariablesInitialized(false);
  };

  const handleRetryWeather = () => {
    setWeatherError(null);
    fetchWeatherData();
  };

  return (
    <div className="cc-dashboard-page">
      {/* KPIs */}
      <div className="cc-dashboard-kpis">
        {DASHBOARD_KPIS.map((kpi) => (
          <KPICard
            key={kpi.t}
            title={kpi.t}
            value={kpi.v}
            icon={kpi.icon}
            colorClass={kpi.c}
          />
        ))}
      </div>

      <div className="cc-dashboard-main">
        {/* Left Sidebar - Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Controls Section */}
          <div className="cc-dashboard-controls">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Controls</h3>
              <button onClick={handleRefresh} className="dashboard-refresh-button">
                <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              <ForecastTypeSelector
                forecastType={forecastType}
                onChange={handleForecastTypeChange}
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

          {/* Suggested Items */}
          <SuggestedItems
            items={PLACEHOLDER_ITEMS}
            loading={loading}
            isPlaceholder={true}
          />

          {/* NASA Image */}
          <NASAImage
            image={MOCK_NASA_IMAGE}
            loading={loading}
          />
        </div>

        {/* Right Side - Map + Weather */}
        <div className="space-y-6 lg:col-span-3">
          {/* Location Selector */}
          <LocationSelector
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            selectedCoordinates={selectedCoordinates}
            setSelectedCoordinates={setSelectedCoordinates}
            locationSource={locationSource}
            setLocationSource={setLocationSource}
            isMapClickEnabled={isMapClickEnabled}
            setIsMapClickEnabled={setIsMapClickEnabled}
            loading={loading}
            searchLocations={searchLocations}
            onClearLocation={handleClearLocation}
          />

          {/* Weather Dashboard */}
          <WeatherDashboardComponent
            loading={loading}
            weatherError={weatherError}
            weatherData={weatherData}
            forecastType={forecastType}
            temperatureUnit={temperatureUnit}
            selectedVariables={selectedVariables}
            selectedCoordinates={selectedCoordinates}
            variablesGroups={VARIABLES_GROUPS}
            onSelectVariables={setSelectedVariables}
            onToggleUnit={setTemperatureUnit}
            onRetry={handleRetryWeather}
          />

          {/* Weekly Temperature Trend */}
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
  );
}