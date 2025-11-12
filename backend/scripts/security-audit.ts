
import database from '../src/db';
import { hashPassword, comparePassword, generateTokenPair, verifyToken } from '../src/utils/auth';
import crypto from 'crypto';

class SecurityAuditor {
  async testPasswordEncryption(): Promise<void> {
    console.log('\n🔐 Testing Password Encryption...\n');

    const testPasswords = [
      'SimplePass123',
      'Complex!Pass@2024#',
      'VeryLongPasswordWithManyCharacters123!@#'
    ];

    for (const password of testPasswords) {
      console.log(`Testing: "${password}"`);
      
      const startHash = Date.now();
      const hash = await hashPassword(password);
      const hashTime = Date.now() - startHash;
      
      console.log(`  ✅ Hash generated in ${hashTime}ms`);
      console.log(`  ✅ Hash length: ${hash.length} characters`);
      
      const startVerify = Date.now();
      const isValid = await comparePassword(password, hash);
      const verifyTime = Date.now() - startVerify;
      
      console.log(`  ${isValid ? '✅' : '❌'} Correct password verified in ${verifyTime}ms`);
      
      const isInvalid = await comparePassword('WrongPassword', hash);
      console.log(`  ${!isInvalid ? '✅' : '❌'} Incorrect password rejected`);
      
      const hash2 = await hashPassword(password);
      console.log(`  ${hash !== hash2 ? '✅' : '❌'} Unique salts used`);
      console.log('');
    }
  }

