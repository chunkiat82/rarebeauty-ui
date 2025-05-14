/**
 * Helper script to start the application with environment variables
 * 
 * Usage:
 * - Production: node start-with-env.js
 * - Development: NODE_ENV=development node start-with-env.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('./load-env');

// Print important environment variables at startup
console.log('\n============ ENVIRONMENT VARIABLES LOADED ============');
const importantVars = [
  'NODE_ENV', 'PORT', 'ALLOWED_ORIGINS', 'JWT_SECRET', 
  'CBURL', 'CB_BUCKET', 'CB_SCOPE', 'CB_COLLECTION', 'CB_USERNAME',
  'TWILIO_ACCOUNT_SID', 'TWILIO_SENDER',
  'GOOGLE_CALENDAR_ID', 'GOOGLE_WAITINGLIST_CALENDAR_ID', 'GOOGLE_WEBHOOK_URL',
  'CONFIRMATION_URL', 'RESERVATION_URL', 'CUSTOMER_URL',
  'WORK_MOBILE', 'WORK_EMAIL'
];

importantVars.forEach(key => {
  const value = process.env[key];
  // Mask sensitive values
  if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY') || 
      key.includes('TOKEN') || key.includes('SID')) {
    console.log(`${key}: ${value ? '***' : 'undefined'}`);
  } else {
    console.log(`${key}: ${value || 'undefined'}`);
  }
});
console.log('=====================================================\n');

// Start the application
const nodemon = spawn(
  'nodemon', 
  ['--exec', 'node', './src', '--watch', './src'],
  { 
    stdio: 'inherit',
    shell: true,
    env: process.env
  }
);

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  nodemon.kill('SIGINT');
  process.exit(0);
});

nodemon.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
}); 