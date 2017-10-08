// https://developers.google.com/apis-explorer/?hl=en_US#p/
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = async function update({
  resourceName,
  first,
  last,
  mobile,
  verified,
}) {
  const jwtClient = await generateJWT('rarebeauty@soho.sg');

  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  return new Promise((res, rej) => {
    people.people.updateContact(
      {
        resourceName,
        updatePersonFields: 'phoneNumbers',
      },
      {
        resource: {
          person: {
            etag: '111',
          },
          // "etag": "%CAEiDENqMWRhdGNTRTJBPQ==",
          metadata: {
            sources: [
              {
                type: 'CONTACT',
                id: '5cd05bf98b8dbf9a',
                etag: '#Cj1datcSE2A=',
                updateTime: '2017-10-08T05:53:55.182001Z',
              },
            ],
          },
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
              metadata: {
                verified: verified !== undefined ? verified : true,
              },
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
