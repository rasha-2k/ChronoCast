import { useState, useEffect, useMemo } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css"
import mockEventsData from "../data/mockEvents.json";
import { AppLayout } from "@/components/layout/Layout";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SeverityBadge, SeverityLevel } from "@/components/common/SeverityBadge";
import { EventTypeIcon, EventType } from "@/components/icons/EventTypeIcon";
import EventMap from "@/components/common/EventMap";
import { Calendar, MapPin, RefreshCcw, Thermometer, Flag, Umbrella, Shield, Glasses, Package } from "lucide-react";
import { Boot, FanBold, Jacket as JacketIcon, WaterBottle, Gloves as GlovesIcon, Scarf, Raincoat as RaincoatIcon, RunningShoes, WinterHat, BilledCap as Cap, Poncho, ShieldSunOutline, SunglassesFill as Sunglasses, SleevelessJacket, Camera, TShirtBold, CoatLine, MonclerJacket, TwotoneMasks as Mask } from "@/components/icons/custom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";

export interface AppEvent {
  id: number;
  type: EventType;
  name: string;
  probability: number;
  severity: SeverityLevel;
  location: { lat: number; lng: number };
  date: string;
  description: string;
  suggestedItems?: string[];
}

interface ProbabilityData {
  date: string;
  probability: number;
}

// Use imported mockEventsData as the events source

const mockProbabilityData: ProbabilityData[] = [
  { date: "09-20", probability: 45 },
  { date: "09-21", probability: 52 },
  { date: "09-22", probability: 48 },
  { date: "09-23", probability: 75 },
  { date: "09-24", probability: 68 },
  { date: "09-25", probability: 85 },
  { date: "09-26", probability: 72 },
];

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

  // Default icon for unmatched items
  return Package;
};

const placeholderItems = [
  "Weather gear",
  "Protective items",
  "Comfort accessories",
  "Safety equipment"
];

