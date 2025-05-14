// Load environment variables first
require('../load-env');

const couchbase = require('couchbase');

async function main() {
  try {
    console.log('Listing all buckets in the Couchbase server');
    
    const clusterConnStr = 'couchbase://127.0.0.1/';
    const username = 'rarebeautysg';
    const password = 'soho!@#$';
    
    console.log(`\nConnecting to Couchbase at ${clusterConnStr} with username ${username}`);
    
    // Connect to cluster
    const cluster = await couchbase.connect(clusterConnStr, {
      username,
      password,
    });
    
    console.log('Successfully connected to cluster');
    
    // List buckets
    try {
      console.log('\nListing all buckets:');
      const buckets = await cluster.buckets().getAllBuckets();
      
      if (Object.keys(buckets).length === 0) {
        console.log('No buckets found in the cluster.');
      } else {
        console.log(`Found ${Object.keys(buckets).length} buckets:`);
        Object.keys(buckets).forEach(name => {
          console.log(`- ${name} (${buckets[name].bucketType})`);
        });
        
        // Try to open each bucket and list scopes
        for (const bucketName of Object.keys(buckets)) {
          try {
            console.log(`\nOpening bucket: ${bucketName}`);
            const bucket = cluster.bucket(bucketName);
            
            try {
              console.log(`Listing scopes in bucket: ${bucketName}`);
              const scopes = await bucket.collections().getAllScopes();
              
              scopes.forEach(scope => {
                console.log(`Scope: ${scope.name}`);
                scope.collections.forEach(collection => {
                  console.log(`  - Collection: ${collection.name}`);
                });
              });
              
              // Try a query to count documents
              try {
                const queryString = `SELECT COUNT(*) AS count FROM \`${bucketName}\``;
                console.log(`Counting documents in bucket ${bucketName}: ${queryString}`);
                const result = await cluster.query(queryString);
                console.log(`Total documents in bucket ${bucketName}: ${result.rows[0].count}`);
              } catch (queryError) {
                console.log(`Query error for bucket ${bucketName}:`, queryError.message);
              }
              
            } catch (scopeError) {
              console.log(`Error listing scopes for bucket ${bucketName}:`, scopeError.message);
            }
          } catch (bucketError) {
            console.log(`Error opening bucket ${bucketName}:`, bucketError.message);
          }
        }
      }
    } catch (error) {
      console.log('Error listing buckets:', error.message);
    }
    
  } catch (error) {
    console.error('\nError:', error);
  }
}

main().finally(() => {
  console.log('\nBucket listing complete');
  process.exit();
}); 