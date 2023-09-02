import moment from 'moment';
import { get, upsert } from '../../data/database';

/**
 * return string nextSyncToken
 */
export async function getSyncToken() {
  let syncToken = null;
  try {
    const obj = await get('syncToken:calendar');
    syncToken = (obj && obj.syncToken) || '';
    console.error(`syncToken:${syncToken}`);
  } catch (err) {
    console.error('getSyncToken', err);
    throw err;
  }
  return syncToken;
}

export async function setSyncToken(options) {
  const { syncToken } = options;
  try {
    await upsert('syncToken:calendar', { syncToken, lastUpdated: moment() });
  } catch (err) {
    console.error('setSyncToken', err);
    throw err;
  }
}

export default {
  getSyncToken,
  setSyncToken,
};
