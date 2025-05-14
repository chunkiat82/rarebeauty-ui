/**
 * Script to load environment variables from env files
 * Usage: 
 *   - In production: node -r ./load-env.js your-script.js
 *   - In development: NODE_ENV=development node -r ./load-env.js your-script.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine which env file to load
const isProd = process.env.NODE_ENV === 'production' || process.env.PRODUCTION === 'true';
const envFile = isProd ? 'env.production' : 'env.local';

// Save original environment variables that were set by command line
const originalEnvVars = { ...process.env };

// Check if env file exists
const envPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envPath)) {
  console.warn(`Warning: Environment file ${envFile} not found at ${envPath}`);
} else {
  // Read the env file content
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  
  // Parse with dotenv
  const envConfig = dotenv.parse(envFileContent);
  
  // List of variables that might have quoted values that need special handling
  const specialVars = ['CB_PASSWORD', 'JWT_SECRET', 'GOOGLE_PRIVATE_KEY', 'SL_PASSWORD'];
  
  // Process line by line to handle quotes properly
  envFileContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.trim().startsWith('#') || !line.includes('=')) {
      return;
    }
    
    // Extract key and value
    const [key, ...valueParts] = line.split('=');
    const trimmedKey = key.trim();
    
    // Skip if already set from command line
    if (originalEnvVars[trimmedKey] !== undefined) {
      return;
    }
    
    // Get the raw value part (re-join in case value contains = characters)
    let value = valueParts.join('=').trim();
    
    // Handle quoted values by removing surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    // Set the environment variable
    process.env[trimmedKey] = value;
  });
  
  console.log(`Loaded environment variables from ${envFile}`);
  
  // Extra debug for database variables
  if (process.env.DEBUG) {
    console.log('Database connection variables:');
    console.log('- CBURL:', process.env.CBURL);
    console.log('- CB_BUCKET:', process.env.CB_BUCKET);
    console.log('- CB_USERNAME:', process.env.CB_USERNAME);
    console.log('- CB_PASSWORD: [hidden]');
  }
} 