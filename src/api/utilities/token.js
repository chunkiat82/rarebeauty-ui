import moment from 'moment';
import { get, upsert } from '../../data/database';

/**
 * return string nextSyncToken
 */
export async function getSyncToken(calendarWatchResponseId, context) {
  let syncToken = null;
  try {
    const obj = await get('syncToken:calendar', context);
    console.log('calendarWatchResponseId', calendarWatchResponseId);
    // future const obj = await get(`syncToken:calendar:${calendarWatchResponseId}`, context);
    syncToken = (obj && obj.syncToken) || '';
    console.error(`syncToken:${syncToken}`);
  } catch (err) {
    console.error('getSyncToken', err);
    throw err;
  }
  return syncToken;
}

export async function setSyncToken(options) {
  const { syncToken, context, calendarWatchResponseId } = options;
  try {
    console.log('calendarWatchResponseId', calendarWatchResponseId);
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

export default {
  getSyncToken,
  setSyncToken,
};
