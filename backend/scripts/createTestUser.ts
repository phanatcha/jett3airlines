import argon2 from 'argon2';
import database from '../src/db';

async function createTestUser() {
  const db = database;
  
  try {
    const password = 'Test123!';
    const hashedPassword = await argon2.hash(password);
    
    const existingUser = await db.query(
      'SELECT * FROM client WHERE username = ? OR email = ?',
      ['testuser', 'test@jett3airlines.com']
    );
    
    if (existingUser.length > 0) {
      console.log('❌ Test user already exists!');
      console.log('Username: testuser');
      console.log('Email: test@jett3airlines.com');
      console.log('\nYou can use these credentials to login.');
      return;
    }
    
    const result = await db.query(
      `INSERT INTO client (
        username,
        password,
        email,
        phone_no,
        firstname,
        lastname,
        dob,
        Country,
        role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'testuser',
        hashedPassword,
        'test@jett3airlines.com',
        '+1234567890',
        'Test',
        'User',
        '1990-01-01',
        'United States',
        'user'
      ]
    );
    
    console.log('✅ Test user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: testuser');
    console.log('Password: Test123!');
    console.log('Email:    test@jett3airlines.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👤 User Details:');
    console.log('Name:     Test User');
    console.log('DOB:      1990-01-01');
    console.log('Phone:    +1234567890');
    console.log('Country:  United States');
    console.log('Role:     user (Regular User)');
    console.log('\n🎉 You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await db.close();
  }
}

createTestUser()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
