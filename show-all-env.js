/**
 * Script to show all environment variables loaded during application startup
 * To use: NODE_ENV=development node show-all-env.js
 */

// Use the same loading mechanism as the application
require('./load-env');
const fs = require('fs');

console.log('\n============ LOADED ENVIRONMENT VARIABLES ============');

// Get the environment file content to see all variables that were loaded
const envFile = process.env.NODE_ENV === 'production' ? 'env.production' : 'env.local';
const envPath = `./${envFile}`;

try {
  console.log(`\nVariables defined in ${envFile}:`);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          // Don't show actual values of sensitive data
          const isSensitive = key.includes('SECRET') || 
                              key.includes('KEY') || 
                              key.includes('PASSWORD') || 
                              key.includes('TOKEN') || 
                              key.includes('SID');
          
          if (isSensitive) {
            console.log(`${key}: [SENSITIVE VALUE]`);
          } else {
            console.log(`${key}: ${process.env[key]}`);
          }
        }
      }
    });
  } else {
    console.log(`File ${envPath} not found.`);
  }
} catch (err) {
  console.error(`Error reading environment file: ${err.message}`);
}

// Show variables actually loaded in the process.env
console.log('\nActual process.env values:');
const envKeys = Object.keys(process.env).sort();

// Filter to just show application-specific variables
const appVars = envKeys.filter(key => 
  key.startsWith('GOOGLE_') || 
  key.startsWith('TWILIO_') || 
  key.startsWith('CB_') ||
  key.startsWith('WORK_') ||
  key.startsWith('SL_') ||
  ['JWT_SECRET', 'PORT', 'NODE_ENV', 'CONFIRMATION_URL', 
   'RESERVATION_URL', 'CUSTOMER_URL', 'ALLOWED_ORIGINS', 
   'DOMAIN', 'CALENDAR_NAME'].includes(key)
);

appVars.forEach(key => {
  const isSensitive = key.includes('SECRET') || 
                      key.includes('KEY') || 
                      key.includes('PASSWORD') || 
                      key.includes('TOKEN') || 
                      key.includes('SID');
  
  if (isSensitive) {
    console.log(`${key}: [SENSITIVE VALUE]`);
  } else {
    console.log(`${key}: ${process.env[key]}`);
  }
});

console.log('\n=================================================='); 