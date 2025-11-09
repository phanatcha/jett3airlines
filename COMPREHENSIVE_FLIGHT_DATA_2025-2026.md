# Comprehensive Flight Data Generator (2025-2026)

## Overview
This script generates extensive flight data covering **December 2025 through December 2026** (13 months total) for comprehensive testing of the airline booking system.

## What's Generated

### Flight Coverage
- **Time Period**: December 2025 - December 2026 (13 months)
- **Total Flights**: ~3,000+ flights
- **Routes**: 9 major routes from Bangkok (BKK) hub + 7 inter-city routes
- **Frequency**: Multiple daily flights on popular routes

### Routes Included

#### Bangkok (BKK) Hub Routes
1. **BKK ↔ Berlin (BER)** - 2 flights/day
2. **BKK ↔ Tokyo (HND)** - 2 flights/day
3. **BKK ↔ Singapore (SIN)** - 4 flights/day (high frequency)
4. **BKK ↔ Paris (CDG)** - 1 flight/day
5. **BKK ↔ New York (JFK)** - 1 flight/day
6. **BKK ↔ London (LHR)** - 2 flights/day
7. **BKK ↔ Dubai (DXB)** - 2 flights/day
8. **BKK ↔ Seoul (ICN)** - 2 flights/day
9. **BKK ↔ Sydney (SYD)** - 1 flight/day

#### Inter-City Routes (Non-Bangkok)
1. **Tokyo ↔ Singapore**
2. **London ↔ Paris**
3. **Berlin ↔ Paris**
4. **New York ↔ London**
5. **Dubai ↔ London**
6. **Seoul ↔ Tokyo**
7. **Sydney ↔ Singapore**

### Flight Characteristics
- **Realistic departure times**: Varied throughout the day
- **Accurate flight durations**: Based on actual route distances
- **Appropriate aircraft**: Short/Medium/Long haul aircraft assigned correctly
- **Return flights**: Both outbound and return flights generated
- **Flight numbers**: Sequential JT3-XXXX format
- **Status**: All flights set to 'Scheduled'

## How to Use

### Step 1: Generate the SQL File

Run the PowerShell script:

```powershell
.\generate-comprehensive-flights-2025-2026.ps1
```

This will create: `backend/scripts/comprehensive-flights-2025-2026.sql`

### Step 2: Import into Database

#### Option A: Using MySQL Command Line

```bash
mysql -u root -p jett3_airline < backend/scripts/comprehensive-flights-2025-2026.sql
```

#### Option B: From MySQL Shell

```sql
USE jett3_airline;
SOURCE backend/scripts/comprehensive-flights-2025-2026.sql;
```

#### Option C: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. File → Run SQL Script
4. Select `backend/scripts/comprehensive-flights-2025-2026.sql`
5. Click Run

### Step 3: Verify Import

```sql
-- Check total flights
SELECT COUNT(*) as total_flights FROM flight WHERE flight_id >= 1000;

-- Check flights by month
SELECT 
    DATE_FORMAT(depart_when, '%Y-%m') as month,
    COUNT(*) as flight_count
FROM flight 
WHERE flight_id >= 1000
GROUP BY DATE_FORMAT(depart_when, '%Y-%m')
ORDER BY month;

-- Check flights by route
SELECT 
    CONCAT(da.city, ' → ', aa.city) as route,
    COUNT(*) as flight_count
FROM flight f
JOIN airport da ON f.depart_airport_id = da.airport_id
JOIN airport aa ON f.arrive_airport_id = aa.airport_id
WHERE f.flight_id >= 1000
GROUP BY route
ORDER BY flight_count DESC;
```

## Flight ID Range

- **Starting ID**: 1000
- **Ending ID**: ~4000 (depending on generation)
- **Range**: 1000-9999 (reserved for generated flights)

## Benefits

### For Testing
- ✅ Test flight search across multiple months
- ✅ Test booking flows with realistic data
- ✅ Test date range filters
- ✅ Test pagination with large datasets
- ✅ Test performance with substantial data

### For Development
- ✅ Realistic flight schedules
- ✅ Multiple daily frequencies
- ✅ Various route types (short/medium/long haul)
- ✅ Return flight options
- ✅ Inter-city connections

