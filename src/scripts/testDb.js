const testConnection = require('../utils/testConnection');

async function main() {
  try {
    await testConnection();
    console.log('Database connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed');
    process.exit(1);
  }
}

main(); 