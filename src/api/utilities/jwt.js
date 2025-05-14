// const moment = require('moment');
// We'll use environment variables instead of directly requiring keys
const { google } = require('googleapis');

// Use environment variable directly
const WORK_EMAIL = process.env.WORK_EMAIL;

// /* specifically for cache */
// let moduleToken = null;
let authClient = null;

function generateJWT(subject = null) {
  // if (moduleToken) {
  //   // console.error('moduleToken', moduleToken);
  //   if (moduleToken.expiry_date) {
  //     // console.error('moduleToken.expiry_date', moduleToken.expiry_date);
  //     if (
  //       moment(moduleToken.expiry_date)
  //         .subtract(1, 'minute')
  //         .isAfter(moment())
  //     ) {
  //       return new Promise(res => {
  //         res(jwtClient);
  //       });
  //     }
  //   }
  // }

  // Use environment variables instead of key file
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Process private key: handle escape sequences and remove quotes
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  // Check if we need to process the private key
  if (privateKey) {
    // Remove surrounding quotes if present
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    // Replace literal "\n" with actual newlines if needed
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  }

  // Debug info for troubleshooting
  console.log('Google auth settings:');
  console.log('- Client email:', clientEmail);
  console.log('- Private key set:', privateKey ? 'Yes (length: ' + privateKey.length + ')' : 'No');
  console.log('- Work email (subject):', subject || WORK_EMAIL);

  // eslint-disable-next-line consistent-return
  return new Promise((res, rej) => {
    if (authClient !== null) return res(authClient);
    authClient = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/calendar',
      ], // an array of auth scopes
      subject,
    );
    authClient.authorize((err, token) => {
      if (err) {
        return rej(err);
      }
      console.error(token);
      authClient
        .on('tokens', tokens => {
          console.error(`tokens`, tokens);
        })
        .getAccessToken();
      return res(authClient);
    });
  });
}

async function generateCalendarObj() {
  let jwtClient = null;
  try {
    jwtClient = await generateJWT(WORK_EMAIL);
  } catch (err) {
    console.error('generateCalendarObj', err, WORK_EMAIL);
  }

  return google.calendar({
    version: 'v3',
    auth: jwtClient,
    timeout: 5000, // 5 seconds.
    retry: true,
    retryConfig: {
      onRetryAttempt: retryError => {
        console.error('retrying google calendar', retryError);
      },
    },
    ontimeout() {
      // Handle timeout.
      console.error(
        'gapi.client create waiting could not load in a timely manner!',
      );
    },
  });
}

async function generatePeopleObj() {
  let jwtClient = null;
  try {
    jwtClient = await generateJWT(WORK_EMAIL);
  } catch (err) {
    console.error('generateCalendarObj', err, WORK_EMAIL);
  }
  return google.people({
    version: 'v1',
    auth: jwtClient,
    timeout: 20000, // 5 seconds.
    retry: true,
    retryConfig: {
      onRetryAttempt: retryError => {
        console.error('retrying google people', retryError);
      },
    },
    ontimeout() {
      // Handle timeout.
      console.error(
        'gapi.client create waiting could not load in a timely manner!',
      );
    },
  });
}

module.exports = {
  generateJWT,
  generateCalendarObj,
  generatePeopleObj,
};
