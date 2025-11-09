# CountryAirportSelector Component

## Overview

The `CountryAirportSelector` is a reusable React component that provides a two-step selection interface for choosing airports. Users first select a country, which then filters the available airports to only those within that country. This component supports searching airports by country name or code and can be styled for different use cases.

## Features

- **Two-step selection**: Country first, then airport
- **Dynamic filtering**: Airports are filtered based on selected country
- **Search functionality**: Optional search for airports (shown when > 10 airports)
- **Grouped display**: Airports can be grouped by country in dropdowns
- **Flexible styling**: Supports both compact and standard modes
- **Icon support**: Optional icons for visual enhancement
- **Loading states**: Handles loading states gracefully
- **Accessibility**: Proper labels and disabled states

## Installation

The component is located at `frontend/src/components/CountryAirportSelector.jsx` and can be imported as:

```javascript
import CountryAirportSelector from '../components/CountryAirportSelector';
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | string | No | - | Label displayed above the selector |
| `selectedCountry` | string | Yes | - | Currently selected country |
| `onCountryChange` | function | Yes | - | Callback when country changes |
| `selectedAirport` | string | Yes | - | Currently selected airport ID |
| `onAirportChange` | function | Yes | - | Callback when airport changes |
| `countryPlaceholder` | string | No | 'Select country' | Placeholder for country dropdown |
| `airportPlaceholder` | string | No | 'Select airport' | Placeholder for airport dropdown |
| `disabled` | boolean | No | false | Whether the selector is disabled |
| `className` | string | No | '' | Additional CSS classes |
| `showIcons` | boolean | No | false | Whether to show icons |
| `iconSrc` | string | No | null | Icon source path |

## Usage Examples

### Basic Usage (Admin Pages)

```javascript
import { useState } from 'react';
import CountryAirportSelector from '../components/CountryAirportSelector';

function AdminFlightForm() {
  const [departureCountry, setDepartureCountry] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');

  return (
    <CountryAirportSelector
      label="From"
      selectedCountry={departureCountry}
      onCountryChange={(country) => {
        setDepartureCountry(country);
        setDepartureAirport(''); // Reset airport when country changes
      }}
      selectedAirport={departureAirport}
      onAirportChange={(airportId) => {
        setDepartureAirport(airportId);
      }}
      countryPlaceholder="Select departure country"
      airportPlaceholder="Select departure airport"
    />
  );
}
```

### Compact Mode with Icons (User-Facing Pages)

```javascript
import { useState } from 'react';
import CountryAirportSelector from '../components/CountryAirportSelector';

function FlightSearchForm() {
  const [departureCountry, setDepartureCountry] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');

  return (
    <CountryAirportSelector
      selectedCountry={departureCountry}
      onCountryChange={(country) => {
        setDepartureCountry(country);
        setDepartureAirport('');
      }}
      selectedAirport={departureAirport}
      onAirportChange={(airportId) => {
        setDepartureAirport(airportId);
      }}
      countryPlaceholder="Select departure country"
      airportPlaceholder="Select departure airport"
      showIcons={true}
      iconSrc="/icons/departure-icon.svg"
      className="country-airport-selector-flights"
    />
  );
}
```

### With Form Integration

```javascript
import { useState } from 'react';
import CountryAirportSelector from '../components/CountryAirportSelector';

function BookingForm() {
  const [formData, setFormData] = useState({
    fromAirport: '',
    toAirport: ''
  });
  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCountry, setArrivalCountry] = useState('');

  return (
    <form>
      <CountryAirportSelector
        label="Departure"
        selectedCountry={departureCountry}
        onCountryChange={(country) => {
          setDepartureCountry(country);
          setFormData(prev => ({ ...prev, fromAirport: '' }));
        }}
        selectedAirport={formData.fromAirport}
        onAirportChange={(airportId) => {
          setFormData(prev => ({ ...prev, fromAirport: airportId }));
        }}
      />

      <CountryAirportSelector
        label="Arrival"
        selectedCountry={arrivalCountry}
        onCountryChange={(country) => {
          setArrivalCountry(country);
          setFormData(prev => ({ ...prev, toAirport: '' }));
        }}
        selectedAirport={formData.toAirport}
        onAirportChange={(airportId) => {
          setFormData(prev => ({ ...prev, toAirport: airportId }));
        }}
      />
    </form>
  );
}
```

## Styling Modes

### Standard Mode (Default)

Used in admin pages and forms where more space is available:
- Full-size dropdowns with borders
- Labels displayed above selectors
- Search input shown when > 10 airports
- Padding and spacing optimized for forms

### Compact Mode

Used in user-facing pages with limited space:
- Transparent background dropdowns
- Smaller text and spacing
- No search input
- Optimized for inline display

To enable compact mode, add the class `country-airport-selector-flights` to the `className` prop.

## API Integration

The component automatically fetches airport data from:
```
GET http://localhost:8080/api/v1/airports
```

Expected response format:
```json
{
  "success": true,
  "data": [
    {
      "airport_id": 1,
      "airport_name": "Suvarnabhumi Airport",
      "city_name": "Bangkok",
      "iata_code": "BKK",
      "country_name": "Thailand"
    }
  ]
}
```

## State Management

The component manages its own internal state for:
- Countries list
- Airports list
- Filtered airports
- Loading states
- Search term

Parent components must manage:
- Selected country
- Selected airport

This separation allows for flexible integration with different state management patterns (useState, useReducer, Redux, etc.).

## Behavior

1. **Initial Load**: Fetches all airports and extracts unique countries
2. **Country Selection**: 
   - Filters airports to show only those in selected country
   - Resets airport selection
   - Shows airport dropdown
3. **Airport Selection**: Updates parent component via callback
4. **Search** (Standard mode only): Filters airports by name, city, IATA code, or country
5. **Country Change**: Automatically resets airport selection

## Accessibility

- Proper label associations
- Disabled state support
- Keyboard navigation support
- Screen reader friendly

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- React 18+
- CSS3

## Performance Considerations

- Airports are fetched once on mount
- Filtering is done client-side for fast response
- Search is debounced (if implemented)
- Memoization can be added for large datasets

## Future Enhancements

Potential improvements:
- Add debounced search
- Support for multiple airport selection
- Virtual scrolling for large airport lists
- Caching of airport data
- Support for airport codes in search
- Internationalization (i18n) support

## Troubleshooting

### Airports not loading
- Check API endpoint is accessible
- Verify response format matches expected structure
- Check browser console for errors

### Country not filtering airports
- Ensure `country_name` field exists in airport data
- Verify country names match exactly (case-sensitive)

### Styling issues
- Check if `className` prop is being applied correctly
- Verify Tailwind CSS classes are available
- Check for CSS conflicts

## Related Components

- `Navbar`: Navigation component
- `Filter`: Flight filter component
- Other form components in the application

## License

Part of the Jett3 Airlines application.
