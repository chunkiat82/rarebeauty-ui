// Load environment variables first
require('../load-env');

const couchbase = require('couchbase');

async function tryConnection(config) {
  try {
    console.log(`\n\nTrying connection with: ${JSON.stringify(config, null, 2)}`);
    
    // Connect to cluster
    const cluster = await couchbase.connect(config.clusterConnStr, {
      username: config.username,
      password: config.password,
    });
    
    console.log('✅ Successfully connected to cluster');
    
    // Try to open bucket
    try {
      console.log(`Opening bucket: ${config.bucketName}`);
      const bucket = cluster.bucket(config.bucketName);
      console.log('✅ Bucket opened successfully');
      
      // List scopes
      try {
        console.log('Listing scopes:');
        const scopes = await bucket.collections().getAllScopes();
        scopes.forEach(scope => {
          console.log(`Scope: ${scope.name}`);
          scope.collections.forEach(collection => {
            console.log(`  - Collection: ${collection.name}`);
          });
        });
      } catch (error) {
        console.log('❌ Unable to list scopes:', error.message);
      }
      
      // Try query
      try {
        console.log('Running test query:');
        const queryString = `SELECT COUNT(*) AS count FROM \`${config.bucketName}\``;
        console.log(`Query: ${queryString}`);
        const result = await cluster.query(queryString);
        console.log('Query result:', JSON.stringify(result.rows, null, 2));
        return true;
      } catch (error) {
        console.log('❌ Query error:', error.message);
      }
    } catch (error) {
      console.log(`❌ Error opening bucket ${config.bucketName}:`, error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('Checking Couchbase connection and structure');
    console.log('Environment variables:');
    console.log('CBURL/COUCHBASE_URL:', process.env.CBURL || process.env.COUCHBASE_URL);
    console.log('CB_BUCKET:', process.env.CB_BUCKET);
    console.log('CB_SCOPE:', process.env.CB_SCOPE);
    console.log('CB_USERNAME:', process.env.CB_USERNAME);
    
    // Define configurations to try
    const configs = [
      // Production config (from env.production)
      {
        name: "Production config",
        clusterConnStr: process.env.CBURL || 'couchbase://localhost.soho.sg/',
        username: process.env.CB_USERNAME || 'rarebeauty',
        password: process.env.CB_PASSWORD || 'soho!@#$',
        bucketName: process.env.CB_BUCKET || 'appointments',
        scopeName: process.env.CB_SCOPE || 'rarebeauty',
        collectionName: process.env.CB_COLLECTION || 'default'
      },
      // Local config (from env.local)
      {
        name: "Local config",
        clusterConnStr: 'couchbase://127.0.0.1/',
        username: 'rarebeautysg',
        password: 'soho!@#$',
        bucketName: 'appointments',
        scopeName: 'rarebeauty',
        collectionName: 'default'
      },
      // Try production URL with local username
      {
        name: "Mixed config 1 (prod URL, local username)",
        clusterConnStr: 'couchbase://localhost.soho.sg/',
        username: 'rarebeautysg',
        password: 'soho!@#$',
        bucketName: 'appointments',
        scopeName: 'rarebeauty',
        collectionName: 'default'
      },
      // Try local URL with prod username
      {
        name: "Mixed config 2 (local URL, prod username)",
        clusterConnStr: 'couchbase://127.0.0.1/',
        username: 'rarebeauty',
        password: 'soho!@#$',
        bucketName: 'appointments',
        scopeName: 'rarebeauty',
        collectionName: 'default'
      }
    ];
    
    // Try each configuration
    let success = false;
    for (const config of configs) {
      console.log(`\n==== Testing ${config.name} ====`);
      success = await tryConnection(config);
      if (success) {
        console.log(`✅ Connection successful with ${config.name}`);
        break;
      } else {
        console.log(`❌ Connection failed with ${config.name}`);
      }
    }
    
    if (!success) {
      console.log('\n❌ All connection attempts failed. Issues to check:');
      console.log('1. Is the Couchbase server running?');
      console.log('2. Is there a network/firewall issue preventing connection?');
      console.log('3. Are the credentials correct?');
      console.log('4. Does the bucket exist?');
    }
    
  } catch (error) {
    console.error('\nError:', error);
  }
}

main().finally(() => {
  console.log('\nDatabase check complete');
  process.exit();
}); 