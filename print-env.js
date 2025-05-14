// Simple script to print environment variables loaded the same way as the app
// Load environment using the app's mechanism
require('./load-env');

console.log('========== ENVIRONMENT VARIABLES ==========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('LOG_LEVEL:', process.env.LOG_LEVEL);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);

// Database config
console.log('\n--- DATABASE ---');
console.log('CBURL/COUCHBASE_URL:', process.env.CBURL || process.env.COUCHBASE_URL);
console.log('CB_BUCKET:', process.env.CB_BUCKET);
console.log('CB_SCOPE:', process.env.CB_SCOPE);
console.log('CB_COLLECTION:', process.env.CB_COLLECTION);
console.log('CB_USERNAME:', process.env.CB_USERNAME);
console.log('CB_PASSWORD:', process.env.CB_PASSWORD ? '***' + process.env.CB_PASSWORD.substring(Math.max(0, process.env.CB_PASSWORD.length - 3)) : undefined);
console.log('CB_DEFAULT_TENANT:', process.env.CB_DEFAULT_TENANT);

// Auth
console.log('\n--- AUTH ---');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : undefined);
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

// Twilio
console.log('\n--- TWILIO ---');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '***' : undefined);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***' : undefined);
console.log('TWILIO_SENDER:', process.env.TWILIO_SENDER);
console.log('TWILIO_ADMIN_NUMBER:', process.env.TWILIO_ADMIN_NUMBER);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);

// URLs
console.log('\n--- URLS ---');
console.log('CONFIRMATION_URL:', process.env.CONFIRMATION_URL);
console.log('RESERVATION_URL:', process.env.RESERVATION_URL);
console.log('CUSTOMER_URL:', process.env.CUSTOMER_URL);
console.log('DOMAIN:', process.env.DOMAIN);
console.log('CALENDAR_NAME:', process.env.CALENDAR_NAME);

// Google - More Complete
console.log('\n--- GOOGLE ---');
console.log('GOOGLE_ACCOUNT_TYPE:', process.env.GOOGLE_ACCOUNT_TYPE);
console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID);
console.log('GOOGLE_PRIVATE_KEY_ID:', process.env.GOOGLE_PRIVATE_KEY_ID ? '***' : undefined);
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '***' : undefined);
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '***' : undefined);
console.log('GOOGLE_AUTH_URI:', process.env.GOOGLE_AUTH_URI);
console.log('GOOGLE_TOKEN_URI:', process.env.GOOGLE_TOKEN_URI);
console.log('GOOGLE_AUTH_PROVIDER_CERT_URL:', process.env.GOOGLE_AUTH_PROVIDER_CERT_URL);
console.log('GOOGLE_CLIENT_CERT_URL:', process.env.GOOGLE_CLIENT_CERT_URL);
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '***' : undefined);
console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
console.log('GOOGLE_WAITINGLIST_CALENDAR_ID:', process.env.GOOGLE_WAITINGLIST_CALENDAR_ID);
console.log('GOOGLE_WEBHOOK_URL:', process.env.GOOGLE_WEBHOOK_URL);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***' : undefined);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

// URL Shortener
console.log('\n--- URL SHORTENER ---');
console.log('SL_USERNAME:', process.env.SL_USERNAME);
console.log('SL_PASSWORD:', process.env.SL_PASSWORD ? '***' : undefined);

// Work Info
console.log('\n--- WORK INFO ---');
console.log('WORK_ADDRESS:', process.env.WORK_ADDRESS);
console.log('WORK_EMAIL:', process.env.WORK_EMAIL);
console.log('WORK_MOBILE:', process.env.WORK_MOBILE);

// Print all environment variables for complete check
console.log('\n--- ALL ENVIRONMENT VARIABLES ---');
Object.keys(process.env)
  .filter(key => 
    key.startsWith('CB_') || 
    key.startsWith('GOOGLE_') || 
    key.startsWith('TWILIO_') || 
    key.startsWith('WORK_') ||
    key.startsWith('SL_') ||
    ['JWT_SECRET', 'JWT_EXPIRES_IN', 'CONFIRMATION_URL', 'RESERVATION_URL', 'CUSTOMER_URL', 'DOMAIN', 'CALENDAR_NAME'].includes(key)
  )
  .sort()
  .forEach(key => {
    const value = process.env[key];
    const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'SID'];
    
    const isSensitive = sensitiveKeys.some(sensitiveKey => key.includes(sensitiveKey));
    console.log(`${key}:`, isSensitive && value ? `***${value.substring(Math.max(0, value.length - 3))}` : value);
  });

console.log('=========================================='); 