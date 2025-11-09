const Filter = ({ filters, onFilterChange, resultsCount }) => {
  const handleStopsChange = (value) => {
    onFilterChange('maxStops', value);
  };

  const handleDepartureTimeChange = (timeRange, checked) => {
    const currentTimes = filters.departureTimeRanges || [];
    const newTimes = checked
      ? [...currentTimes, timeRange]
      : currentTimes.filter(t => t !== timeRange);
    onFilterChange('departureTimeRanges', newTimes);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, parseFloat(value) || 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <img
          src="/icons/filter-icon.svg"
          alt="filter icon"
          className="w-5 h-5 object-contain"
        />
        <span className="font-semibold text-lg">Filter</span>
      </div>
      <p className="text-gray-500 text-sm mb-4">{resultsCount} results</p>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Min Price (USD)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice || 0}
                onChange={handlePriceChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Max Price (USD)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice || 100000}
                onChange={handlePriceChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Stops */}
        <div>
          <h4 className="font-medium mb-2">Stops</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="stops"
                checked={filters.maxStops === 'any'}
                onChange={() => handleStopsChange('any')}
              />
              <span>Any</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="stops"
                checked={filters.maxStops === '0'}
                onChange={() => handleStopsChange('0')}
              />
              <span>Direct flights only</span>
            </label>
          </div>
        </div>

        {/* Flight Times */}
        <div>
          <h4 className="font-medium mb-2">Departure Time</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.departureTimeRanges || []).includes('night')}
                onChange={(e) => handleDepartureTimeChange('night', e.target.checked)}
              />
              <span>12AM – 5:59AM (Night)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.departureTimeRanges || []).includes('morning')}
                onChange={(e) => handleDepartureTimeChange('morning', e.target.checked)}
              />
              <span>6AM – 11:59AM (Morning)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.departureTimeRanges || []).includes('afternoon')}
                onChange={(e) => handleDepartureTimeChange('afternoon', e.target.checked)}
              />
              <span>12PM – 5:59PM (Afternoon)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.departureTimeRanges || []).includes('evening')}
                onChange={(e) => handleDepartureTimeChange('evening', e.target.checked)}
              />
              <span>6PM – 11:59PM (Evening)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
