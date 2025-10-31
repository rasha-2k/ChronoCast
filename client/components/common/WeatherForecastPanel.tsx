import React, { useEffect, useState } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { WeatherForecastResponse } from '@shared/api';
import { MapPin, Calendar, LocateFixed } from 'lucide-react';
import { getWeatherDescription, getWeatherIcon } from '@/types/weather';

interface DailyWeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
}

interface WeatherForecastPanelProps {
  latitude?: number;
  longitude?: number;
  isExpanded?: boolean;
  onViewLocation?: (lat: number, lng: number) => void;
  locationName?: string;
}

const WeatherForecastPanel: React.FC<WeatherForecastPanelProps> = ({
  latitude,
  longitude,
  isExpanded = false,
  onViewLocation,
  locationName
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<DailyWeatherData[]>([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) {
        setForecast([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&forecast_days=7`);
        if (!response.ok) {
          throw new Error(`Failed to fetch forecast data: ${response.statusText}`);
        }
        const weatherData: WeatherForecastResponse = await response.json();
        const processedForecast = weatherData.daily.time.map((date, index) => ({
          date,
          maxTemp: weatherData.daily.temperature_2m_max[index],
          minTemp: weatherData.daily.temperature_2m_min[index],
          precipitation: weatherData.daily.precipitation_sum[index],
          weatherCode: weatherData.daily.weather_code[index],
          weatherDescription: getWeatherDescription(weatherData.daily.weather_code[index])
        }));
        setForecast(processedForecast);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather forecast:', err);
        setError('Failed to load weather forecast');
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [latitude, longitude]);

  const todayForecast = forecast.length > 0 ? forecast[0] : null;
  const renderLocationInfo = () => {
    if (!latitude || !longitude) return null;
    return (
      <div className="weather-location-info">
        <MapPin className="h-4 w-4" />
        <span className="location-name">
          {locationName || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}
        </span>
        {onViewLocation && (
          <button
            onClick={() => onViewLocation(latitude, longitude)}
            className="location-view-btn"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            <span className="sr-only">View on map</span>
          </button>
        )}
      </div>
    );
  };

  if (!latitude || !longitude) {
    return (
      <div className={`cc-dashboard-weather ${isExpanded ? 'weather-expanded' : ''}`}>
        <div className="weather-header">
          <h3 className="text-sm font-semibold flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Weather Forecast
          </h3>
        </div>
        <div className="weather-empty-state">
          <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm text-center">
            Click on the map to view weather forecast for a location
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cc-dashboard-weather ${isExpanded ? 'weather-expanded' : ''}`}>
      <div className="weather-header">
        <h3 className="text-sm font-semibold flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Weather Forecast
        </h3>
        {renderLocationInfo()}
      </div>

      {loading ? (
        <div className="weather-loading">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="weather-error text-red-500 text-sm">{error}</div>
      ) : (
        <div className="weather-content">
          {/* Today's forecast - featured prominently */}
          {todayForecast && (
            <div className="weather-today">
              <div className="weather-today-header">
                <div>
                  <div className="today-label">Today</div>
                  <div className="today-date">{new Date(todayForecast.date).toLocaleDateString()}</div>
                </div>
                <div className="today-temp">
                  <span className="today-high">{todayForecast.maxTemp}°</span>
                  <span className="today-low">{todayForecast.minTemp}°</span>
                </div>
              </div>

              <div className="weather-today-details">
                <div className="weather-today-icon">
                  {React.createElement(getWeatherIcon(todayForecast.weatherCode), { className: "h-12 w-12" })}
                </div>
                <div className="weather-today-info">
                  <div className="weather-today-desc">{todayForecast.weatherDescription}</div>
                  <div className="weather-today-precip">Precipitation: {todayForecast.precipitation}mm</div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming forecast */}
          <div className="weather-upcoming">
            <h4 className="upcoming-title">7-Day Forecast</h4>
            <div className={isExpanded ? "weather-forecast-grid" : "weather-forecast-list"}>
              {forecast.map((day) => {
                const WeatherIcon = getWeatherIcon(day.weatherCode);
                const isToday = day === todayForecast;
                return (
                  <div key={day.date} className={`weather-day-card ${isToday && !isExpanded ? 'hidden' : ''}`}>
                    <div className="weather-day-header">
                      <div className="date-info">
                        <div className="day-name">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="full-date">{new Date(day.date).toLocaleDateString()}</div>
                      </div>
                      <div className="weather-icon">
                        <WeatherIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="weather-details">
                      <div className="temperature">
                        <span className="min-temp">{day.minTemp}°</span>
                        <span className="temp-separator">/</span>
                        <span className="max-temp">{day.maxTemp}°</span>
                      </div>
                      <div className="weather-description">{day.weatherDescription}</div>
                      <div className="precipitation">Precipitation: {day.precipitation}mm</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecastPanel;