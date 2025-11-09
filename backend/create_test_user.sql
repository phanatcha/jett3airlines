-- Create a test user (non-admin) for testing
-- Username: testuser
-- Password: Test123!
-- Email: test@jett3airlines.com

INSERT INTO client (
    username,
    password,
    email,
    first_name,
    last_name,
    gender,
    date_of_birth,
    phone_number,
    nationality,
    is_admin,
    created_at
) VALUES (
    'testuser',
    '$2b$10$YourHashedPasswordHere',  -- This will be replaced by the script
    'test@jett3airlines.com',
    'Test',
    'User',
    'Other',
    '1990-01-01',
    '+1234567890',
    'United States',
    0,  -- NOT an admin
    NOW()
);

-- Display the created user
SELECT client_id, username, email, first_name, last_name, is_admin 
FROM client 
WHERE username = 'testuser';