### For Demo
- ✅ Professional-looking flight data
- ✅ Comprehensive route network
- ✅ Year-round availability
- ✅ Realistic booking scenarios

## Customization

### Modify Routes
Edit the `$routes` array in the PowerShell script:

```powershell
$routes = @(
    @{ From="BKK"; To="BER"; Duration=8.5; Airplane="Long"; DailyFlights=2 },
    # Add more routes here
)
```

### Adjust Frequency
Change `DailyFlights` value for each route:
- `1` = 1 flight per day
- `2` = 2 flights per day
- `4` = 4 flights per day (high frequency)

### Change Date Range
Modify the `$months` array to include different months:

```powershell
$months = @(
    @{ Year=2026; Month=1; Days=31; Name="January 2026" },
    # Add more months here
)
```

### Adjust Flight IDs
Change the starting flight ID:

```powershell
$startFlightId = 1000  # Change this value
```

## Data Cleanup

To remove all generated flights:

```sql
DELETE FROM flight WHERE flight_id BETWEEN 1000 AND 9999;
```

To remove flights from a specific month:

```sql
DELETE FROM flight 
WHERE flight_id >= 1000 
AND DATE_FORMAT(depart_when, '%Y-%m') = '2026-06';
```

## Performance Considerations

### Import Time
- **~3,000 flights**: ~5-10 seconds
- **Large datasets**: May take longer depending on system

### Database Size
- Each flight record: ~200 bytes
- 3,000 flights: ~600 KB
- Plus seat data: ~150 seats × 3,000 flights = significant size

### Optimization Tips
1. **Disable foreign key checks** during import:
   ```sql
   SET FOREIGN_KEY_CHECKS=0;
   -- Import data
   SET FOREIGN_KEY_CHECKS=1;
   ```

2. **Use bulk inserts** (already implemented in script)

3. **Add indexes** after import:
   ```sql
   CREATE INDEX idx_depart_when ON flight(depart_when);
   CREATE INDEX idx_route ON flight(depart_airport_id, arrive_airport_id);
   ```

## Troubleshooting

### Issue: Script execution policy error
**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: MySQL import fails
**Solution**: Check that:
- MySQL service is running
- Database `jett3_airline` exists
- User has INSERT permissions
- No duplicate flight_id conflicts

### Issue: Too many flights generated
**Solution**: Reduce `DailyFlights` values or limit months in the script

### Issue: Not enough flights
**Solution**: Increase `DailyFlights` values or add more routes

## Example Queries

### Find flights for a specific date
```sql
SELECT 
    f.flight_no,
    da.city as departure,
    aa.city as arrival,
    f.depart_when,
    f.arrive_when
FROM flight f
JOIN airport da ON f.depart_airport_id = da.airport_id
JOIN airport aa ON f.arrive_airport_id = aa.airport_id
WHERE DATE(f.depart_when) = '2026-06-15'
ORDER BY f.depart_when;
```

### Find all flights from Bangkok in June 2026
```sql
SELECT 
    f.flight_no,
    aa.city as destination,
    f.depart_when,
    f.arrive_when
FROM flight f
JOIN airport aa ON f.arrive_airport_id = aa.airport_id
WHERE f.depart_airport_id = 1
AND DATE_FORMAT(f.depart_when, '%Y-%m') = '2026-06'
ORDER BY f.depart_when;
```

### Check flight distribution by airplane
```sql
SELECT 
    a.model,
    COUNT(*) as flight_count
FROM flight f
JOIN airplane a ON f.airplane_id = a.airplane_id
WHERE f.flight_id >= 1000
GROUP BY a.model;
```

## Next Steps

After importing the flight data:

1. **Generate seat data** for all flights (if not auto-generated)
2. **Test flight search** functionality
3. **Test booking flows** with various dates
4. **Verify seat availability** calculations
5. **Test admin flight management** features

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify database schema matches expectations
3. Check MySQL error logs
4. Review the generated SQL file for syntax errors

## Version History

- **v1.0** (2024-11-08): Initial release
  - 13 months of flight data
  - 9 Bangkok hub routes
  - 7 inter-city routes
  - ~3,000+ total flights
