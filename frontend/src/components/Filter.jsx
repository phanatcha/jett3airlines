import React from "react";

const Filter = () => {
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
            <p className="text-gray-500 text-sm mb-4">40 results</p>


          <div className="space-y-6">
            {/* Stops */}
            <div>
              <h4 className="font-medium mb-2">Stops</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="stops" defaultChecked />
                  <span>Any</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="stops" />
                  <span>1 stop max</span>
                </label>
              </div>
            </div>

            {/* Flight Times */}
            <div>
              <h4 className="font-medium mb-2">Flight times</h4>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Departure Time</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                  <label><input type="checkbox" /> 12AM – 5:59AM</label>
                  <label><input type="checkbox" /> 6AM – 11:59AM</label>
                  <label><input type="checkbox" /> 12PM – 5:59PM</label>
                  <label><input type="checkbox" /> 6PM – 11:59PM</label>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Arrival Time</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                  <label><input type="checkbox" /> 12AM – 5:59AM</label>
                  <label><input type="checkbox" /> 6AM – 11:59AM</label>
                  <label><input type="checkbox" /> 12PM – 5:59PM</label>
                  <label><input type="checkbox" /> 6PM – 11:59PM</label>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default Filter;
