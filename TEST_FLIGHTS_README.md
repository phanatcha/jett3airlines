# Test Flight Data for Return Flight Page

This document explains how to add test flight data to your database for testing the Return flight selection page.

## Quick Start

Run the PowerShell script to add test flights:

```powershell
.\add-test-flights.ps1
```

This will add flights in both directions (departure and return) to your database.

## What Gets Added

### BKK → BER (Departure Flights)
- **December 10, 2025**: 3 flights at different times (morning, afternoon, night)
- **December 15, 2025**: 3 flights at different times
- **December 20, 2025**: 3 flights at different times

### BER → BKK (Return Flights)
- **December 13, 2025**: 6 flights including delayed and cancelled options
- **December 18, 2025**: 3 flights at different times
- **December 23, 2025**: 3 flights at different times
- **December 25, 2025**: 2 Christmas flights

### Additional Routes
- **BKK ↔ Tokyo (HND)**: 2 flights each direction
- **BKK ↔ Singapore (SIN)**: 2 flights each direction

## Testing the Return Flight Page

1. **Start your backend server**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start your frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test the booking flow**:
   - Go to the Flights search page
   - Search for: **BKK → BER** on **December 10, 2025**
   - Select **Round-trip** with return date **December 13, 2025**
   - Select a departure flight
   - You should now see the Return flight page with multiple return options

## Flight Details

All test flights use:
- **Airplane Types**: Airbus A320-200, ATR 72-600, Airbus A220-300
- **Base Prices**: 2500-2700 THB (from airplane min_price)
- **Flight Duration**: ~8-14 hours (realistic for long-haul)
- **Statuses**: Scheduled, Delayed, Cancelled (for testing different scenarios)

## Manual SQL Execution

If you prefer to run the SQL manually:

```bash
mysql -u root -p jett3_airline < backend/scripts/add-test-flights.sql
```

## Removing Test Flights

To remove the test flights:

```sql
DELETE FROM flight WHERE flight_id BETWEEN 100 AND 199;
```

## Troubleshooting

### No flights showing up?
- Check that your backend is running and connected to the database
- Verify the database has the test flights: `SELECT * FROM flight WHERE flight_id >= 100;`
- Check browser console for API errors

### API returns empty results?
- Make sure the search dates match the test flight dates (December 2025)
- Check that the airport codes are correct (BKK, BER)
- Verify the backend API endpoint is working: `http://localhost:8080/api/v1/flights/search?from=2&to=1&date=2025-12-13`

## Flight IDs Reference

- **100-108**: BKK → BER (Departure)
- **150-163**: BER → BKK (Return)
- **170-177**: Other routes (Tokyo, Singapore)
