import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const testFlights = [
  { flight_id: 100, depart_when: '2025-12-10 08:00:00', arrive_when: '2025-12-10 16:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-100' },
  { flight_id: 101, depart_when: '2025-12-10 14:00:00', arrive_when: '2025-12-10 22:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-101' },
  { flight_id: 102, depart_when: '2025-12-10 22:00:00', arrive_when: '2025-12-11 06:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-102' },
  { flight_id: 103, depart_when: '2025-12-15 07:30:00', arrive_when: '2025-12-15 16:00:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-103' },
  { flight_id: 104, depart_when: '2025-12-15 13:00:00', arrive_when: '2025-12-15 21:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-104' },
  { flight_id: 105, depart_when: '2025-12-15 19:00:00', arrive_when: '2025-12-16 03:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-105' },
  { flight_id: 106, depart_when: '2025-12-20 09:00:00', arrive_when: '2025-12-20 17:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-106' },
  { flight_id: 107, depart_when: '2025-12-20 15:00:00', arrive_when: '2025-12-20 23:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-107' },
  { flight_id: 108, depart_when: '2025-12-20 23:00:00', arrive_when: '2025-12-21 07:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 2, flight_no: 'JT3-108' },
  { flight_id: 150, depart_when: '2025-12-13 06:00:00', arrive_when: '2025-12-13 20:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-150' },
  { flight_id: 151, depart_when: '2025-12-13 12:00:00', arrive_when: '2025-12-14 02:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-151' },
  { flight_id: 152, depart_when: '2025-12-13 18:00:00', arrive_when: '2025-12-14 08:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-152' },
  { flight_id: 153, depart_when: '2025-12-13 23:00:00', arrive_when: '2025-12-14 13:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-153' },
  { flight_id: 154, depart_when: '2025-12-18 07:00:00', arrive_when: '2025-12-18 21:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-154' },
  { flight_id: 155, depart_when: '2025-12-18 13:00:00', arrive_when: '2025-12-19 03:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-155' },
  { flight_id: 156, depart_when: '2025-12-18 19:00:00', arrive_when: '2025-12-19 09:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-156' },
  { flight_id: 157, depart_when: '2025-12-23 08:00:00', arrive_when: '2025-12-23 22:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-157' },
  { flight_id: 158, depart_when: '2025-12-23 14:00:00', arrive_when: '2025-12-24 04:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-158' },
  { flight_id: 159, depart_when: '2025-12-23 20:00:00', arrive_when: '2025-12-24 10:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-159' },
  { flight_id: 160, depart_when: '2025-12-25 09:00:00', arrive_when: '2025-12-25 23:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-160' },
  { flight_id: 161, depart_when: '2025-12-25 15:00:00', arrive_when: '2025-12-26 05:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-161' },
  { flight_id: 162, depart_when: '2025-12-13 10:00:00', arrive_when: '2025-12-14 00:30:00', status: 'Delayed', airplane_id: 1, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-162' },
  { flight_id: 163, depart_when: '2025-12-13 16:00:00', arrive_when: '2025-12-14 06:30:00', status: 'Cancelled', airplane_id: 3, depart_airport_id: 2, arrive_airport_id: 1, flight_no: 'JT3-163' },
  { flight_id: 170, depart_when: '2025-12-10 10:00:00', arrive_when: '2025-12-10 17:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 1, arrive_airport_id: 3, flight_no: 'JT3-170' },
  { flight_id: 171, depart_when: '2025-12-15 11:00:00', arrive_when: '2025-12-15 18:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 1, arrive_airport_id: 3, flight_no: 'JT3-171' },
  { flight_id: 172, depart_when: '2025-12-13 09:00:00', arrive_when: '2025-12-13 13:30:00', status: 'Scheduled', airplane_id: 1, depart_airport_id: 3, arrive_airport_id: 1, flight_no: 'JT3-172' },
  { flight_id: 173, depart_when: '2025-12-18 10:00:00', arrive_when: '2025-12-18 14:30:00', status: 'Scheduled', airplane_id: 3, depart_airport_id: 3, arrive_airport_id: 1, flight_no: 'JT3-173' },
  { flight_id: 174, depart_when: '2025-12-10 08:00:00', arrive_when: '2025-12-10 10:30:00', status: 'Scheduled', airplane_id: 2, depart_airport_id: 1, arrive_airport_id: 6, flight_no: 'JT3-174' },
  { flight_id: 175, depart_when: '2025-12-15 14:00:00', arrive_when: '2025-12-15 16:30:00', status: 'Scheduled', airplane_id: 2, depart_airport_id: 1, arrive_airport_id: 6, flight_no: 'JT3-175' },
  { flight_id: 176, depart_when: '2025-12-13 11:00:00', arrive_when: '2025-12-13 13:30:00', status: 'Scheduled', airplane_id: 2, depart_airport_id: 6, arrive_airport_id: 1, flight_no: 'JT3-176' },
  { flight_id: 177, depart_when: '2025-12-18 17:00:00', arrive_when: '2025-12-18 19:30:00', status: 'Scheduled', airplane_id: 2, depart_airport_id: 6, arrive_airport_id: 1, flight_no: 'JT3-177' },
];

async function addTestFlights() {
  let connection: mysql.PoolConnection | undefined;
  let pool: mysql.Pool | undefined;

  try {
    console.log('🔌 Connecting to database...');
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jett3_airline',
    });
    
    connection = await pool.getConnection();

    console.log('✅ Connected to database');

    console.log('🗑️  Removing old test flights...');
    await connection.execute('DELETE FROM flight WHERE flight_id BETWEEN 100 AND 199');

    console.log('📝 Adding new test flights...');
    
    for (const flight of testFlights) {
      await connection.execute(
        `INSERT INTO flight (flight_id, depart_when, arrive_when, status, airplane_id, depart_airport_id, arrive_airport_id, flight_no) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          flight.flight_id,
          flight.depart_when,
          flight.arrive_when,
          flight.status,
          flight.airplane_id,
          flight.depart_airport_id,
          flight.arrive_airport_id,
          flight.flight_no,
        ]
      );
    }

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM flight');
    const totalFlights = (rows as any)[0].count;

    console.log('✅ Test flights added successfully!');
    console.log(`📊 Total flights in database: ${totalFlights}`);
    console.log('\n📅 Test Data Available:');
    console.log('  Departure (BKK → BER): Dec 10, 15, 20, 2025');
    console.log('  Return (BER → BKK): Dec 13, 18, 23, 25, 2025');
    console.log('  Other routes: BKK ↔ Tokyo, BKK ↔ Singapore');
    console.log('\n🧪 To test:');
    console.log('  1. Search for round-trip: BKK → BER');
    console.log('  2. Departure: Dec 10, 2025');
    console.log('  3. Return: Dec 13, 2025');
    console.log('  4. Select a departure flight');
    console.log('  5. You should see return flight options!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    if (pool) {
      await pool.end();
    }
  }
}

addTestFlights();
