import React from 'react';
import { ForecastType, getWeatherDescription, getWeatherIcon } from '@/types/weather';
import { Cloud } from '@/types/weather';

interface WeatherSummaryProps {
    data: any;
    forecastType: ForecastType;
    temperatureUnit: 'celsius' | 'fahrenheit';
    selectedVariables?: string[];
    onToggleUnit?: (unit: 'celsius' | 'fahrenheit') => void;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({ data, forecastType, temperatureUnit, selectedVariables = [], onToggleUnit }) => {
    if (!data) return null;


    const tempUnit = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

    const convertTemperature = (value: number): number => {
        if (temperatureUnit === 'fahrenheit') {
            return Math.round((value * 9 / 5) + 32);
        }
        return value;
    };

    const formatVariableValue = (value: any, variable: string): string => {
        if (value === undefined || value === null) return 'N/A';

        if (variable.includes('temperature')) {
            const convertedValue = convertTemperature(value);
            return `${convertedValue}${tempUnit}`;
        } else if (variable.includes('precipitation')) {
            return `${value} mm`;
        } else if (variable.includes('humidity')) {
            return `${value}%`;
        } else if (variable.includes('wind_speed')) {
            return `${value} km/h`;
        } else if (variable.includes('wind_direction')) {
            return `${value}°`;
        } else if (variable.includes('pressure')) {
            return `${value} hPa`;
        } else if (variable.includes('visibility')) {
            return `${(value / 1000).toFixed(1)} km`;
        } else if (variable.includes('cloud_cover')) {
            return `${value}%`;
        } else if (variable.includes('time') || variable.includes('sunrise') || variable.includes('sunset')) {
            return new Date(value).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        return value.toString();
    };

    const renderCurrentWeather = () => {
        if (!data.current) return null;

        const current = data.current;
        const weatherCode = current.weather_code;
        const temperature = current.temperature_2m;
        const WeatherIcon = getWeatherIcon(weatherCode);

        return (
            <div className="current-weather-summary">
                <div className="weather-summary-icon">
                    <WeatherIcon size={48} />
                </div>

                <div className="weather-summary-details">
                    {temperature !== undefined &&
                        selectedVariables.includes('temperature_2m') && (
                            <div className="weather-summary-temperature">
                                {convertTemperature(temperature)}{tempUnit}
                            </div>
                        )}

                    {weatherCode !== undefined &&
                        selectedVariables.includes('weather_code') && (
                            <div className="weather-summary-description">
                                {getWeatherDescription(weatherCode)}
                            </div>
                        )}

                    {current.time &&
                        (selectedVariables.includes('temperature_2m') || selectedVariables.includes('weather_code')) && (
                            <div className="weather-summary-time">
                                {new Date(current.time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </div>
                        )}
                </div>

                <div className="weather-summary-metrics">
                    {selectedVariables
                        .filter(variable => 
                            variable !== 'temperature_2m' && 
                            variable !== 'weather_code' &&
                            current[variable] !== undefined && 
                            current[variable] !== null
                        )
                        .map((variable) => (
                            <div key={variable} className="weather-metric">
                                <span className="metric-label">
                                    {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="metric-value">
                                    {formatVariableValue(current[variable], variable)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    // Render daily weather summary (first day)
    const renderDailyWeather = () => {
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) return null;

        const firstDayIndex = 0;
        const time = data.daily.time[firstDayIndex];
        const maxTemp = data.daily.temperature_2m_max?.[firstDayIndex];
        const minTemp = data.daily.temperature_2m_min?.[firstDayIndex];
        const weatherCode = data.daily.weather_code?.[firstDayIndex];

        const WeatherIcon = weatherCode !== undefined ? getWeatherIcon(weatherCode) : Cloud;

        const availableVariables = Object.keys(data.daily).filter(key =>
            key !== 'time' && data.daily[key] && Array.isArray(data.daily[key]) &&
            selectedVariables.includes(key)
        );

        return (
            <div className="daily-weather-summary">
                <div className="weather-summary-date">
                    {new Date(time).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>

                <div className="weather-summary-content">
                    <div className="weather-summary-icon">
                        <WeatherIcon size={48} />
                    </div>

                    <div className="weather-summary-details">
                        {(maxTemp !== undefined || minTemp !== undefined) &&
                            (selectedVariables.includes('temperature_2m_max') ||
                                selectedVariables.includes('temperature_2m_min')) && (
                                <div className="weather-summary-temperature">
                                    {minTemp !== undefined &&
                                        selectedVariables.includes('temperature_2m_min') && (
                                            <span className="min-temp">{convertTemperature(minTemp)}{tempUnit}</span>
                                        )}
                                    {maxTemp !== undefined && minTemp !== undefined &&
                                        selectedVariables.includes('temperature_2m_max') &&
                                        selectedVariables.includes('temperature_2m_min') && (
                                            <span className="temp-separator">/</span>
                                        )}
                                    {maxTemp !== undefined &&
                                        selectedVariables.includes('temperature_2m_max') && (
                                            <span className="max-temp">{convertTemperature(maxTemp)}{tempUnit}</span>
                                        )}
                                </div>
                            )}

                        {weatherCode !== undefined &&
                            selectedVariables.includes('weather_code') && (
                                <div className="weather-summary-description">
                                    {getWeatherDescription(weatherCode)}
                                </div>
                            )}
                    </div>
                </div>

                <div className="weather-summary-metrics">
                    {availableVariables.map((variable) => {
                        const value = data.daily[variable]?.[firstDayIndex];
                        if (value === undefined || value === null) return null;

                        if (variable === 'weather_code') return null;

                        if (variable === 'temperature_2m_max' || variable === 'temperature_2m_min') return null;

                        return (
                            <div key={variable} className="weather-metric">
                                <span className="metric-label">
                                    {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="metric-value">
                                    {formatVariableValue(value, variable)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderHourlyWeather = () => {
        if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) return null;

        const now = new Date();
        const currentHourIndex = data.hourly.time.findIndex((time: string) => {
            const hourTime = new Date(time);
            return hourTime >= now;
        });

        const index = currentHourIndex >= 0 ? currentHourIndex : 0;

        const time = data.hourly.time[index];
        const temperature = data.hourly.temperature_2m?.[index];
        const weatherCode = data.hourly.weather_code?.[index];

        const WeatherIcon = weatherCode !== undefined ? getWeatherIcon(weatherCode) : Cloud;

        const availableVariables = Object.keys(data.hourly).filter(key =>
            key !== 'time' && data.hourly[key] && Array.isArray(data.hourly[key]) &&
            selectedVariables.includes(key)
        );

        return (
            <div className="hourly-weather-summary">
                <div className="weather-summary-time">
                    {new Date(time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}
                </div>

                <div className="weather-summary-content">
                    <div className="weather-summary-icon">
                        <WeatherIcon size={48} />
                    </div>

                    <div className="weather-summary-details">
                        {temperature !== undefined &&
                            selectedVariables.includes('temperature_2m') && (
                                <div className="weather-summary-temperature">
                                    {convertTemperature(temperature)}{tempUnit}
                                </div>
                            )}

                        {weatherCode !== undefined &&
                            selectedVariables.includes('weather_code') && (
                                <div className="weather-summary-description">
                                    {getWeatherDescription(weatherCode)}
                                </div>
                            )}
                    </div>
                </div>

                <div className="weather-summary-metrics">
                    {availableVariables.map((variable) => {
                        const value = data.hourly[variable]?.[index];
                        if (value === undefined || value === null) return null;

                        if (variable === 'weather_code') return null;

                        if (variable === 'temperature_2m') return null;

                        return (
                            <div key={variable} className="weather-metric">
                                <span className="metric-label">
                                    {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="metric-value">
                                    {formatVariableValue(value, variable)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="weather-summary">
            <div className="summary-header">
                <h3 className="summary-title">Weather Summary</h3>

                {onToggleUnit && (
                    <div className="unit-toggle-buttons">
                        <button
                            className={`unit-button ${temperatureUnit === 'celsius' ? 'active' : ''}`}
                            onClick={() => onToggleUnit('celsius')}
                        >
                            °C
                        </button>
                        <button
                            className={`unit-button ${temperatureUnit === 'fahrenheit' ? 'active' : ''}`}
                            onClick={() => onToggleUnit('fahrenheit')}
                        >
                            °F
                        </button>
                    </div>
                )}
            </div>

            <div className="summary-content">
                {forecastType === 'current' && renderCurrentWeather()}
                {forecastType === 'daily' && renderDailyWeather()}
                {forecastType === 'hourly' && renderHourlyWeather()}
            </div>
        </div>
    );
};

export default WeatherSummary;