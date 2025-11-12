import database from '../src/db';

async function fixFlightNumbers() {
  try {
    const flights = await database.query(
      'SELECT flight_id, depart_airport_id, arrive_airport_id FROM flight WHERE flight_no IS NULL'
    );
    
    console.log(`Found ${flights.length} flights without flight numbers`);
    
    for (const flight of flights as any[]) {
      const flightNo = `JT${Math.floor(Math.random() * 9000) + 1000}`;
      
      await database.query(
        'UPDATE flight SET flight_no = ? WHERE flight_id = ?',
        [flightNo, flight.flight_id]
      );
      
      console.log(`✅ Updated flight ${flight.flight_id}: ${flightNo}`);
    }
    
    console.log('\n🎉 All flight numbers updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing flight numbers:', error);
    throw error;
  } finally {
    await database.close();
  }
}

fixFlightNumbers()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
