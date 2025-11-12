import { BookingModel } from './src/models/Booking';

const bookingModel = new BookingModel();

const testData = {
  flight_id: 2904,
  support: 'no',
  fasttrack: 'no',
  passengers: [
    {
      firstname: 'Napat',
      lastname: 'Pankaew',
      gender: 'Male',
      passport_no: 'TEMP766977190',
      nationality: 'Thailand',
      dob: '1990-01-01',
      seat_id: 259,
      weight_limit: 20,
      phone_no: '66131231232'
    },
    {
      firstname: 'Napat',
      lastname: 'Pankaew',
      gender: 'Male',
      passport_no: 'TEMP766977201',
      nationality: 'Thailand',
      dob: '1990-01-01',
      seat_id: 247,
      weight_limit: 20
      // NO phone_no
    }
  ]
};

async function test() {
  try {
    console.log('Testing booking creation with data:', JSON.stringify(testData, null, 2));
    const bookingId = await bookingModel.createBookingWithPassengers(testData, 24);
    console.log('✅ Booking created successfully! ID:', bookingId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

test();
