const key = require('../keys/google.json');
const google = require('googleapis');

module.exports = function generateJWT(subject = null) {
  return new Promise((res, rej) => {
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/calendar',
      ], // an array of auth scopes
      subject,
    );
    jwtClient.authorize(err => {
      if (err) {
        rej(err);
      } else {
        // console.log(tokens);
        res(jwtClient);
      }
    });
  });
};
