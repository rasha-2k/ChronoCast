import React from 'react';
import { Calendar, Clock, Sun } from 'lucide-react';
import { ForecastType } from '@/types/weather';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ForecastTypeSelectorProps {
    forecastType: ForecastType;
    onChange: (type: ForecastType) => void;
}

const ForecastTypeSelector: React.FC<ForecastTypeSelectorProps> = ({ forecastType, onChange }) => {
    const forecastOptions = [
        {
            id: 'daily',
            label: 'Daily Forecast',
            icon: Calendar,
            description: 'View weather forecast data for each day'
        },
        {
            id: 'hourly',
            label: 'Hourly Forecast',
            icon: Clock,
            description: 'View detailed hour-by-hour weather forecast'
        },
        {
            id: 'current',
            label: 'Current Weather',
            icon: Sun,
            description: 'View current weather conditions'
        }
    ];

    return (
        <div className="forecast-type-selector">
            <h3 className="text-sm font-semibold mb-2">Forecast Type</h3>

            <div className="forecast-radio-group">
                <TooltipProvider>
                    {forecastOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = forecastType === option.id;

                        return (
                            <div key={option.id} className={`forecast-radio-option ${isSelected ? 'selected' : ''}`}>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <input
                                                type="radio"
                                                id={`forecast-${option.id}`}
                                                name="forecast-type"
                                                value={option.id}
                                                checked={isSelected}
                                                onChange={() => onChange(option.id as ForecastType)}
                                                className="forecast-radio-input"
                                            />
                                            <label
                                                htmlFor={`forecast-${option.id}`}
                                                className={cn(
                                                    "forecast-radio-label",
                                                    isSelected && "selected"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "forecast-option-icon",
                                                    isSelected && "text-primary"
                                                )} />
                                                <span>{option.label}</span>
                                            </label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        align="center"
                                        className="cc-tooltip-content"
                                    >
                                        <p>{option.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        );
                    })}
                </TooltipProvider>
            </div>
        </div>
    );
};

export default ForecastTypeSelector;