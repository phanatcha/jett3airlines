import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CountryAirportSelector = ({
  label,
  selectedCountry,
  onCountryChange,
  selectedAirport,
  onAirportChange,
  countryPlaceholder = 'Select country',
  airportPlaceholder = 'Select airport',
  disabled = false,
  className = '',
  showIcons = false,
  iconSrc = null
}) => {
  const [countries, setCountries] = useState([]);
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

 
  useEffect(() => {
    fetchCountriesAndAirports();
  }, []);

  
  useEffect(() => {
    filterAirports();
  }, [selectedCountry, airports, searchTerm]);

  const fetchCountriesAndAirports = async () => {
    try {
      setIsLoadingCountries(true);
      setIsLoadingAirports(true);
      
      const response = await fetch('http://localhost:8080/api/v1/airports');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAirports(result.data);
        
        
        const uniqueCountries = [...new Set(result.data.map(airport => airport.country_name))];
        setCountries(uniqueCountries.sort());
      }
    } catch (error) {
      console.error('Error fetching countries and airports:', error);
    } finally {
      setIsLoadingCountries(false);
      setIsLoadingAirports(false);
    }
  };

  const filterAirports = () => {
    let filtered = airports;
    
    
    if (selectedCountry) {
      filtered = filtered.filter(airport => airport.country_name === selectedCountry);
    }
    
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(airport => 
        airport.airport_name.toLowerCase().includes(search) ||
        airport.city_name.toLowerCase().includes(search) ||
        airport.iata_code.toLowerCase().includes(search) ||
        airport.country_name.toLowerCase().includes(search)
      );
    }
    
    setFilteredAirports(filtered);
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    onCountryChange(country);
    onAirportChange('');
    setSearchTerm('');
  };

  const handleAirportChange = (e) => {
    const airportId = e.target.value;
    onAirportChange(airportId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const groupedAirports = filteredAirports.reduce((acc, airport) => {
    const country = airport.country_name;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(airport);
    return acc;
  }, {});


  const isCompactMode = className.includes('country-airport-selector-flights');
  

  const selectBaseClass = isCompactMode 
    ? "w-full bg-transparent outline-none text-sm"
    : "w-full px-4 py-3 rounded-lg border-2 border-black text-lg focus:outline-none focus:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`country-airport-selector ${className}`}>
      {label && !isCompactMode && (
        <label className="block text-black text-base font-semibold mb-2">
          {label}
        </label>
      )}
      
      <div className={isCompactMode ? "space-y-0" : "space-y-3"}>
        <div className={`flex items-center ${isCompactMode ? 'space-x-2 mb-2' : 'space-x-2'}`}>
          {showIcons && iconSrc && (
            <img
              src={iconSrc}
              alt={`${label} Icon`}
              className="w-5 h-5 text-gray-500"
            />
          )}
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={disabled || isLoadingCountries}
            className={selectBaseClass}
          >
            <option value="">{countryPlaceholder}</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>


        {selectedCountry && (
          <div className={isCompactMode ? "pl-7" : "pl-7"}>
            {/* Optional search input for airports */}
            {!isCompactMode && filteredAirports.length > 10 && (
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search airports..."
                className="w-full px-4 py-2 mb-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary-300"
              />
            )}
            
            <select
              value={selectedAirport}
              onChange={handleAirportChange}
              disabled={disabled || isLoadingAirports}
              className={selectBaseClass}
            >
              <option value="">{airportPlaceholder}</option>
              

              {!selectedCountry && Object.keys(groupedAirports).length > 0 ? (
                Object.keys(groupedAirports).sort().map((country) => (
                  <optgroup key={country} label={country}>
                    {groupedAirports[country].map((airport) => (
                      <option key={airport.airport_id} value={airport.airport_id}>
                        {isCompactMode 
                          ? `${airport.city_name} - ${airport.airport_name} (${airport.iata_code})`
                          : `${airport.iata_code} - ${airport.city_name} - ${airport.airport_name}`
                        }
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (

                filteredAirports.map((airport) => (
                  <option key={airport.airport_id} value={airport.airport_id}>
                    {isCompactMode 
                      ? `${airport.city_name} - ${airport.airport_name} (${airport.iata_code})`
                      : `${airport.iata_code} - ${airport.city_name} - ${airport.airport_name}`
                    }
                  </option>
                ))
              )}
            </select>
            
            {!isCompactMode && filteredAirports.length === 0 && selectedCountry && (
              <p className="text-sm text-gray-500 mt-2">
                No airports found {searchTerm && `matching "${searchTerm}"`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CountryAirportSelector.propTypes = {
  label: PropTypes.string,
  selectedCountry: PropTypes.string.isRequired,
  onCountryChange: PropTypes.func.isRequired,
  selectedAirport: PropTypes.string.isRequired,
  onAirportChange: PropTypes.func.isRequired,
  countryPlaceholder: PropTypes.string,
  airportPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  showIcons: PropTypes.bool,
  iconSrc: PropTypes.string
};

export default CountryAirportSelector;
