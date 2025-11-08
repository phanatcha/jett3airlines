SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `jett3_airline` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `jett3_airline`;

CREATE TABLE `airplane` (
  `airplane_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `registration` varchar(50) DEFAULT NULL,
  `reg_country` varchar(50) DEFAULT NULL,
  `MSN` varchar(50) DEFAULT NULL,
  `manufacturing_year` date DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `min_price` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `airplane` (`airplane_id`, `type`, `registration`, `reg_country`, `MSN`, `manufacturing_year`, `capacity`, `min_price`) VALUES
(1, 'Airbus A320-200', 'HS-ABC', 'Thailand', 'MSN-7001', '2014-01-01', 215, 2500),
(2, 'ATR 72-600', 'HS-ABH', 'Thailand', 'MSN-7506', '2017-01-01', 70, 1200),
(3, 'Airbus A220-300', 'HS-ABM', 'Thailand', 'MSN-7810', '2020-01-01', 145, 2700);

CREATE TABLE `airport` (
  `airport_id` int(11) NOT NULL,
  `city_name` varchar(100) DEFAULT NULL,
  `airport_name` varchar(150) DEFAULT NULL,
  `iata_code` char(3) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `airport` (`airport_id`, `city_name`, `airport_name`, `iata_code`, `country_name`) VALUES
(1, 'Bangkok', 'Suvarnabhumi Airport', 'BKK', 'Thailand'),
(2, 'Berlin', 'Berlin Brandenburg Airport', 'BER', 'Germany'),
(3, 'Tokyo', 'Haneda Airport', 'HND', 'Japan'),
(4, 'Paris', 'Charles de Gaulle Airport', 'CDG', 'France'),
(5, 'New York', 'John F. Kennedy International Airport', 'JFK', 'United States'),
(6, 'Singapore', 'Changi Airport', 'SIN', 'Singapore'),
(7, 'London', 'Heathrow Airport', 'LHR', 'United Kingdom'),
(8, 'Dubai', 'Dubai International Airport', 'DXB', 'United Arab Emirates'),
(9, 'Seoul', 'Incheon International Airport', 'ICN', 'South Korea'),
(10, 'Sydney', 'Sydney Kingsford Smith Airport', 'SYD', 'Australia');

CREATE TABLE `baggage` (
  `baggage_id` int(11) NOT NULL,
  `tracking_no` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `passenger_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `booking` (
  `booking_id` int(11) NOT NULL,
  `support` varchar(50) DEFAULT NULL,
  `fasttrack` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `flight_id` int(11) DEFAULT NULL,
  `booking_no` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
DELIMITER $$
CREATE TRIGGER `updated_booking` BEFORE UPDATE ON `booking` FOR EACH ROW begin 
set new.updated_date = now();
end
$$
DELIMITER ;

CREATE TABLE `client` (
  `client_id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `postalcode` varchar(10) DEFAULT NULL,
  `card_no` varbinary(255) DEFAULT NULL,
  `four_digit` varchar(4) DEFAULT NULL,
  `payment_type` varchar(25) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `client` (`client_id`, `username`, `password`, `email`, `phone_no`, `firstname`, `lastname`, `dob`, `street`, `city`, `province`, `Country`, `postalcode`, `card_no`, `four_digit`, `payment_type`, `role`) VALUES
(1, 'alice.w', 'argon2', 'alice@example.com', '+12025550101', 'Alice', 'Wong', '1990-03-14', '12 Maple St', 'Seattle', 'WA', 'USA', '98101', 0x2b9a7e81e07efee973eded3450fecb426a1ba53b64749136fe7a54e241ee928a, '1111', 'VISA', 'user'),
(2, 'bob.s', 'argon2', 'bob@example.com', '+12025550102', 'Bob', 'Smith', '1985-07-22', '34 Pine Ave', 'Portland', 'OR', 'USA', '97201', 0x3e25145f45d7115c2d60cf9d3d5c8fd46a1ba53b64749136fe7a54e241ee928a, '0004', 'MASTERCARD', 'user'),
(3, 'carol.j', 'argon2', 'carol@example.com', '+14085550103', 'Carol', 'Johnson', '1992-11-05', '56 Oak Blvd', 'San Jose', 'CA', 'USA', '95112', 0x09d23b0ed23ec27101ca743fa3dca9cb6a1ba53b64749136fe7a54e241ee928a, '0002', 'VISA', 'user'),
(4, 'dave.k', 'argon2', 'dave@example.com', '+13125550104', 'Dave', 'Kim', '1979-01-17', '78 Birch Rd', 'Austin', 'TX', 'USA', '73301', 0xc808fc4f0283f1e7b2f2a63a497613a3, '0009', 'AMEX', 'user'),
(5, 'eva.r', 'argon2', 'eva@example.com', '+17865550105', 'Eva', 'Rodriguez', '1995-06-30', '90 Cedar Ln', 'Miami', 'FL', 'USA', '33101', 0xe754754d7a66dd822d2c99c3102fc3236a1ba53b64749136fe7a54e241ee928a, '0004', 'DISCOVER', 'user'),
(6, 'frank.l', 'argon2', 'frank@example.com', '+17205550106', 'Frank', 'Lee', '1988-09-09', '101 Spruce Ct', 'Denver', 'CO', 'USA', '80202', 0x3509a9c48b28df9f91b5675594e2be056a1ba53b64749136fe7a54e241ee928a, '0000', 'JCB', 'user'),
(7, 'grace.h', 'argon2', 'grace@example.com', '+13125550107', 'Grace', 'Hernandez', '1993-12-12', '202 Poplar Way', 'Chicago', 'IL', 'USA', '60601', 0x0067f8d0a706fec2a55a85b8ae1ffd5c6a1ba53b64749136fe7a54e241ee928a, '8453', 'MAESTRO', 'user'),
(8, 'henry.p', 'argon2', 'henry@example.com', '+16175550108', 'Henry', 'Park', '1981-04-04', '303 Walnut St', 'Boston', 'MA', 'USA', '02108', 0xe147e30849c787d67dbd121aaf12898a6a1ba53b64749136fe7a54e241ee928a, '1111', 'VISA', 'user'),
(9, 'irene.c', 'argon2', 'irene@example.com', '+12125550109', 'Irene', 'Chen', '1991-08-18', '404 Chestnut Dr', 'New York', 'NY', 'USA', '10001', 0xa0a73889df66d8d6ba68bd0461bad9926a1ba53b64749136fe7a54e241ee928a, '8210', 'MASTERCARD', 'user'),
(10, 'jack.m', 'argon2', 'jack@example.com', '+14155550110', 'Jack', 'Martinez', '1984-02-26', '505 Redwood Ave', 'San Francisco', 'CA', 'USA', '94105', 0x4c9aefc70fc233c8fce918ea9ab9cd64c959b73f50b6e4b5b7acb01d4c48a454, '9458', 'DISCOVER', 'user'),
(11, 'anucha.w', 'argon2', 'anucha.w@example.com', '+66810010001', 'Anucha', 'Wongchai', '1990-03-14', '12 Sukhumvit 11', 'Bangkok', 'Bangkok', 'Thailand', '10110', 0x2b9a7e81e07efee973eded3450fecb426a1ba53b64749136fe7a54e241ee928a, '1111', 'VISA', 'user'),
(12, 'benja.s', 'argon2', 'benja.s@example.com', '+66810010002', 'Benjamas', 'Srisuk', '1985-07-22', '34 Ratchada Rd', 'Bangkok', 'Bangkok', 'Thailand', '10400', 0x3e25145f45d7115c2d60cf9d3d5c8fd46a1ba53b64749136fe7a54e241ee928a, '0004', 'MASTERCARD', 'user'),
(13, 'chatchai.j', 'argon2', 'chatchai.j@example.com', '+66810010003', 'Chatchai', 'Jindapat', '1992-11-05', '56 Nimmanhaemin Soi 9', 'Chiang Mai', 'Chiang Mai', 'Thailand', '50200', 0x09d23b0ed23ec27101ca743fa3dca9cb6a1ba53b64749136fe7a54e241ee928a, '0002', 'VISA', 'user'),
(14, 'duang.k', 'argon2', 'duang.k@example.com', '+66810010004', 'Duangkamol', 'Kittisak', '1979-01-17', '78 Mittraphap Rd', 'Nakhon Ratchasima', 'Nakhon Ratchasima', 'Thailand', '30000', 0xc808fc4f0283f1e7b2f2a63a497613a3, '0009', 'AMEX', 'user'),
(15, 'ema.r', 'argon2', 'ema.r@example.com', '+66810010005', 'Em-on', 'Rattanaporn', '1995-06-30', '90 Thepsrisin Rd', 'Hat Yai', 'Songkhla', 'Thailand', '90110', 0xe754754d7a66dd822d2c99c3102fc3236a1ba53b64749136fe7a54e241ee928a, '0004', 'DISCOVER', 'user'),
(16, 'fass.l', 'argon2', 'fass.l@example.com', '+66810010006', 'Faas', 'Lamoon', '1988-09-09', '101 Chang Klan Rd', 'Chiang Mai', 'Chiang Mai', 'Thailand', '50100', 0x3509a9c48b28df9f91b5675594e2be056a1ba53b64749136fe7a54e241ee928a, '0000', 'JCB', 'user'),
(17, 'grace.h', 'argon2', 'grace.th@example.com', '+66810010007', 'Kanyarat', 'Hiran', '1993-12-12', '202 Si Ayutthaya Rd', 'Bangkok', 'Bangkok', 'Thailand', '10400', 0x0067f8d0a706fec2a55a85b8ae1ffd5c6a1ba53b64749136fe7a54e241ee928a, '8453', 'MAESTRO', 'user'),
(18, 'hen.p', 'argon2', 'hen.p@example.com', '+66810010008', 'Hen', 'Phongchai', '1981-04-04', '303 Yaowarat Rd', 'Bangkok', 'Bangkok', 'Thailand', '10100', 0xe147e30849c787d67dbd121aaf12898a6a1ba53b64749136fe7a54e241ee928a, '1111', 'VISA', 'user'),
(19, 'irene.c', 'argon2', 'irene.c@example.com', '+66810010009', 'Irada', 'Chaowalit', '1991-08-18', '404 Charoen Rat Rd', 'Bangkok', 'Bangkok', 'Thailand', '10120', 0xa0a73889df66d8d6ba68bd0461bad9926a1ba53b64749136fe7a54e241ee928a, '8210', 'MASTERCARD', 'user'),
(20, 'jak.m', 'argon2', 'jak.m@example.com', '+66810010010', 'Jakrin', 'Meesang', '1984-02-26', '505 Thappraya Rd', 'Pattaya', 'Chonburi', 'Thailand', '20150', 0x4c9aefc70fc233c8fce918ea9ab9cd646a1ba53b64749136fe7a54e241ee928a, '8945', 'DISCOVER', 'user');

CREATE TABLE `flight` (
  `flight_id` int(11) NOT NULL,
  `depart_when` datetime DEFAULT NULL,
  `arrive_when` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `airplane_id` int(11) DEFAULT NULL,
  `depart_airport_id` int(11) DEFAULT NULL,
  `arrive_airport_id` int(11) DEFAULT NULL,
  `flight_no` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flight` (`flight_id`, `depart_when`, `arrive_when`, `status`, `airplane_id`, `depart_airport_id`, `arrive_airport_id`, `flight_no`) VALUES
(1, '2025-11-01 08:30:00', '2025-11-01 14:00:00', 'Scheduled', 1, 1, 2, NULL),
(2, '2025-11-02 09:15:00', '2025-11-02 17:40:00', 'Scheduled', 1, 2, 3, NULL),
(3, '2025-11-03 22:00:00', '2025-11-04 04:30:00', 'Scheduled', 2, 3, 1, NULL);

CREATE TABLE `passenger` (
  `passenger_id` int(11) NOT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `passport_no` varbinary(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `weight_limit` int(11) DEFAULT NULL,
  `seat_id` int(11) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `flight_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
DELIMITER $$
CREATE TRIGGER `checked_double_seat_booking` BEFORE INSERT ON `passenger` FOR EACH ROW BEGIN
    DECLARE available INT DEFAULT 0;

    SELECT count(*) INTO available
    FROM passenger
    WHERE flight_id = NEW.flight_id AND
    seat_id = NEW.seat_id;

    IF available > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The seat is already booked for this flight';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `updating_passenger_seat` BEFORE UPDATE ON `passenger` FOR EACH ROW BEGIN
    DECLARE available INT DEFAULT 0;

    SELECT count(*) INTO available
    FROM passenger
    WHERE flight_id = NEW.flight_id AND
    seat_id = NEW.seat_id;

    IF available > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The seat is already booked for this flight';
    END IF;
END
$$
DELIMITER ;

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `amount` int(11) DEFAULT NULL,
  `currency` varchar(50) DEFAULT NULL,
  `payment_timestamp` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `seat` (
  `seat_id` int(11) NOT NULL,
  `seat_no` varchar(10) DEFAULT NULL,
  `class` varchar(20) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `airplane_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `seat` (`seat_id`, `seat_no`, `class`, `price`, `airplane_id`) VALUES
(1, '1A', 'Business', 7500, 1),
(2, '1C', 'Business', 7500, 1),
(3, '1D', 'Business', 7500, 1),
(4, '1F', 'Business', 7500, 1),
(5, '2A', 'Business', 7500, 1),
(6, '2C', 'Business', 7500, 1),
(7, '2D', 'Business', 7500, 1),
(8, '2F', 'Business', 7500, 1),
(9, '3A', 'Business', 7500, 1),
(10, '3C', 'Business', 7500, 1),
(11, '3D', 'Business', 7500, 1),
(12, '3F', 'Business', 7500, 1),
(13, '4A', 'Premium Economy', 4500, 1),
(14, '4B', 'Premium Economy', 4500, 1),
(15, '4C', 'Premium Economy', 4500, 1),
(16, '4D', 'Premium Economy', 4500, 1),
(17, '4E', 'Premium Economy', 4500, 1),
(18, '4F', 'Premium Economy', 4500, 1),
(19, '5A', 'Premium Economy', 4500, 1),
(20, '5B', 'Premium Economy', 4500, 1),
(21, '5C', 'Premium Economy', 4500, 1),
(22, '5D', 'Premium Economy', 4500, 1),
(23, '5E', 'Premium Economy', 4500, 1),
(24, '5F', 'Premium Economy', 4500, 1),
(25, '6A', 'Premium Economy', 4500, 1),
(26, '6B', 'Premium Economy', 4500, 1),
(27, '6C', 'Premium Economy', 4500, 1),
(28, '6D', 'Premium Economy', 4500, 1),
(29, '6E', 'Premium Economy', 4500, 1),
(30, '6F', 'Premium Economy', 4500, 1),
(31, '7A', 'Premium Economy', 4500, 1),
(32, '7B', 'Premium Economy', 4500, 1),
(33, '7C', 'Premium Economy', 4500, 1),
(34, '7D', 'Premium Economy', 4500, 1),
(35, '7E', 'Premium Economy', 4500, 1),
(36, '7F', 'Premium Economy', 4500, 1),
(37, '8A', 'Economy', 2500, 1),
(38, '8B', 'Economy', 2500, 1),
(39, '8C', 'Economy', 2500, 1),
(40, '8D', 'Economy', 2500, 1),
(41, '8E', 'Economy', 2500, 1),
(42, '8F', 'Economy', 2500, 1),
(43, '9A', 'Economy', 2500, 1),
(44, '9B', 'Economy', 2500, 1),
(45, '9C', 'Economy', 2500, 1),
(46, '9D', 'Economy', 2500, 1),
(47, '9E', 'Economy', 2500, 1),
(48, '9F', 'Economy', 2500, 1),
(49, '10A', 'Economy', 2500, 1),
(50, '10B', 'Economy', 2500, 1),
(51, '10C', 'Economy', 2500, 1),
(52, '10D', 'Economy', 2500, 1),
(53, '10E', 'Economy', 2500, 1),
(54, '10F', 'Economy', 2500, 1),
(55, '11A', 'Economy', 2500, 1),
(56, '11B', 'Economy', 2500, 1),
(57, '11C', 'Economy', 2500, 1),
(58, '11D', 'Economy', 2500, 1),
(59, '11E', 'Economy', 2500, 1),
(60, '11F', 'Economy', 2500, 1),
(61, '12A', 'Economy', 2500, 1),
(62, '12B', 'Economy', 2500, 1),
(63, '12C', 'Economy', 2500, 1),
(64, '12D', 'Economy', 2500, 1),
(65, '12E', 'Economy', 2500, 1),
(66, '12F', 'Economy', 2500, 1),
(67, '13A', 'Economy', 2500, 1),
(68, '13B', 'Economy', 2500, 1),
(69, '13C', 'Economy', 2500, 1),
(70, '13D', 'Economy', 2500, 1),
(71, '13E', 'Economy', 2500, 1),
(72, '13F', 'Economy', 2500, 1),
(73, '14A', 'Economy', 2500, 1),
(74, '14B', 'Economy', 2500, 1),
(75, '14C', 'Economy', 2500, 1),
(76, '14D', 'Economy', 2500, 1),
(77, '14E', 'Economy', 2500, 1),
(78, '14F', 'Economy', 2500, 1),
(79, '15A', 'Economy', 2500, 1),
(80, '15B', 'Economy', 2500, 1),
(81, '15C', 'Economy', 2500, 1),
(82, '15D', 'Economy', 2500, 1),
(83, '15E', 'Economy', 2500, 1),
(84, '15F', 'Economy', 2500, 1),
(85, '16A', 'Economy', 2500, 1),
(86, '16B', 'Economy', 2500, 1),
(87, '16C', 'Economy', 2500, 1),
(88, '16D', 'Economy', 2500, 1),
(89, '16E', 'Economy', 2500, 1),
(90, '16F', 'Economy', 2500, 1),
(91, '17A', 'Economy', 2500, 1),
(92, '17B', 'Economy', 2500, 1),
(93, '17C', 'Economy', 2500, 1),
(94, '17D', 'Economy', 2500, 1),
(95, '17E', 'Economy', 2500, 1),
(96, '17F', 'Economy', 2500, 1),
(97, '18A', 'Economy', 2500, 1),
(98, '18B', 'Economy', 2500, 1),
(99, '18C', 'Economy', 2500, 1),
(100, '18D', 'Economy', 2500, 1),
(101, '18E', 'Economy', 2500, 1),
(102, '18F', 'Economy', 2500, 1),
(103, '19A', 'Economy', 2500, 1),
(104, '19B', 'Economy', 2500, 1),
(105, '19C', 'Economy', 2500, 1),
(106, '19D', 'Economy', 2500, 1),
(107, '19E', 'Economy', 2500, 1),
(108, '19F', 'Economy', 2500, 1),
(109, '20A', 'Economy', 2500, 1),
(110, '20B', 'Economy', 2500, 1),
(111, '20C', 'Economy', 2500, 1),
(112, '20D', 'Economy', 2500, 1),
(113, '20E', 'Economy', 2500, 1),
(114, '20F', 'Economy', 2500, 1),
(115, '21A', 'Economy', 2500, 1),
(116, '21B', 'Economy', 2500, 1),
(117, '21C', 'Economy', 2500, 1),
(118, '21D', 'Economy', 2500, 1),
(119, '21E', 'Economy', 2500, 1),
(120, '21F', 'Economy', 2500, 1),
(121, '22A', 'Economy', 2500, 1),
(122, '22B', 'Economy', 2500, 1),
(123, '22C', 'Economy', 2500, 1),
(124, '22D', 'Economy', 2500, 1),
(125, '22E', 'Economy', 2500, 1),
(126, '22F', 'Economy', 2500, 1),
(127, '23A', 'Economy', 2500, 1),
(128, '23B', 'Economy', 2500, 1),
(129, '23C', 'Economy', 2500, 1),
(130, '23D', 'Economy', 2500, 1),
(131, '23E', 'Economy', 2500, 1),
(132, '23F', 'Economy', 2500, 1),
(133, '24A', 'Economy', 2500, 1),
(134, '24B', 'Economy', 2500, 1),
(135, '24C', 'Economy', 2500, 1),
(136, '24D', 'Economy', 2500, 1),
(137, '24E', 'Economy', 2500, 1),
(138, '24F', 'Economy', 2500, 1),
(139, '25A', 'Economy', 2500, 1),
(140, '25B', 'Economy', 2500, 1),
(141, '25C', 'Economy', 2500, 1),
(142, '25D', 'Economy', 2500, 1),
(143, '25E', 'Economy', 2500, 1),
(144, '25F', 'Economy', 2500, 1),
(145, '26A', 'Economy', 2500, 1),
(146, '26B', 'Economy', 2500, 1),
(147, '26C', 'Economy', 2500, 1),
(148, '26D', 'Economy', 2500, 1),
(149, '26E', 'Economy', 2500, 1),
(150, '26F', 'Economy', 2500, 1),
(151, '27A', 'Economy', 2500, 1),
(152, '27B', 'Economy', 2500, 1),
(153, '27C', 'Economy', 2500, 1),
(154, '27D', 'Economy', 2500, 1),
(155, '27E', 'Economy', 2500, 1),
(156, '27F', 'Economy', 2500, 1),
(157, '28A', 'Economy', 2500, 1),
(158, '28B', 'Economy', 2500, 1),
(159, '28C', 'Economy', 2500, 1),
(160, '28D', 'Economy', 2500, 1),
(161, '28E', 'Economy', 2500, 1),
(162, '28F', 'Economy', 2500, 1),
(163, '29A', 'Economy', 2500, 1),
(164, '29B', 'Economy', 2500, 1),
(165, '29C', 'Economy', 2500, 1),
(166, '29D', 'Economy', 2500, 1),
(167, '29E', 'Economy', 2500, 1),
(168, '29F', 'Economy', 2500, 1),
(169, '30A', 'Economy', 2500, 1),
(170, '30B', 'Economy', 2500, 1),
(171, '30C', 'Economy', 2500, 1),
(172, '30D', 'Economy', 2500, 1),
(173, '30E', 'Economy', 2500, 1),
(174, '30F', 'Economy', 2500, 1),
(175, '31A', 'Economy', 2500, 1),
(176, '31B', 'Economy', 2500, 1),
(177, '31C', 'Economy', 2500, 1),
(178, '31D', 'Economy', 2500, 1),
(179, '31E', 'Economy', 2500, 1),
(180, '31F', 'Economy', 2500, 1),
(181, '32A', 'Economy', 2500, 1),
(182, '32B', 'Economy', 2500, 1),
(183, '32C', 'Economy', 2500, 1),
(184, '32D', 'Economy', 2500, 1),
(185, '32E', 'Economy', 2500, 1),
(186, '32F', 'Economy', 2500, 1),
(187, '33A', 'Economy', 2500, 1),
(188, '33B', 'Economy', 2500, 1),
(189, '33C', 'Economy', 2500, 1),
(190, '33D', 'Economy', 2500, 1),
(191, '33E', 'Economy', 2500, 1),
(192, '33F', 'Economy', 2500, 1),
(193, '34A', 'Economy', 2500, 1),
(194, '34B', 'Economy', 2500, 1),
(195, '34C', 'Economy', 2500, 1),
(196, '34D', 'Economy', 2500, 1),
(197, '34E', 'Economy', 2500, 1),
(198, '34F', 'Economy', 2500, 1),
(199, '35A', 'Economy', 2500, 1),
(200, '35B', 'Economy', 2500, 1),
(201, '35C', 'Economy', 2500, 1),
(202, '35D', 'Economy', 2500, 1),
(203, '35E', 'Economy', 2500, 1),
(204, '35F', 'Economy', 2500, 1),
(205, '36A', 'Economy', 2500, 1),
(206, '36B', 'Economy', 2500, 1),
(207, '36C', 'Economy', 2500, 1),
(208, '36D', 'Economy', 2500, 1),
(209, '36E', 'Economy', 2500, 1),
(210, '36F', 'Economy', 2500, 1),
(211, '37A', 'Economy', 2500, 1),
(212, '37B', 'Economy', 2500, 1),
(213, '37C', 'Economy', 2500, 1),
(214, '37D', 'Economy', 2500, 1),
(215, '37E', 'Economy', 2500, 1),
(217, '1A', 'BUSINESS', 2500, 2),
(218, '1B', 'BUSINESS', 2500, 2),
(219, '1C', 'BUSINESS', 2500, 2),
(220, '1D', 'BUSINESS', 2500, 2),
(221, '1E', 'BUSINESS', 2500, 2),
(222, '2A', 'BUSINESS', 2500, 2),
(223, '2B', 'BUSINESS', 2500, 2),
(224, '2C', 'BUSINESS', 2500, 2),
(225, '2D', 'BUSINESS', 2500, 2),
(226, '2E', 'BUSINESS', 2500, 2),
(227, '3A', 'PREMIUM_ECONOMY', 1800, 2),
(228, '3B', 'PREMIUM_ECONOMY', 1800, 2),
(229, '3C', 'PREMIUM_ECONOMY', 1800, 2),
(230, '3D', 'PREMIUM_ECONOMY', 1800, 2),
(231, '3E', 'PREMIUM_ECONOMY', 1800, 2),
(232, '4A', 'PREMIUM_ECONOMY', 1800, 2),
(233, '4B', 'PREMIUM_ECONOMY', 1800, 2),
(234, '4C', 'PREMIUM_ECONOMY', 1800, 2),
(235, '4D', 'PREMIUM_ECONOMY', 1800, 2),
(236, '4E', 'PREMIUM_ECONOMY', 1800, 2),
(237, '5A', 'ECONOMY', 1200, 2),
(238, '5B', 'ECONOMY', 1200, 2),
(239, '5C', 'ECONOMY', 1200, 2),
(240, '5D', 'ECONOMY', 1200, 2),
(241, '5E', 'ECONOMY', 1200, 2),
(242, '6A', 'ECONOMY', 1200, 2),
(243, '6B', 'ECONOMY', 1200, 2),
(244, '6C', 'ECONOMY', 1200, 2),
(245, '6D', 'ECONOMY', 1200, 2),
(246, '6E', 'ECONOMY', 1200, 2),
(247, '7A', 'ECONOMY', 1200, 2),
(248, '7B', 'ECONOMY', 1200, 2),
(249, '7C', 'ECONOMY', 1200, 2),
(250, '7D', 'ECONOMY', 1200, 2),
(251, '7E', 'ECONOMY', 1200, 2),
(252, '8A', 'ECONOMY', 1200, 2),
(253, '8B', 'ECONOMY', 1200, 2),
(254, '8C', 'ECONOMY', 1200, 2),
(255, '8D', 'ECONOMY', 1200, 2),
(256, '8E', 'ECONOMY', 1200, 2),
(257, '9A', 'ECONOMY', 1200, 2),
(258, '9B', 'ECONOMY', 1200, 2),
(259, '9C', 'ECONOMY', 1200, 2),
(260, '9D', 'ECONOMY', 1200, 2),
(261, '9E', 'ECONOMY', 1200, 2),
(262, '10A', 'ECONOMY', 1200, 2),
(263, '10B', 'ECONOMY', 1200, 2),
(264, '10C', 'ECONOMY', 1200, 2),
(265, '10D', 'ECONOMY', 1200, 2),
(266, '10E', 'ECONOMY', 1200, 2),
(267, '11A', 'ECONOMY', 1200, 2),
(268, '11B', 'ECONOMY', 1200, 2),
(269, '11C', 'ECONOMY', 1200, 2),
(270, '11D', 'ECONOMY', 1200, 2),
(271, '11E', 'ECONOMY', 1200, 2),
(272, '12A', 'ECONOMY', 1200, 2),
(273, '12B', 'ECONOMY', 1200, 2),
(274, '12C', 'ECONOMY', 1200, 2),
(275, '12D', 'ECONOMY', 1200, 2),
(276, '12E', 'ECONOMY', 1200, 2),
(277, '13A', 'ECONOMY', 1200, 2),
(278, '13B', 'ECONOMY', 1200, 2),
(279, '13C', 'ECONOMY', 1200, 2),
(280, '13D', 'ECONOMY', 1200, 2),
(281, '13E', 'ECONOMY', 1200, 2),
(282, '14A', 'ECONOMY', 1200, 2),
(283, '14B', 'ECONOMY', 1200, 2),
(284, '14C', 'ECONOMY', 1200, 2),
(285, '14D', 'ECONOMY', 1200, 2),
(286, '14E', 'ECONOMY', 1200, 2),
(287, '1A', 'FIRSTCLASS', 10800, 3),
(288, '1B', 'FIRSTCLASS', 10800, 3),
(289, '1C', 'FIRSTCLASS', 10800, 3),
(290, '1D', 'FIRSTCLASS', 10800, 3),
(291, '1E', 'FIRSTCLASS', 10800, 3),
(292, '1F', 'FIRSTCLASS', 10800, 3),
(293, '1G', 'FIRSTCLASS', 10800, 3),
(294, '1H', 'FIRSTCLASS', 10800, 3),
(295, '1I', 'FIRSTCLASS', 10800, 3),
(296, '1J', 'FIRSTCLASS', 10800, 3),
(297, '2A', 'FIRSTCLASS', 10800, 3),
(298, '2B', 'FIRSTCLASS', 10800, 3),
(299, '2C', 'FIRSTCLASS', 10800, 3),
(300, '2D', 'FIRSTCLASS', 10800, 3),
(301, '2E', 'FIRSTCLASS', 10800, 3),
(302, '2F', 'FIRSTCLASS', 10800, 3),
(303, '2G', 'FIRSTCLASS', 10800, 3),
(304, '2H', 'FIRSTCLASS', 10800, 3),
(305, '2I', 'FIRSTCLASS', 10800, 3),
(306, '2J', 'FIRSTCLASS', 10800, 3),
(307, '3A', 'BUSINESS', 5400, 3),
(308, '3B', 'BUSINESS', 5400, 3),
(309, '3C', 'BUSINESS', 5400, 3),
(310, '3D', 'BUSINESS', 5400, 3),
(311, '3E', 'BUSINESS', 5400, 3),
(312, '3F', 'BUSINESS', 5400, 3),
(313, '3G', 'BUSINESS', 5400, 3),
(314, '3H', 'BUSINESS', 5400, 3),
(315, '3I', 'BUSINESS', 5400, 3),
(316, '3J', 'BUSINESS', 5400, 3),
(317, '4A', 'BUSINESS', 5400, 3),
(318, '4B', 'BUSINESS', 5400, 3),
(319, '4C', 'BUSINESS', 5400, 3),
(320, '4D', 'BUSINESS', 5400, 3),
(321, '4E', 'BUSINESS', 5400, 3),
(322, '4F', 'BUSINESS', 5400, 3),
(323, '4G', 'BUSINESS', 5400, 3),
(324, '4H', 'BUSINESS', 5400, 3),
(325, '4I', 'BUSINESS', 5400, 3),
(326, '4J', 'BUSINESS', 5400, 3),
(327, '5A', 'BUSINESS', 5400, 3),
(328, '5B', 'BUSINESS', 5400, 3),
(329, '5C', 'BUSINESS', 5400, 3),
(330, '5D', 'BUSINESS', 5400, 3),
(331, '5E', 'BUSINESS', 5400, 3),
(332, '5F', 'BUSINESS', 5400, 3),
(333, '5G', 'BUSINESS', 5400, 3),
(334, '5H', 'BUSINESS', 5400, 3),
(335, '5I', 'BUSINESS', 5400, 3),
(336, '5J', 'BUSINESS', 5400, 3),
(337, '6A', 'BUSINESS', 5400, 3),
(338, '6B', 'BUSINESS', 5400, 3),
(339, '6C', 'BUSINESS', 5400, 3),
(340, '6D', 'BUSINESS', 5400, 3),
(341, '6E', 'BUSINESS', 5400, 3),
(342, '6F', 'BUSINESS', 5400, 3),
(343, '6G', 'BUSINESS', 5400, 3),
(344, '6H', 'BUSINESS', 5400, 3),
(345, '6I', 'BUSINESS', 5400, 3),
(346, '6J', 'BUSINESS', 5400, 3),
(347, '7A', 'ECONOMY', 2700, 3),
(348, '7B', 'ECONOMY', 2700, 3),
(349, '7C', 'ECONOMY', 2700, 3),
(350, '7D', 'ECONOMY', 2700, 3),
(351, '7E', 'ECONOMY', 2700, 3),
(352, '7F', 'ECONOMY', 2700, 3),
(353, '7G', 'ECONOMY', 2700, 3),
(354, '7H', 'ECONOMY', 2700, 3),
(355, '7I', 'ECONOMY', 2700, 3),
(356, '7J', 'ECONOMY', 2700, 3),
(357, '8A', 'ECONOMY', 2700, 3),
(358, '8B', 'ECONOMY', 2700, 3),
(359, '8C', 'ECONOMY', 2700, 3),
(360, '8D', 'ECONOMY', 2700, 3),
(361, '8E', 'ECONOMY', 2700, 3),
(362, '8F', 'ECONOMY', 2700, 3),
(363, '8G', 'ECONOMY', 2700, 3),
(364, '8H', 'ECONOMY', 2700, 3),
(365, '8I', 'ECONOMY', 2700, 3),
(366, '8J', 'ECONOMY', 2700, 3),
(367, '9A', 'ECONOMY', 2700, 3),
(368, '9B', 'ECONOMY', 2700, 3),
(369, '9C', 'ECONOMY', 2700, 3),
(370, '9D', 'ECONOMY', 2700, 3),
(371, '9E', 'ECONOMY', 2700, 3),
(372, '9F', 'ECONOMY', 2700, 3),
(373, '9G', 'ECONOMY', 2700, 3),
(374, '9H', 'ECONOMY', 2700, 3),
(375, '9I', 'ECONOMY', 2700, 3),
(376, '9J', 'ECONOMY', 2700, 3),
(377, '10A', 'ECONOMY', 2700, 3),
(378, '10B', 'ECONOMY', 2700, 3),
(379, '10C', 'ECONOMY', 2700, 3),
(380, '10D', 'ECONOMY', 2700, 3),
(381, '10E', 'ECONOMY', 2700, 3),
(382, '10F', 'ECONOMY', 2700, 3),
(383, '10G', 'ECONOMY', 2700, 3),
(384, '10H', 'ECONOMY', 2700, 3),
(385, '10I', 'ECONOMY', 2700, 3),
(386, '10J', 'ECONOMY', 2700, 3),
(387, '11A', 'ECONOMY', 2700, 3),
(388, '11B', 'ECONOMY', 2700, 3),
(389, '11C', 'ECONOMY', 2700, 3),
(390, '11D', 'ECONOMY', 2700, 3),
(391, '11E', 'ECONOMY', 2700, 3),
(392, '11F', 'ECONOMY', 2700, 3),
(393, '11G', 'ECONOMY', 2700, 3),
(394, '11H', 'ECONOMY', 2700, 3),
(395, '11I', 'ECONOMY', 2700, 3),
(396, '11J', 'ECONOMY', 2700, 3),
(397, '12A', 'ECONOMY', 2700, 3),
(398, '12B', 'ECONOMY', 2700, 3),
(399, '12C', 'ECONOMY', 2700, 3),
(400, '12D', 'ECONOMY', 2700, 3),
(401, '12E', 'ECONOMY', 2700, 3),
(402, '12F', 'ECONOMY', 2700, 3),
(403, '12G', 'ECONOMY', 2700, 3),
(404, '12H', 'ECONOMY', 2700, 3),
(405, '12I', 'ECONOMY', 2700, 3),
(406, '12J', 'ECONOMY', 2700, 3),
(407, '13A', 'ECONOMY', 2700, 3),
(408, '13B', 'ECONOMY', 2700, 3),
(409, '13C', 'ECONOMY', 2700, 3),
(410, '13D', 'ECONOMY', 2700, 3),
(411, '13E', 'ECONOMY', 2700, 3),
(412, '13F', 'ECONOMY', 2700, 3),
(413, '13G', 'ECONOMY', 2700, 3),
(414, '13H', 'ECONOMY', 2700, 3),
(415, '13I', 'ECONOMY', 2700, 3),
(416, '13J', 'ECONOMY', 2700, 3),
(417, '14A', 'ECONOMY', 2700, 3),
(418, '14B', 'ECONOMY', 2700, 3),
(419, '14C', 'ECONOMY', 2700, 3),
(420, '14D', 'ECONOMY', 2700, 3),
(421, '14E', 'ECONOMY', 2700, 3),
(422, '14F', 'ECONOMY', 2700, 3),
(423, '14G', 'ECONOMY', 2700, 3),
(424, '14H', 'ECONOMY', 2700, 3),
(425, '14I', 'ECONOMY', 2700, 3),
(426, '14J', 'ECONOMY', 2700, 3),
(427, '15A', 'ECONOMY', 2700, 3),
(428, '15B', 'ECONOMY', 2700, 3),
(429, '15C', 'ECONOMY', 2700, 3),
(430, '15D', 'ECONOMY', 2700, 3),
(431, '15E', 'ECONOMY', 2700, 3);


ALTER TABLE `airplane`
  ADD PRIMARY KEY (`airplane_id`);

ALTER TABLE `airport`
  ADD PRIMARY KEY (`airport_id`);

ALTER TABLE `baggage`
  ADD PRIMARY KEY (`baggage_id`),
  ADD KEY `fk_passenger_id` (`passenger_id`);

ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `fk_client_id` (`client_id`),
  ADD KEY `fk_flight_id` (`flight_id`);

ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

ALTER TABLE `flight`
  ADD PRIMARY KEY (`flight_id`),
  ADD KEY `fk_airplane_id` (`airplane_id`),
  ADD KEY `fk_depart_airport_id` (`depart_airport_id`),
  ADD KEY `fk_arrive_airport_id` (`arrive_airport_id`);

ALTER TABLE `passenger`
  ADD PRIMARY KEY (`passenger_id`),
  ADD KEY `fk_seat_id` (`seat_id`),
  ADD KEY `fk_booking_passenger_id` (`booking_id`),
  ADD KEY `fk_flight_id_passenger` (`flight_id`);

ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fk_booking_id` (`booking_id`);

ALTER TABLE `seat`
  ADD PRIMARY KEY (`seat_id`),
  ADD KEY `fk_airplane_seat_id` (`airplane_id`);


ALTER TABLE `airplane`
  MODIFY `airplane_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `airport`
  MODIFY `airport_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `baggage`
  MODIFY `baggage_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

ALTER TABLE `flight`
  MODIFY `flight_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `passenger`
  MODIFY `passenger_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `seat`
  MODIFY `seat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=432;


ALTER TABLE `baggage`
  ADD CONSTRAINT `fk_passenger_id` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`passenger_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `booking`
  ADD CONSTRAINT `fk_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_flight_id` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `flight`
  ADD CONSTRAINT `fk_airplane_id` FOREIGN KEY (`airplane_id`) REFERENCES `airplane` (`airplane_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_arrive_airport_id` FOREIGN KEY (`arrive_airport_id`) REFERENCES `airport` (`airport_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_depart_airport_id` FOREIGN KEY (`depart_airport_id`) REFERENCES `airport` (`airport_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `passenger`
  ADD CONSTRAINT `fk_booking_passenger_id` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_flight_id_passenger` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seat_id` FOREIGN KEY (`seat_id`) REFERENCES `seat` (`seat_id`) ON DELETE CASCADE;

ALTER TABLE `payment`
  ADD CONSTRAINT `fk_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE;

ALTER TABLE `seat`
  ADD CONSTRAINT `fk_airplane_seat_id` FOREIGN KEY (`airplane_id`) REFERENCES `airplane` (`airplane_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
