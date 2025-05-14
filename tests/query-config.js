// Load environment variables first
require('../load-env');

const { query } = require('../src/data/database');

async function main() {
  try {
    console.log('Attempting to list all config documents in database');
    console.log('Using environment variables:');
    console.log('CBURL/COUCHBASE_URL:', process.env.CBURL || process.env.COUCHBASE_URL);
    console.log('CB_BUCKET:', process.env.CB_BUCKET);
    console.log('CB_SCOPE:', process.env.CB_SCOPE);
    console.log('CB_USERNAME:', process.env.CB_USERNAME);
    console.log('Tenant:', process.env.CB_DEFAULT_TENANT || 'rarebeauty');
    
    // Create context with tenant
    const context = { 
      tenant: process.env.CB_DEFAULT_TENANT || 'rarebeauty'
    };

    // List all documents that start with "config:"
    const queryString = `SELECT META().id FROM \`${process.env.CB_BUCKET || 'appointments'}\`.\`${process.env.CB_SCOPE || 'rarebeauty'}\`.\`${process.env.CB_COLLECTION || 'default'}\` WHERE META().id LIKE "config:%"`;
    
    console.log('\nExecuting query:', queryString);
    
    // Try to get all config documents
    const configs = await query(queryString, context);
    
    if (configs && configs.length > 0) {
      console.log('\nFound config documents:');
      configs.forEach(doc => console.log(`- ${doc.id}`));
    } else {
      console.error('\nNo config documents found in the database');
      
      // Try a more general query to see if there are any documents
      console.log('\nTrying a broader query to see what documents exist...');
      const allDocsQuery = `SELECT META().id FROM \`${process.env.CB_BUCKET || 'appointments'}\`.\`${process.env.CB_SCOPE || 'rarebeauty'}\`.\`${process.env.CB_COLLECTION || 'default'}\` LIMIT 10`;
      const allDocs = await query(allDocsQuery, context);
      
      if (allDocs && allDocs.length > 0) {
        console.log('Found some documents:');
        allDocs.forEach(doc => console.log(`- ${doc.id}`));
      } else {
        console.error('No documents found at all. Database might be empty or connection issues.');
      }
    }
  } catch (error) {
    console.error('\nError querying database:', error);
  }
}

main().finally(() => {
  console.log('\nQuery complete');
  process.exit();
}); 