// Load environment variables first
require('../load-env');

const couchbase = require('couchbase');

async function main() {
  try {
    console.log('Listing all documents in the database');
    console.log('Environment variables:');
    console.log('CBURL/COUCHBASE_URL:', process.env.CBURL || process.env.COUCHBASE_URL);
    console.log('CB_BUCKET:', process.env.CB_BUCKET);
    console.log('CB_SCOPE:', process.env.CB_SCOPE);
    console.log('CB_USERNAME:', process.env.CB_USERNAME);
    
    const clusterConnStr = 'couchbase://127.0.0.1/';
    const username = 'rarebeautysg';
    const password = 'soho!@#$';
    const bucketName = process.env.CB_BUCKET || 'appointments';
    const scopeName = process.env.CB_SCOPE || 'rarebeauty';
    
    console.log(`\nConnecting to Couchbase at ${clusterConnStr} with username ${username}`);
    
    // Connect to cluster
    const cluster = await couchbase.connect(clusterConnStr, {
      username,
      password,
    });
    
    console.log('Successfully connected to cluster');
    
    // Try query to list all documents
    try {
      console.log(`\nListing all documents in ${bucketName}.${scopeName}:`);
      const queryString = `SELECT META().id FROM \`${bucketName}\`.\`${scopeName}\`.\`_default\` LIMIT 100`;
      console.log(`Query: ${queryString}`);
      const result = await cluster.query(queryString);
      
      if (result.rows.length === 0) {
        console.log('No documents found in the database.');
      } else {
        console.log(`Found ${result.rows.length} documents:`);
        result.rows.forEach(row => {
          console.log(`- ${row.id}`);
        });
      }
    } catch (error) {
      console.log('Query error:', error.message);
    }
    
  } catch (error) {
    console.error('\nError:', error);
  }
}

main().finally(() => {
  console.log('\nDocument listing complete');
  process.exit();
}); 