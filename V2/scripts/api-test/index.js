const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const moment = require('moment');
const keys = require('./jwt.keys.json');
const config = require('./config.json');

async function getClient() {
  return new Promise((res, rej) => {
    const jwtClient = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/calendar',
      ],
      // subject: keys.subject,
    });

    jwtClient.authorize(err => {
      if (err) {
        return rej(err);
      }
      // console.log(token);
      jwtClient
        .on('tokens', tokens => {
          console.error(`tokens`, tokens);
        })
        .getAccessToken();
      return res(jwtClient);
    });
  });
}

async function main() {
  const authClient = await getClient();

  const calendar = await google.calendar({
    version: 'v3',
    auth: authClient,
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

  const timeMin = moment()
    .subtract(3, 'hours')
    .toISOString();
  const finalOptions = {
    calendarId: config.calendar_id,
    timeMin,
    maxResults: 2000,
    singleEvents: true,
    orderBy: 'startTime',
  };

  // console.log(JSON.stringify(finalOptions, null, 2))

  calendar.events.list(finalOptions, async (err, output) => {
    if (err) {
      console.error(JSON.stringify(err, null, 2));
    } else {
      const { data } = output;
      // console.log(`output.data.nextPageToken`, data.nextPageToken);
      // console.log(`output.data.nextSyncToken`, data.nextSyncToken);
      console.error(JSON.stringify(data.items, null, 2));
    }
  });
}

main().catch(console.error);
