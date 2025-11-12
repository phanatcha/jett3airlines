
import database from '../src/db';
import { hashPassword, comparePassword } from '../src/utils/auth';

interface PerformanceMetrics {
  queryTime: number;
  success: boolean;
  error?: string;
}

class PerformanceAuditor {
  private results: { [key: string]: PerformanceMetrics[] } = {};

  async testDatabasePerformance(): Promise<void> {
    console.log('\n📊 Testing Database Performance...\n');

    await this.measureQuery('Simple SELECT', async () => {
      await database.query('SELECT 1');
    });

    await this.measureQuery('Complex JOIN (Flights)', async () => {
      await database.query(`
        SELECT f.*, 
               da.name as depart_airport_name,
               aa.name as arrive_airport_name,
               ap.model as airplane_model
        FROM flight f
        LEFT JOIN airport da ON f.depart_airport_id = da.airport_id
        LEFT JOIN airport aa ON f.arrive_airport_id = aa.airport_id
        LEFT JOIN airplane ap ON f.airplane_id = ap.airplane_id
        LIMIT 10
      `);
    });

    await this.measureQuery('Booking with Passengers', async () => {
      await database.query(`
        SELECT b.*, p.*
        FROM booking b
        LEFT JOIN passenger p ON b.booking_id = p.booking_id
        LIMIT 10
      `);
    });

    await this.measureQuery('Aggregation (Booking Count)', async () => {
      await database.query(`
        SELECT client_id, COUNT(*) as booking_count
        FROM booking
        GROUP BY client_id
        LIMIT 10
      `);
    });

    this.printResults('Database Queries');
  }

  async testEncryptionPerformance(): Promise<void> {
    console.log('\n🔐 Testing Encryption Performance...\n');

    const testPassword = 'TestPassword123!';

    await this.measureQuery('Password Hashing (bcrypt)', async () => {
      await hashPassword(testPassword);
    });

    const hashedPassword = await hashPassword(testPassword);
    await this.measureQuery('Password Comparison (bcrypt)', async () => {
      await comparePassword(testPassword, hashedPassword);
    });

    this.printResults('Encryption Operations');
  }

  async validateDatabaseIndexes(): Promise<void> {
    console.log('\n📑 Validating Database Indexes...\n');

    try {
      const tables = ['flight', 'booking', 'passenger', 'client', 'payment'];
      
      for (const table of tables) {
        const indexes = await database.query(`SHOW INDEX FROM ${table}`);
        console.log(`✅ ${table}: ${indexes.length} indexes found`);
        
        indexes.forEach((idx: any) => {
          console.log(`   - ${idx.Key_name} on ${idx.Column_name}`);
        });
      }
    } catch (error) {
      console.error('❌ Error checking indexes:', error);
    }
  }

  async checkConnectionPool(): Promise<void> {
    console.log('\n🔌 Checking Connection Pool Health...\n');

    const stats = database.getPoolStats();
    console.log('Connection Pool Statistics:');
    console.log(`  Total Connections: ${stats.totalConnections}`);
    console.log(`  Active Connections: ${stats.activeConnections}`);
    console.log(`  Free Connections: ${stats.freeConnections}`);
    console.log(`  Queued Requests: ${stats.queuedRequests}`);
  }

  async testConcurrentQueries(): Promise<void> {
    console.log('\n⚡ Testing Concurrent Query Performance...\n');

    const concurrentQueries = 10;
    const startTime = Date.now();

    const promises = Array(concurrentQueries).fill(null).map(() => 
      database.query('SELECT * FROM flight LIMIT 1')
    );

    try {
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / concurrentQueries;

      console.log(`✅ Executed ${concurrentQueries} concurrent queries`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Average Time: ${avgTime.toFixed(2)}ms`);
      console.log(`   Queries/Second: ${(1000 / avgTime).toFixed(2)}`);
    } catch (error) {
      console.error('❌ Concurrent query test failed:', error);
    }
  }

  async validateSecurityMeasures(): Promise<void> {
    console.log('\n🛡️  Validating Security Measures...\n');

    const checks = [
      { name: 'JWT Secret', check: () => !!process.env.JWT_SECRET },
      { name: 'Database Password', check: () => !!process.env.DB_PASSWORD },
      { name: 'Node Environment', check: () => !!process.env.NODE_ENV },
      { name: 'CORS Origin', check: () => !!process.env.CORS_ORIGIN },
    ];

    checks.forEach(({ name, check }) => {
      const result = check();
      console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'Configured' : 'Missing'}`);
    });

    console.log('\n🔒 Password Security:');
    const testPassword = 'Test123!';
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    
    console.log(`✅ Unique salts: ${hash1 !== hash2 ? 'Yes' : 'No'}`);
    console.log(`✅ Hash length: ${hash1.length} characters`);
  }

  generateRecommendations(): void {
    console.log('\n💡 Optimization Recommendations:\n');

    const recommendations = [
      '1. Ensure all foreign keys have indexes for JOIN operations',
      '2. Add composite indexes on frequently queried column combinations',
      '3. Implement query result caching for frequently accessed data',
      '4. Use connection pooling (already implemented)',
      '5. Monitor slow query log in production',
      '6. Consider read replicas for heavy read workloads',
      '7. Implement API response caching with Redis',
      '8. Use database query explain plans to optimize slow queries',
      '9. Implement pagination for all list endpoints',
      '10. Add database query timeouts to prevent long-running queries'
    ];

    recommendations.forEach(rec => console.log(rec));
  }

  private async measureQuery(name: string, queryFn: () => Promise<any>): Promise<void> {
    const iterations = 5;
    const results: PerformanceMetrics[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await queryFn();
        const queryTime = Date.now() - startTime;
        results.push({ queryTime, success: true });
      } catch (error) {
        const queryTime = Date.now() - startTime;
        results.push({ 
          queryTime, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    this.results[name] = results;
  }

  private printResults(category: string): void {
    console.log(`\n📈 ${category} Results:\n`);

    Object.entries(this.results).forEach(([name, metrics]) => {
      const successfulMetrics = metrics.filter(m => m.success);
      
      if (successfulMetrics.length === 0) {
        console.log(`❌ ${name}: All attempts failed`);
        return;
      }

      const avgTime = successfulMetrics.reduce((sum, m) => sum + m.queryTime, 0) / successfulMetrics.length;
      const minTime = Math.min(...successfulMetrics.map(m => m.queryTime));
      const maxTime = Math.max(...successfulMetrics.map(m => m.queryTime));

      console.log(`✅ ${name}:`);
      console.log(`   Average: ${avgTime.toFixed(2)}ms`);
      console.log(`   Min: ${minTime}ms`);
      console.log(`   Max: ${maxTime}ms`);
      console.log(`   Success Rate: ${successfulMetrics.length}/${metrics.length}`);
    });

    this.results = {};
  }

  async runCompleteAudit(): Promise<void> {
    console.log('🚀 Starting Performance Audit...\n');
    console.log('='.repeat(60));

    try {
      await this.testDatabasePerformance();
      await this.testEncryptionPerformance();
      await this.testConcurrentQueries();
      await this.validateDatabaseIndexes();
      await this.checkConnectionPool();
      await this.validateSecurityMeasures();
      this.generateRecommendations();

      console.log('\n' + '='.repeat(60));
      console.log('✅ Performance Audit Complete!\n');
    } catch (error) {
      console.error('\n❌ Audit failed:', error);
    } finally {
      await database.close();
    }
  }
}

if (require.main === module) {
  const auditor = new PerformanceAuditor();
  auditor.runCompleteAudit().catch(console.error);
}

export default PerformanceAuditor;
