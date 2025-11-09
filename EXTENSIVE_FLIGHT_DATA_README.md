# Extensive Flight Data Generator 🛫

This package generates **200+ comprehensive flight records** for testing your airline booking system!

## 📊 What's Included

### Flight Coverage
- **200+ flights** across all routes
- **10 airports** fully connected
- **December 2025 - January 2026** date range
- **Multiple daily departures** on popular routes

### Routes Generated

#### Bangkok (BKK) Hub - Primary Routes
- **BKK ↔ Berlin (BER)**: 20+ flights each direction
- **BKK ↔ Tokyo (HND)**: 25+ flights each direction  
- **BKK ↔ Paris (CDG)**: 15+ flights each direction
- **BKK ↔ New York (JFK)**: 12+ flights each direction
- **BKK ↔ Singapore (SIN)**: 30+ flights each direction (high frequency!)
- **BKK ↔ London (LHR)**: 14+ flights each direction
- **BKK ↔ Dubai (DXB)**: 16+ flights each direction
- **BKK ↔ Seoul (ICN)**: 14+ flights each direction
- **BKK ↔ Sydney (SYD)**: 10+ flights each direction

#### Inter-City Routes (Non-Bangkok)
- Tokyo ↔ Singapore
- London ↔ Paris
- Berlin ↔ Paris
- New York ↔ London
- Dubai ↔ London
- Seoul ↔ Tokyo
- Sydney ↔ Singapore

### Flight Times
- ✈️ **Early Morning** (00:30 - 06:00): Red-eye flights
- ☀️ **Morning** (06:00 - 12:00): Business travelers
- 🌤️ **Afternoon** (12:00 - 18:00): Peak hours
- 🌙 **Evening** (18:00 - 00:00): Late departures
- 🌃 **Night** (00:00 - 06:00): Overnight flights

### Flight Statuses
- ✅ **Scheduled**: Majority of flights (normal operations)
- ⏰ **Delayed**: 3 flights (for testing delay handling)
- ❌ **Cancelled**: 2 flights (for testing cancellations)
- 🚪 **Boarding**: 2 flights (for testing active boarding)

### Special Flight Categories

#### High-Frequency Routes
**BKK ↔ Singapore**: 4-8 flights per day
- Perfect for testing multiple flight options
- Various price points and times

#### Weekend Specials
- Friday evening departures
- Saturday morning/evening flights
- Sunday return flights

#### Holiday Season
- Christmas Eve flights
- Christmas Day flights
- New Year's Eve flights
- New Year's Day flights

#### Business Traveler Flights
- Early morning departures (06:00-08:00)
- Mid-week focus (Tuesday-Thursday)
- Quick turnaround times

## 🚀 How to Use

### Option 1: PowerShell Script (Recommended)
```powershell
.\generate-extensive-flights.ps1
```

### Option 2: Direct MySQL
```bash
mysql -u root jett3_airline < backend/scripts/generate-extensive-flights.sql
```

### Option 3: XAMPP phpMyAdmin
1. Open phpMyAdmin
2. Select `jett3_airline` database
3. Go to SQL tab
4. Copy and paste contents of `backend/scripts/generate-extensive-flights.sql`
5. Click "Go"

## 📋 Flight ID Ranges

| Range | Purpose |
|-------|---------|
| 200-219 | BKK → Berlin |
| 220-233 | BKK → Tokyo |
| 240-248 | BKK → Paris |
| 250-256 | BKK → New York |
| 260-273 | BKK → Singapore |
| 280-286 | BKK → London |
| 290-297 | BKK → Dubai |
| 300-306 | BKK → Seoul |
| 310-314 | BKK → Sydney |
| 400-413 | Berlin → BKK |
| 420-428 | Tokyo → BKK |
| 440-446 | Paris → BKK |
| 450-455 | New York → BKK |
| 460-472 | Singapore → BKK |
| 480-486 | London → BKK |
| 490-496 | Dubai → BKK |
| 500-506 | Seoul → BKK |
| 510-514 | Sydney → BKK |
| 600-730 | Inter-city routes |
| 800-821 | Test status flights |
| 850-944 | Additional high-frequency |
| 950-958 | Business traveler flights |

## 🧪 Testing Scenarios

### Round-Trip Booking
```
Search: BKK → BER (Dec 10) → BKK (Dec 15)
Result: Multiple departure and return options
```

### Same-Day Multiple Flights
```
Search: BKK → SIN (Dec 1)
Result: 4+ flights throughout the day
```

### Long-Haul Journey
```
Search: BKK → JFK (Dec 1)
Result: 12+ hour flights with proper timing
```

### Weekend Getaway
```
Search: BKK → SIN (Dec 5-7)
Result: Friday departure, Sunday return options
```

### Holiday Travel
```
Search: BKK → BER (Dec 24-26)
Result: Christmas flights available
```

### Flight Status Testing
```
- Search for delayed flights (IDs: 800-802)
- Search for cancelled flights (IDs: 810-811)
- Search for boarding flights (IDs: 820-821)
```

## 📈 Statistics

After running the script, you'll have:
- **200+ total flights**
- **30+ unique routes**
- **50+ days** of flight coverage
- **Multiple daily options** on popular routes
- **4 different statuses** for comprehensive testing

## 🔍 Verification Queries

### Check total flights
```sql
SELECT COUNT(*) FROM flight WHERE flight_id BETWEEN 200 AND 999;
```

### View flights by route
```sql
SELECT 
    CONCAT(dep.city_name, ' → ', arr.city_name) as route,
    COUNT(*) as flights
FROM flight f
JOIN airport dep ON f.depart_airport_id = dep.airport_id
JOIN airport arr ON f.arrive_airport_id = arr.airport_id
WHERE f.flight_id BETWEEN 200 AND 999
GROUP BY route
ORDER BY flights DESC;
```

### Check flights by date
```sql
SELECT 
    DATE(depart_when) as date,
    COUNT(*) as flights
FROM flight
WHERE flight_id BETWEEN 200 AND 999
GROUP BY DATE(depart_when)
ORDER BY date;
```

### View flights by status
```sql
SELECT status, COUNT(*) as count
FROM flight
WHERE flight_id BETWEEN 200 AND 999
GROUP BY status;
```

## 🎯 Perfect For Testing

✅ Flight search functionality  
✅ Round-trip booking flows  
✅ Multiple passenger bookings  
✅ Seat selection across different flights  
✅ Price comparison  
✅ Date flexibility  
✅ Time preference filtering  
✅ Status handling (delays, cancellations)  
✅ High-traffic scenarios  
✅ Weekend and holiday bookings  

## 🛠️ Customization

Want to add more flights? Edit `backend/scripts/generate-extensive-flights.sql`:

1. **Add more dates**: Copy existing INSERT blocks and change dates
2. **Add more routes**: Follow the pattern with different airport IDs
3. **Adjust times**: Modify `depart_when` and `arrive_when` values
4. **Change statuses**: Update the `status` field

## 📝 Notes

- All flights use existing airplane IDs (1, 2, 3)
- All airports are from the existing database
- Flight numbers follow pattern: JT3-XXX
- Times are in 24-hour format
- Dates span December 2025 - January 2026

## 🎉 Enjoy Testing!

You now have a comprehensive flight dataset that covers virtually every testing scenario you'll need. Happy testing! ✈️
