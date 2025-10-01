import { CloudRain, Sun, Wind, Droplets, Thermometer, Cloudy, Smile, Snowflake, Flame, CloudFog } from "lucide-react";

export type EventType =
  | "Temperature"
  | "Precipitation"
  | "Wind"
  | "Humidity"
  | "Cloud"
  | "Air Quality"
  | "Comfort";

export function EventTypeIcon({ name, type, className }: { name?: string; type?: EventType; className?: string }) {
  // Prefer name-based matching for specificity
  const n = (name ?? "").toLowerCase();
  if (n) {
    if (/cold|arctic|frost|freeze|snow|ice/.test(n)) return <Snowflake className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/heat|hot|scorch|record heat|heat wave|advisory/.test(n)) return <Flame className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/rain|shower|drizzle|monsoon/.test(n)) return <CloudRain className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/wind|gust|breeze/.test(n)) return <Wind className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/humidity|humid|sticky/.test(n)) return <Droplets className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/overcast|cloud/.test(n)) return <Cloudy className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/dust|haze|smoke|air quality|\baq\b/.test(n)) return <CloudFog className={`event-type-icon ${className ?? ""}`.trim()} />;
    if (/comfort|pleasant|park|mild/.test(n)) return <Smile className={`event-type-icon ${className ?? ""}`.trim()} />;
  }

  // Fallback to type-based mapping
  const byType = {
    Temperature: Thermometer,
    Precipitation: CloudRain, // express rain more clearly
    Wind: Wind,
    Humidity: Droplets,
    Cloud: Cloudy,
    "Air Quality": CloudFog,
    Comfort: Smile,
  } as const;
  const FallbackIcon = (type && byType[type]) || Thermometer;
  return <FallbackIcon className={`event-type-icon ${className ?? ""}`.trim()} />;
}
