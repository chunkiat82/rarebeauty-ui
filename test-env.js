/**
 * Test script to verify environment variable loading
 */

// Load environment variables
require('./load-env');

console.log('===== Environment Variable Test =====');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);
console.log(`CBURL: ${process.env.CBURL || '(not set)'}`);
console.log(`CB_BUCKET: ${process.env.CB_BUCKET || '(not set)'}`);
console.log(`CB_SCOPE: ${process.env.CB_SCOPE || '(not set)'}`);
console.log(`CB_COLLECTION: ${process.env.CB_COLLECTION || '(not set)'}`);
console.log(`CB_USERNAME: ${process.env.CB_USERNAME || '(not set)'}`);

// Special handling for password to show full value
const password = process.env.CB_PASSWORD || '(not set)';
console.log(`CB_PASSWORD: ${password}`);
console.log(`Password length: ${password.length}`);
console.log('Password characters:');
for (let i = 0; i < password.length; i++) {
  console.log(`  Char[${i}]: '${password[i]}' (charCode: ${password.charCodeAt(i)})`);
}

console.log('===== End of Test ====='); 