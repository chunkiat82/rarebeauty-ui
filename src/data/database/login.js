import moment from 'moment';
import { upsert } from '../database';

export async function logLogin(username, payload) {
  await upsert(
    `login:${username}`,
    Object.assign({ lastUpdated: moment() }, payload),
  );
}

export default {
  logLogin,
};