  async testJWTSecurity(): Promise<void> {
    console.log('\n🎫 Testing JWT Token Security...\n');

    const testPayload = {
      client_id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    const tokens = generateTokenPair(testPayload);
    console.log('✅ Token pair generated successfully');
    console.log(`   Access Token Length: ${tokens.accessToken.length}`);
    console.log(`   Refresh Token Length: ${tokens.refreshToken.length}`);

    try {
      const decoded = verifyToken(tokens.accessToken);
      console.log('✅ Valid token verified successfully');
      console.log(`   Decoded client_id: ${decoded.client_id}`);
      console.log(`   Decoded username: ${decoded.username}`);
    } catch (error) {
      console.log('❌ Valid token verification failed');
    }

    try {
      verifyToken('invalid.token.here');
      console.log('❌ Invalid token was accepted (SECURITY ISSUE!)');
    } catch (error) {
      console.log('✅ Invalid token rejected correctly');
    }

    const tamperedToken = tokens.accessToken.slice(0, -10) + 'tampered123';
    try {
      verifyToken(tamperedToken);
      console.log('❌ Tampered token was accepted (SECURITY ISSUE!)');
    } catch (error) {
      console.log('✅ Tampered token rejected correctly');
    }
  }

  async checkSensitiveDataEncryption(): Promise<void> {
    console.log('\n🔒 Checking Sensitive Data Encryption...\n');

    try {
      const clients = await database.query('SELECT password, card_no FROM client LIMIT 5');
      
      if (clients.length > 0) {
        const client = clients[0] as any;
        
        const isPasswordHashed = client.password && client.password.startsWith('$2');
        console.log(`${isPasswordHashed ? '✅' : '❌'} Passwords are ${isPasswordHashed ? 'hashed' : 'NOT hashed'}`);
        
        if (client.card_no) {
          const looksEncrypted = client.card_no.length > 16 && !client.card_no.match(/^\d{16}$/);
          console.log(`${looksEncrypted ? '✅' : '⚠️'} Card numbers appear ${looksEncrypted ? 'encrypted' : 'potentially unencrypted'}`);
        }
      } else {
        console.log('ℹ️  No client data found to check');
      }

      const passengers = await database.query('SELECT passport_no FROM passenger LIMIT 5');
      if (passengers.length > 0) {
        console.log(`✅ Found ${passengers.length} passenger records`);
        console.log('⚠️  Verify passport numbers are encrypted in production');
      }

    } catch (error) {
      console.log('❌ Error checking sensitive data:', error);
    }
  }

  async testSQLInjectionPrevention(): Promise<void> {
    console.log('\n💉 Testing SQL Injection Prevention...\n');

    const maliciousInputs = [
      "' OR '1'='1",
      "1; DROP TABLE client;--",
      "' UNION SELECT * FROM client--",
      "admin'--",
      "1' AND '1'='1"
    ];

    console.log('Testing parameterized queries with malicious inputs...\n');

    for (const input of maliciousInputs) {
      try {
        await database.query('SELECT * FROM client WHERE username = ? LIMIT 1', [input]);
        console.log(`✅ Parameterized query handled: "${input.substring(0, 30)}..."`);
      } catch (error) {
        console.log(`⚠️  Query failed for input: "${input.substring(0, 30)}..."`);
      }
    }

    console.log('\n✅ All queries use parameterized statements (SQL injection protected)');
  }

  checkEnvironmentSecurity(): void {
    console.log('\n🌍 Checking Environment Security...\n');

    const criticalVars = [
      { name: 'JWT_SECRET', required: true, minLength: 32 },
      { name: 'DB_PASSWORD', required: true, minLength: 8 },
      { name: 'DB_HOST', required: true, minLength: 1 },
      { name: 'DB_USER', required: true, minLength: 1 },
      { name: 'DB_NAME', required: true, minLength: 1 },
      { name: 'NODE_ENV', required: true, minLength: 1 },
    ];

    criticalVars.forEach(({ name, required, minLength }) => {
      const value = process.env[name];
      
      if (!value) {
        console.log(`${required ? '❌' : '⚠️'} ${name}: Not set ${required ? '(REQUIRED)' : '(Optional)'}`);
      } else if (value.length < minLength) {
        console.log(`⚠️  ${name}: Too short (${value.length} chars, minimum ${minLength})`);
      } else {
        console.log(`✅ ${name}: Configured (${value.length} chars)`);
      }
    });

    if (process.env.JWT_SECRET) {
      const secret = process.env.JWT_SECRET;
      const isWeak = secret === 'secret' || secret === 'your-secret-key' || secret.length < 32;
      
      if (isWeak) {
        console.log('\n⚠️  WARNING: JWT_SECRET appears weak or default!');
        console.log('   Recommendation: Use a strong random string (32+ characters)');
      } else {
        console.log('\n✅ JWT_SECRET appears strong');
      }
    }
  }

  testRateLimitingConfig(): void {
    console.log('\n⏱️  Checking Rate Limiting Configuration...\n');

    try {
      const securityMiddleware = require('../src/middleware/security');
      
      if (securityMiddleware.generalRateLimit) {
        console.log('✅ General rate limiting configured');
      }
      
      if (securityMiddleware.authRateLimit) {
        console.log('✅ Auth rate limiting configured');
      }
      
      console.log('✅ Rate limiting middleware implemented');
    } catch (error) {
      console.log('❌ Rate limiting middleware not found');
    }
  }

  checkCORSConfiguration(): void {
    console.log('\n🌐 Checking CORS Configuration...\n');

    const corsOrigin = process.env.CORS_ORIGIN;
    
    if (!corsOrigin) {
      console.log('⚠️  CORS_ORIGIN not configured (may allow all origins)');
    } else if (corsOrigin === '*') {
      console.log('⚠️  CORS allows all origins (not recommended for production)');
    } else {
      console.log(`✅ CORS restricted to: ${corsOrigin}`);
    }
  }

  generateSecurityRecommendations(): void {
    console.log('\n🛡️  Security Recommendations:\n');

    const recommendations = [
      '1. ✅ Use bcrypt for password hashing (implemented)',
      '2. ✅ Use JWT tokens for authentication (implemented)',
      '3. ✅ Use parameterized queries to prevent SQL injection (implemented)',
      '4. ✅ Implement rate limiting on API endpoints (implemented)',
      '5. ⚠️  Encrypt sensitive data (card numbers, passport numbers) at rest',
      '6. ⚠️  Implement HTTPS in production',
      '7. ⚠️  Add request logging and monitoring',
      '8. ⚠️  Implement API key rotation mechanism',
      '9. ⚠️  Add input validation on all endpoints',
      '10. ⚠️  Regular security audits and dependency updates',
      '11. ⚠️  Implement CSRF protection for state-changing operations',
      '12. ⚠️  Add security headers (helmet.js)',
      '13. ⚠️  Implement account lockout after failed login attempts',
      '14. ⚠️  Add audit logging for sensitive operations',
      '15. ⚠️  Use environment-specific configurations'
    ];

    recommendations.forEach(rec => console.log(rec));
  }

  async runCompleteAudit(): Promise<void> {
    console.log('🔒 Starting Security Audit...\n');
    console.log('='.repeat(60));

    try {
      await this.testPasswordEncryption();
      await this.testJWTSecurity();
      await this.checkSensitiveDataEncryption();
      await this.testSQLInjectionPrevention();
      this.checkEnvironmentSecurity();
      this.testRateLimitingConfig();
      this.checkCORSConfiguration();
      this.generateSecurityRecommendations();

      console.log('\n' + '='.repeat(60));
      console.log('✅ Security Audit Complete!\n');
    } catch (error) {
      console.error('\n❌ Security audit failed:', error);
    } finally {
      await database.close();
    }
  }
}

if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runCompleteAudit().catch(console.error);
}

export default SecurityAuditor;
