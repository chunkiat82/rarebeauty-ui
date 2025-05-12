const moment = require('moment');
const { get, upsert } = require('../../data/database');

/**
 * return string nextSyncToken
 */
async function getSyncToken(context) {
  let syncToken = null;
  try {
    const obj = await get('syncToken:calendar', context);
    // future const obj = await get(`syncToken:calendar:${calendarWatchResponseId}`, context);
    syncToken = (obj && obj.syncToken) || '';
    console.error(`syncToken:${syncToken}`);
  } catch (err) {
    console.error('getSyncToken', err);
    throw err;
  }
  return syncToken;
}

async function setSyncToken(options) {
  const { syncToken, context } = options;
  try {
    await upsert(
      'syncToken:calendar',
      { syncToken, lastUpdated: moment() },
      context,
    );
    // future await upsert(`syncToken:calendar:${calendarWatchResponseId}`, { syncToken, lastUpdated: moment() }, context);
  } catch (err) {
    console.error('setSyncToken', err);
    throw err;
  }
}

module.exports = {
  getSyncToken,
  setSyncToken,
};
