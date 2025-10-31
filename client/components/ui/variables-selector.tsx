import React from 'react';
import { Check, Info } from 'lucide-react';
import { WeatherVariable } from '@/types/weather';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VariablesSelectorProps {
  variables: WeatherVariable[];
  selectedVariables: string[];
  onSelectVariables: (variables: string[]) => void;
}

const VariablesSelector: React.FC<VariablesSelectorProps> = ({ 
  variables, 
  selectedVariables, 
  onSelectVariables 
}) => {
  const handleCheckboxChange = (variableId: string) => {
    if (selectedVariables.includes(variableId)) {
      onSelectVariables(selectedVariables.filter(id => id !== variableId));
    } else {
      onSelectVariables([...selectedVariables, variableId]);
    }
  };

  const handleSelectAll = () => {
    onSelectVariables(variables.map(v => v.id));
  };

  const handleSelectDefault = () => {
    const defaultVariables = variables
      .filter(v => 
        v.id.includes('temperature') || 
        v.id.includes('precipitation') || 
        v.id === 'weather_code'
      )
      .map(v => v.id);
    
    onSelectVariables(defaultVariables.length > 0 ? defaultVariables : variables.slice(0, 3).map(v => v.id));
  };

  const handleClearAll = () => {
    onSelectVariables([]);
  };

  const getVariableTooltip = (variableId: string): string => {
    const tooltips: Record<string, string> = {
      'temperature_2m': 'Current temperature at 2 meters above ground',
      'temperature_2m_max': 'Maximum temperature during the day',
      'temperature_2m_min': 'Minimum temperature during the day',
      'precipitation': 'Precipitation amount in mm',
      'precipitation_sum': 'Total precipitation for the day',
      'weather_code': 'WMO weather code describing current conditions',
      'relative_humidity_2m': 'Relative humidity at 2 meters above ground',
      'wind_speed_10m': 'Wind speed at 10 meters above ground',
      'wind_direction_10m': 'Wind direction at 10 meters above ground',
      'cloud_cover': 'Percentage of sky covered by clouds',
      'visibility': 'Horizontal visibility in meters',
      'uv_index': 'UV index (0-11+) indicating sunburn risk',
      'uv_index_max': 'Maximum UV index during the day',
      'sunrise': 'Time of sunrise',
      'sunset': 'Time of sunset',
      'wind_gusts_10m_max': 'Maximum wind gusts during the day',
      'precipitation_probability_max': 'Maximum probability of precipitation'
    };
    
    return tooltips[variableId] || 'Weather variable data';
  };

  return (
    <div className="variables-selector">
      <div className="variables-header">
        <h3 className="text-sm font-semibold">Weather Variables</h3>
        <div className="variables-actions">
          <button onClick={handleSelectAll} className="variables-action-button">
            Select All
          </button>
          <button onClick={handleSelectDefault} className="variables-action-button">
            Default
          </button>
          <button onClick={handleClearAll} className="variables-action-button">
            Clear
          </button>
        </div>
      </div>
      
      <div className="variables-list">
        <TooltipProvider>
          {variables.map((variable) => (
            <div key={variable.id} className="variable-checkbox-container">
              <input
                type="checkbox"
                id={`var-${variable.id}`}
                checked={selectedVariables.includes(variable.id)}
                onChange={() => handleCheckboxChange(variable.id)}
                className="variable-checkbox"
              />
              <label htmlFor={`var-${variable.id}`} className="variable-label">
                <div className="checkbox-custom">
                  {selectedVariables.includes(variable.id) && <Check className="checkbox-icon" />}
                </div>
                <span className="variable-name text-xs sm:text-sm">{variable.name}</span>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info size={14} className="variable-info-icon ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="forecast-tooltip max-w-xs"
                  >
                    <p>{getVariableTooltip(variable.id)}</p>
                  </TooltipContent>
                </Tooltip>
              </label>
            </div>
          ))}
        </TooltipProvider>
      </div>
      
      {variables.length === 0 && (
        <div className="variables-empty">
          <p>No variables available for this forecast type</p>
        </div>
      )}
      
      {selectedVariables.length > 0 && (
        <div className="variables-summary">
          <p className="text-xs text-muted-foreground">
            {selectedVariables.length} variable{selectedVariables.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default VariablesSelector;