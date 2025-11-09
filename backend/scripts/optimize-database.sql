-- Database Optimization Script
-- Adds indexes and optimizations for better query performance

-- ============================================
-- FLIGHT TABLE OPTIMIZATIONS
-- ============================================

-- Index for flight search by airports and dates
CREATE INDEX IF NOT EXISTS idx_flight_search 
ON flight(depart_airport_id, arrive_airport_id, depart_when, status);

-- Index for flight status queries
CREATE INDEX IF NOT EXISTS idx_flight_status 
ON flight(status);

-- Index for airplane lookups
CREATE INDEX IF NOT EXISTS idx_flight_airplane 
ON flight(airplane_id);

-- ============================================
-- BOOKING TABLE OPTIMIZATIONS
-- ============================================

-- Index for client bookings lookup
CREATE INDEX IF NOT EXISTS idx_booking_client 
ON booking(client_id, status);

-- Index for flight bookings lookup
CREATE INDEX IF NOT EXISTS idx_booking_flight 
ON booking(flight_id, status);

-- Index for booking date range queries
CREATE INDEX IF NOT EXISTS idx_booking_dates 
ON booking(created_date, updated_date);

-- ============================================
-- PASSENGER TABLE OPTIMIZATIONS
-- ============================================

-- Index for booking passengers lookup
CREATE INDEX IF NOT EXISTS idx_passenger_booking 
ON passenger(booking_id);

-- Index for passport number lookups
CREATE INDEX IF NOT EXISTS idx_passenger_passport 
ON passenger(passport_no);

-- ============================================
-- SEAT TABLE OPTIMIZATIONS
-- ============================================

-- Index for airplane seat lookups
CREATE INDEX IF NOT EXISTS idx_seat_airplane 
ON seat(airplane_id, class);

-- Composite index for seat availability checks
CREATE INDEX IF NOT EXISTS idx_seat_availability 
ON seat(airplane_id, seat_no, class);

-- ============================================
-- PAYMENT TABLE OPTIMIZATIONS
-- ============================================

-- Index for booking payment lookups
CREATE INDEX IF NOT EXISTS idx_payment_booking 
ON payment(booking_id);

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_payment_status 
ON payment(status, payment_date);

-- Index for client payment history
CREATE INDEX IF NOT EXISTS idx_payment_client 
ON payment(client_id, payment_date);

-- ============================================
-- BAGGAGE TABLE OPTIMIZATIONS
-- ============================================

-- Index for passenger baggage lookup
CREATE INDEX IF NOT EXISTS idx_baggage_passenger 
ON baggage(passenger_id);

-- Index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_baggage_tracking 
ON baggage(tracking_no);

-- Index for baggage status queries
CREATE INDEX IF NOT EXISTS idx_baggage_status 
ON baggage(status);

-- ============================================
-- CLIENT TABLE OPTIMIZATIONS
-- ============================================

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS idx_client_email 
ON client(email);

-- Index for username lookups (login)
CREATE INDEX IF NOT EXISTS idx_client_username 
ON client(username);

-- ============================================
-- AIRPORT TABLE OPTIMIZATIONS
-- ============================================

-- Index for airport code lookups
CREATE INDEX IF NOT EXISTS idx_airport_code 
ON airport(code);

-- Index for airport name searches
CREATE INDEX IF NOT EXISTS idx_airport_name 
ON airport(name);

-- ============================================
-- ADMIN TABLE OPTIMIZATIONS
-- ============================================

-- Index for admin username lookups
CREATE INDEX IF NOT EXISTS idx_admin_username 
ON admin(username);

-- Index for admin email lookups
CREATE INDEX IF NOT EXISTS idx_admin_email 
ON admin(email);

-- ============================================
-- QUERY OPTIMIZATION SETTINGS
-- ============================================

-- Analyze tables to update statistics
ANALYZE TABLE flight;
ANALYZE TABLE booking;
ANALYZE TABLE passenger;
ANALYZE TABLE seat;
ANALYZE TABLE payment;
ANALYZE TABLE baggage;
ANALYZE TABLE client;
ANALYZE TABLE airport;
ANALYZE TABLE airplane;
ANALYZE TABLE admin;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all indexes on critical tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = 'jett3_airline'
    AND TABLE_NAME IN ('flight', 'booking', 'passenger', 'seat', 'payment', 'baggage', 'client')
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================
-- PERFORMANCE RECOMMENDATIONS
-- ============================================

/*
ADDITIONAL OPTIMIZATION RECOMMENDATIONS:

1. QUERY CACHE (if using MySQL < 8.0):
   - Configure query_cache_size for frequently accessed data
   - Monitor query cache hit rate

2. CONNECTION POOLING:
   - Already implemented in application layer
   - Recommended pool size: 10-20 connections

3. SLOW QUERY LOG:
   - Enable slow query log in production
   - Set long_query_time = 2 (log queries > 2 seconds)
   - Regularly review and optimize slow queries

4. TABLE PARTITIONING (for large tables):
   - Consider partitioning flight table by date
   - Consider partitioning booking table by date
   - Useful when tables exceed 1M rows

5. READ REPLICAS:
   - For high-traffic applications
   - Route read queries to replicas
   - Keep write queries on primary

6. CACHING LAYER:
   - Implement Redis for frequently accessed data
   - Cache flight search results (5-15 min TTL)
   - Cache user sessions and profiles

7. REGULAR MAINTENANCE:
   - Run OPTIMIZE TABLE monthly
   - Update table statistics weekly
   - Monitor index usage and remove unused indexes

8. MONITORING:
   - Track query execution times
   - Monitor connection pool usage
   - Set up alerts for slow queries
   - Monitor database CPU and memory usage
*/
