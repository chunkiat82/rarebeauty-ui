const generateJWT = require('../utilities/jwt');
const google = require('googleapis');
const moment = require('moment');
const couchbase = require('couchbase');

module.exports = function list(options) {
  const { calendarId, timeStart, syncToken, orderBy } = options;
  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    const timeMin = timeStart || moment().subtract(1, 'hours').toISOString();
    calendar.events.list(
      {
        calendarId,
        // timeMin,
        // maxResults: 1,
        singleEvents: true,
        // orderBy: 'startTime'
        syncToken,
      },
      async (err, response) => {
        if (err) {
          // console.log(`The API returned an error: ${err}`);
          rej(err);
        } else {
          // console.log(response);
          await setSyncToken({
            syncToken: response.nextSyncToken,
            lastUpdated: moment(),
          });
          res(response.items);
        }
      },
    );
  });
};

async function setSyncToken(options) {
  const { syncToken, lastUpdated } = options;
  const localBucket = new couchbase.Cluster(
    'couchbase://rarebeauty.soho.sg/',
  ).openBucket('default');
  try {
    await setObject(localBucket, 'syncToken:calendar', {
      syncToken,
      lastUpdated,
    });
  } catch (err) {
    console.log(err);
  }
  localBucket.disconnect();
}

function setObject(bucket, id, obj) {
  return new Promise((res, rej) => {
    bucket.upsert(id, obj, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
}
