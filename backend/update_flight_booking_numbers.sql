-- Update script to add flight numbers and booking numbers to existing records

-- Update flight numbers with format JT{flight_id padded to 3 digits}
UPDATE flight 
SET flight_no = CONCAT('JT', LPAD(flight_id, 3, '0'))
WHERE flight_no IS NULL;

-- Update booking numbers with format BK{booking_id padded to 6 digits}{YYYYMMDD}
UPDATE booking 
SET booking_no = CONCAT('BK', LPAD(booking_id, 6, '0'), DATE_FORMAT(created_date, '%Y%m%d'))
WHERE booking_no IS NULL;

-- Verify updates
SELECT flight_id, flight_no, depart_when, arrive_when FROM flight;
SELECT booking_id, booking_no, created_date, status FROM booking;
