import { WeatherForecastResponse } from '@shared/api';
import { getWeatherDescription, getWeatherIcon } from '@/types/weather';

interface WeatherRequestParams {
    latitude: number;
    longitude: number;
    daily?: string[];
    hourly?: string[];
    current?: string[];
    forecast_days?: number;
    start_date?: string;
    end_date?: string;
    temperature_unit?: string;
    timezone?: string;
}

class WeatherService {
    private baseUrl = 'https://api.open-meteo.com/v1/forecast';

    async getForecast(params: WeatherRequestParams): Promise<WeatherForecastResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append('latitude', params.latitude.toString());
        queryParams.append('longitude', params.longitude.toString());

        if (params.daily && params.daily.length > 0) {
            queryParams.append('daily', params.daily.join(','));
        }

        if (params.hourly && params.hourly.length > 0) {
            queryParams.append('hourly', params.hourly.join(','));
        }

        if (params.current && params.current.length > 0) {
            queryParams.append('current', params.current.join(','));
        }

        if (params.forecast_days) {
            queryParams.append('forecast_days', params.forecast_days.toString());
        }

        if (params.start_date) {
            queryParams.append('start_date', params.start_date);
        }

        if (params.end_date) {
            queryParams.append('end_date', params.end_date);
        }

        if (params.temperature_unit) {
            queryParams.append('temperature_unit', params.temperature_unit);
        }

        if (params.timezone) {
            queryParams.append('timezone', params.timezone);
        } else {
            queryParams.append('timezone', 'auto');
        }

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        return await response.json() as WeatherForecastResponse;
    }

    getWeatherDescription(code: number): string {
        return getWeatherDescription(code);
    }

    getWeatherIcon(code: number): any {
        return getWeatherIcon(code);
    }

    getWeatherTheme(code: number): { background: string; text: string; accent: string } {
        const themes: Record<number, { background: string; text: string; accent: string }> = {
            0: { background: "bg-yellow-50", text: "text-yellow-900", accent: "text-yellow-600" }, // Clear sky
            1: { background: "bg-blue-50", text: "text-blue-900", accent: "text-blue-600" }, // Mainly clear
            2: { background: "bg-gray-50", text: "text-gray-900", accent: "text-gray-600" }, // Partly cloudy
            3: { background: "bg-gray-100", text: "text-gray-900", accent: "text-gray-600" }, // Overcast
            45: { background: "bg-gray-200", text: "text-gray-800", accent: "text-gray-500" }, // Fog
            48: { background: "bg-gray-200", text: "text-gray-800", accent: "text-gray-500" }, // Depositing rime fog
            51: { background: "bg-blue-100", text: "text-blue-900", accent: "text-blue-600" }, // Light drizzle
            53: { background: "bg-blue-100", text: "text-blue-900", accent: "text-blue-600" }, // Moderate drizzle
            55: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Dense drizzle
            56: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Light freezing drizzle
            57: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Dense freezing drizzle
            61: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Slight rain
            63: { background: "bg-blue-300", text: "text-blue-900", accent: "text-blue-800" }, // Moderate rain
            65: { background: "bg-blue-400", text: "text-blue-100", accent: "text-blue-200" }, // Heavy rain
            66: { background: "bg-blue-300", text: "text-blue-900", accent: "text-blue-800" }, // Light freezing rain
            67: { background: "bg-blue-400", text: "text-blue-100", accent: "text-blue-200" }, // Heavy freezing rain
            71: { background: "bg-blue-100", text: "text-blue-900", accent: "text-blue-600" }, // Slight snow fall
            73: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Moderate snow fall
            75: { background: "bg-blue-300", text: "text-blue-900", accent: "text-blue-800" }, // Heavy snow fall
            77: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Snow grains
            80: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Slight rain showers
            81: { background: "bg-blue-300", text: "text-blue-900", accent: "text-blue-800" }, // Moderate rain showers
            82: { background: "bg-blue-400", text: "text-blue-100", accent: "text-blue-200" }, // Violent rain showers
            85: { background: "bg-blue-200", text: "text-blue-900", accent: "text-blue-700" }, // Slight snow showers
            86: { background: "bg-blue-300", text: "text-blue-900", accent: "text-blue-800" }, // Heavy snow showers
            95: { background: "bg-purple-200", text: "text-purple-900", accent: "text-purple-700" }, // Thunderstorm
            96: { background: "bg-purple-300", text: "text-purple-900", accent: "text-purple-800" }, // Thunderstorm with slight hail
            99: { background: "bg-purple-400", text: "text-purple-100", accent: "text-purple-200" }, // Thunderstorm with heavy hail
        };

        return themes[code] || { background: "bg-gray-100", text: "text-gray-900", accent: "text-gray-600" };
    }
}

export default WeatherService;