/**
 * Simple test script to verify Couchbase connection
 * Run with: node test-connection.js
 */

require('../load-env'); // Load environment variables
const couchbase = require('couchbase');

async function tryConnection(url, username, password, bucket, description) {
  console.log(`\n${description}:`);
  console.log(`URL: ${url}, Username: ${username}, Bucket: ${bucket || 'N/A'}`);
  
  try {
    console.log('Connecting to cluster...');
    const cluster = await couchbase.connect(url, {
      username: username,
      password: password,
    });
    
    console.log('✅ Connected to cluster successfully!');
    
    if (bucket) {
      try {
        console.log(`Opening bucket: ${bucket}`);
        const bucketObj = cluster.bucket(bucket);
        console.log('✅ Opened bucket successfully!');
      } catch (err) {
        console.error('❌ Error opening bucket:', err);
      }
    }
    
    await cluster.close();
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function testConnection() {
  console.log('Testing Couchbase connection with multiple configurations...');
  
  const credentials = {
    url: process.env.CBURL || 'couchbase://localhost/',
    urlNoSlash: 'couchbase://localhost',
    urlHttp: 'http://localhost:8091',
    username: process.env.CB_USERNAME || 'rarebeauty',
    password: process.env.CB_PASSWORD || 'soho!@#$',
    adminUser: 'Administrator',
    adminPass: 'password',
    bucket: process.env.CB_BUCKET || 'appointments_dev',
  };
  
  // Try different combinations
  let success = false;
  
  // Try with couchbase://localhost
  success = await tryConnection(
    'couchbase://localhost', 
    credentials.username, 
    credentials.password, 
    credentials.bucket,
    'Attempt 1: Regular user with couchbase://localhost'
  );
  
  if (!success) {
    // Try with couchbase://127.0.0.1
    success = await tryConnection(
      'couchbase://127.0.0.1', 
      credentials.username, 
      credentials.password, 
      credentials.bucket,
      'Attempt 2: Regular user with couchbase://127.0.0.1'
    );
  }
  
  if (!success) {
    // Try with SSH-forwarded ports
    success = await tryConnection(
      'couchbase://localhost:18091', 
      credentials.username, 
      credentials.password, 
      credentials.bucket,
      'Attempt 3: Regular user with couchbase://localhost:18091'
    );
  }
  
  if (!success) {
    success = await tryConnection(
      'couchbase://localhost:11210', 
      credentials.username, 
      credentials.password, 
      credentials.bucket,
      'Attempt 4: Regular user with couchbase://localhost:11210'
    );
  }
  
  if (!success) {
    console.log('\n❌ All connection attempts failed.');
    console.log('Please verify:');
    console.log('1. Couchbase is running and accessible');
    console.log('2. Credentials are correct');
    console.log('3. The bucket exists and is not in hibernation');
  }
}

// Run the test
testConnection(); 