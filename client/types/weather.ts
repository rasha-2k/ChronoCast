import { DateObject } from "react-multi-date-picker";
import {
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudSnow,
  CloudRainWind,
  CloudHail,
  CloudLightning
} from 'lucide-react';

export { Cloud };

// Location type
export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

// Forecast type
export type ForecastType = 'daily' | 'hourly' | 'current';

// Weather variable
export interface WeatherVariable {
  id: string;
  name: string;
  group: ForecastType;
}

// Weather dashboard props
export interface WeatherDashboardProps {
  initialLocation?: Location | null;
  hideLocationSelector?: boolean;
  onDataLoaded?: (data: any) => void;
  dateValues?: (DateObject | string | Date | null)[];
  onDateValidation?: (error: string | null) => void;
  initialForecastType?: ForecastType;
}

export interface WeatherRequestParams {
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

export const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || "Unknown";
}

export function getWeatherIcon(code: number): any {
  if (code === 0) return Sun;                    // Clear sky
  if (code === 1) return CloudSun;               // Mainly clear
  if (code === 2) return Cloud;                  // Partly cloudy
  if (code === 3) return Cloudy;                 // Overcast
  if (code === 45 || code === 48) return CloudFog; // Fog & Depositing rime fog
  if (code >= 51 && code <= 55) return CloudDrizzle; // Light to dense drizzle
  if (code === 56 || code === 57) return CloudDrizzle; // Freezing drizzle
  if (code >= 61 && code <= 65) return CloudRain; // Slight to heavy rain
  if (code === 66 || code === 67) return CloudRain; // Freezing rain
  if (code >= 71 && code <= 75) return CloudSnow; // Slight to heavy snow fall
  if (code === 77) return Snowflake;             // Snow grains
  if (code >= 80 && code <= 82) return CloudRainWind; // Rain showers
  if (code === 85 || code === 86) return CloudSnow;   // Snow showers
  if (code === 95) return CloudLightning;        // Thunderstorm
  if (code === 96 || code === 99) return CloudHail; // Thunderstorm with hail
  return Cloud;
}