// Load environment variables first
require('../load-env');

const { get } = require('../src/data/database');

async function main() {
  try {
    console.log('Attempting to fetch config:services from database');
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
    
    // Try to get the services config
    const services = await get('config:services', context);
    
    if (services) {
      console.log('\nSuccessfully retrieved config:services:');
      console.log(JSON.stringify(services, null, 2));
    } else {
      console.error('\nFailed to retrieve config:services - document not found');
    }
  } catch (error) {
    console.error('\nError fetching config:services:', error);
  }
}

main().finally(() => {
  console.log('Query complete');
  process.exit();
}); 