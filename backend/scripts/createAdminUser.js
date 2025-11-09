"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("argon2"));
const crypto = __importStar(require("crypto"));
async function generateAdminUserSQL() {
    const adminData = {
        username: 'admin',
        password: 'admin123',
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
        card_no: '1234567890123456',
        four_digit: '0000',
        payment_type: 'VISA',
        role: 'admin'
    };
    try {
        const hashedPassword = await argon2_1.default.hash(adminData.password);
        console.log('Hashed Password:', hashedPassword);
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
    }
    catch (error) {
        console.error('Error generating admin user:', error);
    }
}
generateAdminUserSQL();
//# sourceMappingURL=createAdminUser.js.map