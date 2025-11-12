const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixSeatPrices() {
  let connection;
  
  try {
    console.log('\n=== FIXING SEAT PRICES ===');
    console.log('Current prices are 10x too high!\n');
    console.log('New pricing structure:');
    console.log('  Economy:          $300');
    console.log('  Premium Economy:  $600');
    console.log('  Business:         $1200');
    console.log('  First Class:      $2000\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jett3_airline',
    });
    
    console.log('Applying price fix...');
    
    await connection.execute(`
      UPDATE seat 
      SET price = CASE 
          WHEN class IN ('Economy', 'ECONOMY') THEN 300
          WHEN class IN ('Premium Economy', 'PREMIUM ECONOMY', 'PREMIUM_ECONOMY') THEN 600
          WHEN class IN ('Business', 'BUSINESS') THEN 1200
          WHEN class IN ('First Class', 'FIRSTCLASS', 'FIRST CLASS', 'FIRST_CLASS') THEN 2000
          ELSE 300
      END
    `);
    
    const [summary] = await connection.execute(`
      SELECT 
        class,
        COUNT(*) as seat_count,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM seat
      GROUP BY class
      ORDER BY avg_price
    `);
    
    console.log('\n✅ Seat prices fixed successfully!\n');
    console.log('Price Summary:');
    console.table(summary);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixSeatPrices();
