import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeSelectorProps {
  onDateRangeChange: (dateRange: DateRange) => void;
  availableDateRanges?: DateRange[];
  selectedRange?: DateRange;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onDateRangeChange,
  availableDateRanges = [],
  selectedRange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Last 7 Days');
  const [isCustom, setIsCustom] = useState(false);
  const [startDate, setStartDate] = useState(selectedRange?.startDate || '');
  const [endDate, setEndDate] = useState(selectedRange?.endDate || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Predefined date range options (optimized for better performance)
  const predefinedRanges = [
    {
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last 14 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 14);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize with default range
  useEffect(() => {
    if (!selectedRange && !startDate && !endDate) {
      const defaultRange = predefinedRanges.find(range => range.label === selectedOption);
      if (defaultRange) {
        const range = defaultRange.getValue();
        setStartDate(range.startDate);
        setEndDate(range.endDate);
      }
    }
  }, []);

  // Update parent when dates change
  useEffect(() => {
    if (startDate && endDate) {
      onDateRangeChange({ startDate, endDate });
    }
  }, [startDate, endDate, onDateRangeChange]);

  const handlePredefinedRangeSelect = (option: string) => {
    const range = predefinedRanges.find(r => r.label === option);
    if (range) {
      const rangeValue = range.getValue();
      setStartDate(rangeValue.startDate);
      setEndDate(rangeValue.endDate);
      setSelectedOption(option);
      setIsCustom(false);
      setIsOpen(false);
    }
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setSelectedOption('Custom');
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (isCustom && startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    return selectedOption;
  };

  // Calculate available date range from imported data
  const getAvailableDataRange = () => {
    if (availableDateRanges.length === 0) return null;
    
    const allDates = availableDateRanges.flatMap(range => [
      new Date(range.startDate),
      new Date(range.endDate)
    ]);
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  const availableDataRange = getAvailableDataRange();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="truncate max-w-[200px]">{getDisplayText()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            {/* Predefined Options */}
            <div className="space-y-1 mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Predefined Ranges</p>
              {predefinedRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handlePredefinedRangeSelect(range.label)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                    selectedOption === range.label && !isCustom
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Range Option */}
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={handleCustomSelect}
                className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors mb-2 ${
                  isCustom
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Custom Range
              </button>

              {/* Custom Date Inputs */}
              {isCustom && (
                <div className="space-y-2 px-3 py-2 bg-gray-50 rounded-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={availableDataRange?.min}
                      max={availableDataRange?.max}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || availableDataRange?.min}
                      max={availableDataRange?.max}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Available Data Range Info */}
            {availableDataRange && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs">📊</span>
                  <span className="text-xs font-medium text-gray-600">Available Data</span>
                </div>
                <p className="text-xs text-gray-500">
                  {availableDataRange.min} to {availableDataRange.max}
                </p>
              </div>
            )}

            {/* Data Coverage Warning */}
            {startDate && endDate && availableDataRange && 
             (startDate < availableDataRange.min || endDate > availableDataRange.max) && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-800">Partial Coverage</span>
                </div>
                <p className="text-yellow-700 mt-1">
                  Selected range extends beyond available data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;