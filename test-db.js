/**
 * Comprehensive DB connection test
 */
require('./load-env'); // Load environment variables
const couchbase = require('couchbase');

// Escape special characters in strings for logging
function safeLog(str) {
  return str ? String(str).replace(/[&<>'"]/g, (c) => `[${c.charCodeAt(0)}]`) : 'undefined';
}

async function tryConnect(options) {
  const { url, username, password, bucket, scope, collection, name } = options;
  
  console.log(`\n🔍 Testing connection: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${safeLog(password)}`);
  if (bucket) console.log(`Bucket: ${bucket}`);
  if (scope) console.log(`Scope: ${scope}`);
  if (collection) console.log(`Collection: ${collection}`);
  
  try {
    console.log('Connecting to cluster...');
    const connectOpts = {
      username,
      password,
      timeouts: {
        connectTimeout: 15000, // 15 seconds
        kvTimeout: 10000
      }
    };
    
    const cluster = await couchbase.connect(url, connectOpts);
    console.log('✅ Successfully connected to cluster');
    
    try {
      if (bucket) {
        console.log(`Accessing bucket: ${bucket}`);
        const bucketObj = cluster.bucket(bucket);
        console.log('✅ Successfully accessed bucket');
        
        if (scope) {
          console.log(`Accessing scope: ${scope}`);
          const scopeObj = bucketObj.scope(scope);
          console.log('✅ Successfully accessed scope');
          
          if (collection) {
            console.log(`Accessing collection: ${collection}`);
            const collectionObj = scopeObj.collection(collection);
            console.log('✅ Successfully accessed collection');
            
            // Try a simple query
            try {
              console.log('Executing query to count documents...');
              const query = `SELECT COUNT(*) AS count FROM \`${bucket}\`.\`${scope}\`.\`${collection}\``;
              const result = await cluster.query(query);
              console.log(`✅ Query successful! Document count: ${result.rows[0].count}`);
            } catch (qErr) {
              console.error('❌ Query failed:', qErr.message);
            }
          }
        }
      }
    } catch (resourceErr) {
      console.error('❌ Error accessing resources:', resourceErr.message);
    }
    
    await cluster.close();
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.cause) {
      console.error('  Cause:', err.cause.message || err.cause);
    }
    return false;
  }
}

async function runTests() {
  console.log('===============================');
  console.log('COUCHBASE CONNECTION TEST SUITE');
  console.log('===============================');
  
  const envVars = {
    CBURL: process.env.CBURL,
    COUCHBASE_URL: process.env.COUCHBASE_URL,
    CB_BUCKET: process.env.CB_BUCKET,
    CB_SCOPE: process.env.CB_SCOPE,
    CB_COLLECTION: process.env.CB_COLLECTION,
    CB_USERNAME: process.env.CB_USERNAME,
    CB_PASSWORD: process.env.CB_PASSWORD
  };
  
  console.log('\nEnvironment variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}: ${key.includes('PASSWORD') ? '********' : value || '(not set)'}`);
  });
  
  // Test cases
  const tests = [
    {
      name: 'Test 1: Default environment variables with full password',
      url: process.env.CBURL || 'couchbase://127.0.0.1/',
      username: process.env.CB_USERNAME || 'rarebeautysg',
      password: process.env.CB_PASSWORD || 'soho!@#$', // Full password exactly as specified
      bucket: process.env.CB_BUCKET || 'appointments_dev',
      scope: process.env.CB_SCOPE || 'rarebeauty',
      collection: process.env.CB_COLLECTION || 'default'
    },
    {
      name: 'Test 2: Try with exact hardcoded password',
      url: process.env.CBURL || 'couchbase://127.0.0.1/',
      username: 'rarebeautysg',
      password: 'soho!@#$', // Hardcoded exact value to avoid env variable issues
      bucket: 'appointments_dev'
    },
    {
      name: 'Test 3: Try with localhost instead of 127.0.0.1',
      url: 'couchbase://localhost',
      username: 'rarebeautysg',
      password: 'soho!@#$',
      bucket: 'appointments_dev'
    }
  ];
  
  // Run tests sequentially
  let anySuccess = false;
  for (const test of tests) {
    const success = await tryConnect(test);
    if (success) {
      anySuccess = true;
      console.log(`\n✅ Test passed: ${test.name}`);
    } else {
      console.log(`\n❌ Test failed: ${test.name}`);
    }
  }
  
  console.log('\n===============================');
  if (anySuccess) {
    console.log('✅ At least one connection test passed!');
  } else {
    console.log('❌ All connection tests failed.');
    console.log('\nTroubleshooting suggestions:');
    console.log('1. Verify Couchbase is running: http://localhost:8091');
    console.log('2. Check user credentials and permissions');
    console.log('3. Verify bucket exists and is not in hibernation');
    console.log('4. Check if SSH tunneling is required for remote connections');
  }
  console.log('===============================');
}

runTests(); 