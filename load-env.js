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

// Check if env file exists
const envPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envPath)) {
  console.warn(`Warning: Environment file ${envFile} not found at ${envPath}`);
} else {
  // Read the env file content
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  
  // Parse with dotenv
  const envConfig = dotenv.parse(envFileContent);
  
  // Custom handling for special characters
  const specialVars = ['CB_PASSWORD'];
  
  // Add environment variables to process.env
  for (const key in envConfig) {
    // Apply custom handling for variables that might contain special characters
    if (specialVars.includes(key)) {
      // Extract the raw value from the file content
      const regexPattern = new RegExp(`${key}=(.*)$`, 'm');
      const match = envFileContent.match(regexPattern);
      
      if (match && match[1]) {
        const rawValue = match[1].trim();
        process.env[key] = rawValue;
      } else {
        process.env[key] = envConfig[key];
      }
    } else {
      process.env[key] = envConfig[key];
    }
  }
  
  console.log(`Loaded environment variables from ${envFile}`);
} 