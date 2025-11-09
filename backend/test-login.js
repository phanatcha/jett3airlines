const argon2 = require('argon2');
const mysql = require('mysql2/promise');

async function testLogin() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'jett3_airline'
    });

    console.log('Connected to database');

    // Get user
    const [rows] = await connection.execute(
      'SELECT * FROM client WHERE username = ?',
      ['alice.w']
    );

    if (rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = rows[0];
    console.log('User found:', user.username);
    console.log('Password hash:', user.password.substring(0, 30) + '...');

    // Test password
    const isValid = await argon2.verify(user.password, 'password123');
    console.log('Password valid:', isValid);

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();
