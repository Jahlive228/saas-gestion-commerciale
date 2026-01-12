/**
 * Script de test pour vérifier la connexion Redis
 * 
 * Utilisation :
 *   pnpm tsx src/lib/redis-test.ts
 * 
 * ou dans Node.js :
 *   node -r ts-node/register src/lib/redis-test.ts
 */

import { getRedisClient, isRedisAvailable, closeRedisConnection } from './redis';

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // 1. Obtenir le client
    console.log('1. Getting Redis client...');
    const client = getRedisClient();
    
    if (!client) {
      console.error('❌ Failed to get Redis client');
      process.exit(1);
    }
    console.log('✅ Redis client obtained');

    // 2. Vérifier la disponibilité
    console.log('\n2. Checking Redis availability...');
    const isAvailable = await isRedisAvailable();
    
    if (!isAvailable) {
      console.error('❌ Redis is not available');
      process.exit(1);
    }
    console.log('✅ Redis is available and connected');

    // 3. Test PING
    console.log('\n3. Testing PING command...');
    const pingResult = await client.ping();
    console.log(`✅ PING response: ${pingResult}`);

    // 4. Test SET/GET
    console.log('\n4. Testing SET/GET commands...');
    const testKey = 'test:connection';
    const testValue = `test-${Date.now()}`;
    
    await client.set(testKey, testValue);
    console.log(`✅ SET ${testKey} = ${testValue}`);
    
    const retrievedValue = await client.get(testKey);
    console.log(`✅ GET ${testKey} = ${retrievedValue}`);
    
    if (retrievedValue !== testValue) {
      console.error(`❌ Value mismatch! Expected: ${testValue}, Got: ${retrievedValue}`);
      process.exit(1);
    }
    console.log('✅ SET/GET test passed');

    // 5. Nettoyer
    console.log('\n5. Cleaning up...');
    await client.del(testKey);
    console.log(`✅ Deleted test key: ${testKey}`);

    // 6. Test avec expiration
    console.log('\n6. Testing TTL and expiration...');
    const expiringKey = 'test:expiring';
    await client.setex(expiringKey, 2, 'will-expire');
    const ttl = await client.ttl(expiringKey);
    console.log(`✅ Set key with TTL: ${ttl} seconds`);
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    const expiredValue = await client.get(expiringKey);
    if (expiredValue === null) {
      console.log('✅ Key expired correctly');
    } else {
      console.warn(`⚠️  Key still exists: ${expiredValue}`);
    }

    console.log('\n✅ All Redis tests passed!');
    console.log('\n📊 Redis connection status:');
    console.log(`   - Status: ${client.status}`);
    console.log(`   - Host: ${client.options.host || 'from URL'}`);
    console.log(`   - Port: ${client.options.port || 'from URL'}`);
    console.log(`   - DB: ${client.options.db || 0}`);

  } catch (error: any) {
    console.error('\n❌ Redis test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Fermer la connexion proprement
    await closeRedisConnection();
    console.log('\n👋 Redis connection closed');
    process.exit(0);
  }
}

// Exécuter le test si le script est appelé directement
// Note: En ESM, on peut utiliser import.meta.url pour détecter l'exécution directe
if (typeof require !== 'undefined' && require.main === module) {
  testRedisConnection().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { testRedisConnection };
