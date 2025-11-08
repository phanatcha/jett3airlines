import argon2 from 'argon2';
import * as crypto from 'crypto';

/**
 * Script to generate SQL for creating an admin user
 * Run with: npx ts-node scripts/createAdminUser.ts
 */

async function generateAdminUserSQL() {
  const adminData = {
    username: 'admin',
    password: 'admin123', // Change this to your desired admin password
    email: 'admin@jett3airlines.com',
    phone_no: '+66812345678',
    firstname: 'Admin',
    lastname: 'User',
    dob: '1990-01-01',
    street: '123 Admin Street',
    city: 'Bangkok',
    province: 'Bangkok',
    country: 'Thailand',
    postalcode: '10100',
    card_no: '1234567890123456', // Dummy card number
    four_digit: '0000',
    payment_type: 'VISA',
    role: 'admin'
  };

  try {
    // Hash password with argon2
    const hashedPassword = await argon2.hash(adminData.password);
    console.log('Hashed Password:', hashedPassword);

    // Encrypt card number (simple encryption for demo)
    const encryptionKey = process.env.ENCRYPTION_KEY || 'airline_encryption_key_2024_secure_random_string';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedCard = cipher.update(adminData.card_no, 'utf8', 'hex');
    encryptedCard += cipher.final('hex');
    const combinedCard = iv.toString('hex') + ':' + encryptedCard;
    const cardBuffer = Buffer.from(combinedCard, 'utf8');

    console.log('\n=== SQL to create admin user ===\n');
    console.log(`
INSERT INTO \`client\` (
  \`username\`, 
  \`password\`, 
  \`email\`, 
  \`phone_no\`, 
  \`firstname\`, 
  \`lastname\`, 
  \`dob\`, 
  \`street\`, 
  \`city\`, 
  \`province\`, 
  \`Country\`, 
  \`postalcode\`, 
  \`card_no\`, 
  \`four_digit\`, 
  \`payment_type\`, 
  \`role\`
) VALUES (
  '${adminData.username}',
  '${hashedPassword}',
  '${adminData.email}',
  '${adminData.phone_no}',
  '${adminData.firstname}',
  '${adminData.lastname}',
  '${adminData.dob}',
  '${adminData.street}',
  '${adminData.city}',
  '${adminData.province}',
  '${adminData.country}',
  '${adminData.postalcode}',
  0x${cardBuffer.toString('hex')},
  '${adminData.four_digit}',
  '${adminData.payment_type}',
  '${adminData.role}'
);
    `);

    console.log('\n=== Admin Credentials ===');
    console.log(`Username: ${adminData.username}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Email: ${adminData.email}`);
    console.log('\nIMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('Error generating admin user:', error);
  }
}

generateAdminUserSQL();
