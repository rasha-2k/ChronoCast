import { Thermometer, RefreshCcw } from 'lucide-react';
import { ForecastType, WeatherVariable } from '@/types/weather';

export const DASHBOARD_KPIS = [
  { t: "Risk Index", v: "75%", icon: Thermometer, c: "text-emerald-300" },
  { t: "Space Weather", v: "M-Class", icon: Thermometer, c: "text-fuchsia-300" },
  { t: "Updated", v: "2 min ago", icon: RefreshCcw, c: "text-amber-300" },
];

export const MOCK_NASA_IMAGE = {
  title: "Aurora Over Earth from ISS",
  url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop",
  description: "Beautiful aurora captured from the International Space Station",
};

export const PLACEHOLDER_ITEMS = [
  "Weather gear",
  "Protective items",
  "Comfort accessories",
  "Safety equipment"
];

export const VARIABLES_GROUPS: Record<ForecastType, WeatherVariable[]> = {
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