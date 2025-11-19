-- Add fare-related columns to booking table
ALTER TABLE `booking` 
ADD COLUMN `fare_class` VARCHAR(50) DEFAULT NULL COMMENT 'Fare class selected (e.g., Economy Saver, Economy Plus)',
ADD COLUMN `cabin_class` VARCHAR(50) DEFAULT NULL COMMENT 'Cabin class (Economy, Premium Economy, Business)',
ADD COLUMN `fare_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Total fare package price for all passengers';

-- Add index for better query performance
CREATE INDEX idx_booking_fare_class ON `booking`(`fare_class`);
CREATE INDEX idx_booking_cabin_class ON `booking`(`cabin_class`);