export default function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [values, setValues] = useState<(DateObject | string | Date | null)[]>([
    new DateObject().subtract(4, "days"),
    new DateObject().add(4, "days"),
  ]);
  const [selectedLocation, setSelectedLocation] = useState<string>("Global");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [mapSelectedEvent, setMapSelectedEvent] = useState<AppEvent | null>(null);

  const typeToCategory = useMemo(() => ({
    "Temperature": "Temperature",
    "Wind": "Wind",
    "Precipitation": "Precipitation",
    "Humidity": "Humidity",
    "Cloud": "Cloud",
    "Air Quality": "Air Quality",
    "Comfort": "Comfort",
  } as Record<string, string>), []);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    (mockEventsData as AppEvent[]).forEach((e) => {
      const cat = typeToCategory[e.type] ?? e.type;
      cats.add(cat);
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [typeToCategory]);

  const showLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  useEffect(() => {
    showLoading();
  }, []);

  const filtered = (mockEventsData as AppEvent[])
    .filter((e) => eventFilter === "all" || e.type === (eventFilter as EventType))
    .filter((e) => {
      if (eventFilter !== "all") {
        const cat = typeToCategory[e.type] ?? e.type;
        if (cat !== eventFilter) return false;
      }
      const toYYYYMMDD = (v: DateObject | string | Date) =>
        v instanceof DateObject
          ? v.format("YYYY-MM-DD")
          : new DateObject(v).format("YYYY-MM-DD");

      const picked = (values || []).filter(Boolean) as (DateObject | string | Date)[];
      if (picked.length === 0) return false;
      if (picked.length === 1) {
        const day = toYYYYMMDD(picked[0]);
        return e.date === day;
      }

      const a = toYYYYMMDD(picked[0]);
      const b = toYYYYMMDD(picked[1]);
      const start = a <= b ? a : b;
      const end = a <= b ? b : a;
      return e.date >= start && e.date <= end;
    });

  useEffect(() => {
    setSelectedEvent(null);
    setMapSelectedEvent(null);
  }, [values]);

  const refresh = showLoading;

  const displayedItems = mapSelectedEvent?.suggestedItems || placeholderItems;
  const isPlaceholder = !mapSelectedEvent;

  return (
    <AppLayout>
      <div className="cc-dashboard-page">
        {/* KPIs */}
        <div className="cc-dashboard-kpis">
          {[
            { t: "Risk Index", v: "75%", icon: Thermometer, c: "text-emerald-300" },
            { t: "Events", v: String(mockEventsData.length), icon: Flag, c: "text-blue-300" },
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
                <label className="block text-xs">
                  <span className="mb-1 inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </span>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="dashboard-select"
                  >
                    {[
                      "Global",
                      "Africa",
                      "Antarctica",
                      "Asia",
                      "Europe",
                      "North America",
                      "Oceania",
                      "South America"
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
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
                    format="YYYY-MM-DD"
                    inputClass="dashboard-input"
                    containerStyle={{ width: "100%" }}
                    className="cc-datepicker"
                    arrowClassName="cc-datepicker-arrow"
                    calendarPosition="bottom-center"
                    placeholder="Select date or range"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1">Event Type</span>
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="dashboard-select"
                  >
                    <option value="all">All Events</option>
                    {availableCategories.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Suggested Items Section */}
            <div className="cc-dashboard-suggested-items">
              <h3 className="mb-3 text-sm font-semibold">
                {mapSelectedEvent ? `Suggested items to have for ${mapSelectedEvent.name}` : "Suggested items to have"}
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
              {!mapSelectedEvent && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click on an event on the map to see specific suggestions
                </p>
              )}
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
              <h3 className="mb-3 text-sm font-semibold">Event Map</h3>
              {loading ? (
                <LoadingSkeleton className="h-80 w-full" />
              ) : (
                <div className="h-80 w-full rounded-lg overflow-hidden">
                  <EventMap
                    events={filtered}
                    onEventSelect={(event) => setMapSelectedEvent(event)}
                    onMapClick={() => setMapSelectedEvent(null)}
                    center={(() => {
                      if (selectedLocation === "Global") return undefined;
                      if (selectedLocation === "Africa") return [1.5, 17.5];
                      if (selectedLocation === "Antarctica") return [-82.8628, 135.0000];
                      if (selectedLocation === "Asia") return [34.0479, 100.6197];
                      if (selectedLocation === "Europe") return [54.5260, 15.2551];
                      if (selectedLocation === "North America") return [54.5260, -105.2551];
                      if (selectedLocation === "Oceania") return [-22.7359, 140.0188];
                      if (selectedLocation === "South America") return [-8.7832, -55.4915];
                      return undefined;
                    })()}
                    zoom={selectedLocation === "Global" ? undefined : 3}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="cc-dashboard-probability">
                <h3 className="mb-3 text-sm font-semibold">Probability Forecast</h3>
                {loading ? (
                  <LoadingSkeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={mockProbabilityData}>
                      <CartesianGrid className="cc-chart-grid" />
                      <XAxis
                        dataKey="date"
                        className="cc-chart-axis"
                      />
                      <YAxis
                        className="cc-chart-axis"
                      />
                      <Tooltip
                        wrapperClassName="cc-chart-tooltip"
                        contentStyle={{}}
                        labelStyle={{}}
                        itemStyle={{}}
                      />
                      <Line
                        type="monotone"
                        dataKey="probability"
                        className="cc-chart-line-primary"
                        dot={{ className: "cc-chart-dot-primary" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="cc-dashboard-upcoming">
                <h3 className="mb-3 text-sm font-semibold">Upcoming Events</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <LoadingSkeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <LoadingSkeleton className="mb-2 h-4 w-3/4" />
                          <LoadingSkeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-h-64 space-y-3 pr-1 overflow-y-auto">
                    {filtered.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="dashboard-event-button"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <EventTypeIcon name={e.name} type={e.type as any} className="h-5 w-5" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{e.name}</p>
                            <p className="text-xs text-muted-foreground">{e.date}</p>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="text-xs font-bold">{e.probability}%</span>
                          <SeverityBadge severity={e.severity} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-content">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <EventTypeIcon name={selectedEvent.name} type={selectedEvent.type as any} className="h-6 w-6" />
                <h2 className="truncate text-lg font-bold">{selectedEvent.name}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="dashboard-modal-close"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Probability</span>
                <span className="font-semibold">{selectedEvent.probability}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Severity</span>
                <SeverityBadge severity={selectedEvent.severity} />
              </div>
              <div className="flex items-center justify-between">
                <span>Date</span>
                <span className="font-semibold">{selectedEvent.date}</span>
              </div>
              <div>
                <span className="mb-1 block font-medium">Description</span>
                <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
              </div>
              {selectedEvent.suggestedItems && selectedEvent.suggestedItems.length > 0 && (
                <div>
                  <span className="mb-1 block font-medium">Suggested Items to have</span>
                  <ul className="list-disc ml-5 text-muted-foreground">
                    {selectedEvent.suggestedItems.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
