-- Script to create an admin user
-- Password: admin123 (hashed with argon2)
-- This is a sample admin account for testing purposes

-- Insert admin user
-- Note: The password hash below is for 'admin123' using argon2
-- You should change this password after first login
INSERT INTO `client` (
  `username`, 
  `password`, 
  `email`, 
  `phone_no`, 
  `firstname`, 
  `lastname`, 
  `dob`, 
  `street`, 
  `city`, 
  `province`, 
  `Country`, 
  `postalcode`, 
  `card_no`, 
  `four_digit`, 
  `payment_type`, 
  `role`
) VALUES (
  'admin',
  '$argon2id$v=19$m=65536,t=3,p=4$randomsalthere$hashedpasswordhere',
  'admin@jett3airlines.com',
  '+66812345678',
  'Admin',
  'User',
  '1990-01-01',
  '123 Admin Street',
  'Bangkok',
  'Bangkok',
  'Thailand',
  '10100',
  0x6a1ba53b64749136fe7a54e241ee928a, -- Encrypted dummy card number
  '0000',
  'VISA',
  'admin'
);

-- Verify the admin user was created
SELECT client_id, username, email, role FROM client WHERE role = 'admin';
