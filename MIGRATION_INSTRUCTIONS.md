# Database Migration Instructions

## Migration: Add Fare Columns to Booking Table ✅ COMPLETED

**Status**: Successfully applied on November 19, 2025
**Database**: Railway MySQL (jett3_airline)

### What This Does
Adds three new columns to the `booking` table to store fare package information:
- `fare_class`: The selected fare class (e.g., "Economy Saver", "Economy Plus")
- `cabin_class`: The cabin class (e.g., "Economy", "Premium Economy", "Business")
- `fare_price`: The total fare package price for all passengers

### Why This Is Needed
The backend needs to calculate booking costs based on the fare package price (which includes the seat), not by summing individual seat prices from the database.

### How to Run on Railway

#### Option 1: Using Railway CLI
```bash
# Connect to Railway database
railway connect

# Run the migration
mysql -u root -p < backend/migrations/add_fare_columns_to_booking.sql
```

#### Option 2: Using Railway Dashboard
1. Go to Railway Dashboard: https://railway.app/
2. Select your project: `jett3airlines-backend-production`
3. Click on the MySQL database service
4. Click "Connect" tab
5. Copy the connection string
6. Use a MySQL client (like MySQL Workbench, DBeaver, or command line) to connect
7. Run the SQL from `backend/migrations/add_fare_columns_to_booking.sql`

#### Option 3: Using MySQL Command Line
```bash
# Get connection details from Railway dashboard
mysql -h <host> -u <user> -p<password> -P <port> <database> < backend/migrations/add_fare_columns_to_booking.sql
```

### Migration SQL
```sql
-- Add fare-related columns to booking table
ALTER TABLE `booking` 
ADD COLUMN `fare_class` VARCHAR(50) DEFAULT NULL COMMENT 'Fare class selected (e.g., Economy Saver, Economy Plus)',
ADD COLUMN `cabin_class` VARCHAR(50) DEFAULT NULL COMMENT 'Cabin class (Economy, Premium Economy, Business)',
ADD COLUMN `fare_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Total fare package price for all passengers';

-- Add index for better query performance
CREATE INDEX idx_booking_fare_class ON `booking`(`fare_class`);
CREATE INDEX idx_booking_cabin_class ON `booking`(`cabin_class`);
```

### Verification
After running the migration, verify it worked:

```sql
-- Check if columns were added
DESCRIBE booking;

-- Check if indexes were created
SHOW INDEX FROM booking;
```

You should see the three new columns: `fare_class`, `cabin_class`, and `fare_price`.

### Rollback (if needed)
If you need to rollback this migration:

```sql
-- Remove indexes
DROP INDEX idx_booking_fare_class ON booking;
DROP INDEX idx_booking_cabin_class ON booking;

-- Remove columns
ALTER TABLE booking 
DROP COLUMN fare_class,
DROP COLUMN cabin_class,
DROP COLUMN fare_price;
```

### Impact
- **Existing bookings**: Will continue to work (cost calculated from seat prices)
- **New bookings**: Will use fare_price for cost calculation
- **No downtime required**: This is a backward-compatible change

### Next Steps
After running the migration:
1. Restart the backend service on Railway (if needed)
2. Test creating a new booking with fare package selection
3. Verify payment amount matches the fare package price
