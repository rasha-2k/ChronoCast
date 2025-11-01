import React from 'react';
import { AlertTriangle, CloudSun } from 'lucide-react';
import { VariablesSelector, WeatherSummary } from '@/components/ui';
import { ForecastType, WeatherVariable } from '@/types/weather';

interface WeatherDashboardProps {
    loading: boolean;
    weatherError: string | null;
    weatherData: any;
    forecastType: ForecastType;
    temperatureUnit: 'celsius' | 'fahrenheit';
    selectedVariables: string[];
    selectedCoordinates: { lat: number; lng: number } | null;
    variablesGroups: Record<ForecastType, WeatherVariable[]>;
    onSelectVariables: (variables: string[]) => void;
    onToggleUnit: (unit: 'celsius' | 'fahrenheit') => void;
    onRetry: () => void;
}

export const WeatherDashboardComponent: React.FC<WeatherDashboardProps> = ({
    loading,
    weatherError,
    weatherData,
    forecastType,
    temperatureUnit,
    selectedVariables,
    selectedCoordinates,
    variablesGroups,
    onSelectVariables,
    onToggleUnit,
    onRetry
}) => {
    return (
        <div className="cc-dashboard-weather">
            <div className="weather-dashboard-controls">
                <div className="weather-controls-container">
                    <VariablesSelector
                        variables={variablesGroups[forecastType]}
                        selectedVariables={selectedVariables}
                        onSelectVariables={onSelectVariables}
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
                        onClick={onRetry}
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
                        onToggleUnit={onToggleUnit}
                    />
                </div>
            ) : (
                <div className="weather-dashboard-empty">
                    <div className="empty-icon"><CloudSun className="h-12 w-12" /></div>
                    <p>{!selectedCoordinates ? "Select a location to view weather forecast" : "Select forecast options above"}</p>
                </div>
            )}
        </div>
    );
};