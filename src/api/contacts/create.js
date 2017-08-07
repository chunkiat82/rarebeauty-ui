// https://developers.google.com/apis-explorer/?hl=en_US#p/
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = async function create({ first, last, mobile }) {
  const jwtClient = await generateJWT('rarebeauty@soho.sg');
  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  return new Promise((res, rej) => {
    people.people.createContact(
      {
        resource: {
          names: [
            {
              givenName: first,
              familyName: last,
            },
          ],
          phoneNumbers: [
            {
              value: `${mobile}`,
              type: 'mobile',
            },
          ],
        },
      },
      (err, me) => {
        // console.log(err || me);
        if (err) {
          rej(err);
        } else {
          res(me);
        }
      },
    );
  });
};
