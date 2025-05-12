/**
 * Helper script to run CLI commands with environment variables
 * 
 * Usage examples:
 * - Production: node cli-with-env.js --action=listEvents
 * - Development: NODE_ENV=development node cli-with-env.js --action=listEvents
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('./load-env');

// Get command line arguments except for the first two (node and script name)
const args = process.argv.slice(2);

// Start the CLI script with environment variables
const cli = spawn(
  'node', 
  ['./cli.js', ...args],
  { 
    stdio: 'inherit',
    shell: true,
    env: process.env
  }
);

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  cli.kill('SIGINT');
  process.exit(0);
});

cli.on('close', (code) => {
  console.log(`CLI process exited with code ${code}`);
  process.exit(code);
}); 