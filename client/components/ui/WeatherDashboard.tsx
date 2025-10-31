import { AlertTriangle, CloudSun } from "lucide-react";
import { VariablesSelector, WeatherSummary } from "@/components/ui";
import { ForecastType, WeatherVariable } from "@/types/weather";
import { WeatherForecastResponse } from "@shared/api";

interface WeatherDashboardProps {
    weatherData: WeatherForecastResponse | null;
    weatherError: string | null;
    loading: boolean;
    forecastType: ForecastType;
    temperatureUnit: 'celsius' | 'fahrenheit';
    selectedVariables: string[];
    variablesGroups: Record<ForecastType, WeatherVariable[]>;
    hasLocation: boolean;
    onToggleUnit: (unit: 'celsius' | 'fahrenheit') => void;
    onSelectVariables: (variables: string[]) => void;
    onRetry: () => void;
}

export const WeatherDashboard = ({
    weatherData,
    weatherError,
    loading,
    forecastType,
    temperatureUnit,
    selectedVariables,
    variablesGroups,
    hasLocation,
    onToggleUnit,
    onSelectVariables,
    onRetry
}: WeatherDashboardProps) => (
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
                <div className="error-icon">
                    <AlertTriangle className="h-12 w-12" />
                </div>
                <p>{weatherError}</p>
                <button onClick={onRetry} className="retry-button">
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
                <div className="empty-icon">
                    <CloudSun className="h-12 w-12" />
                </div>
                <p>
                    {!hasLocation
                        ? "Select a location to view weather forecast"
                        : "Select forecast options above"}
                </p>
            </div>
        )}
    </div>
);