import { get, upsert } from '../../data/database';
import moment from 'moment';
/**
 * return string nextSyncToken
 */
export async function getSyncToken() {
  let syncToken = null;
  try {
    const obj = await get('syncToken:calendar');
    syncToken = obj.value.syncToken;
    // console.log(`syncToken:${syncToken}`);
  } catch (err) {
    throw err;
  }
  return syncToken;
}

export async function setSyncToken(options) {
  const { syncToken } = options;
  try {
    await upsert('syncToken:calendar', { syncToken, lastUpdated: moment() });
  } catch (err) {
    throw err;
  }
}

export default {
  getSyncToken,
  setSyncToken,
};
