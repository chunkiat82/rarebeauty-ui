const moment = require('moment');
const { upsert } = require('../database');

export async function logLogin(username, payload) {
  await upsert(
    `login:${username}`,
    Object.assign({ lastUpdated: moment() }, payload),
  );
}

module.exports = {
  logLogin,
};
