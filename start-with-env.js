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