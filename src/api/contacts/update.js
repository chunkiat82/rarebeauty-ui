// https://developers.google.com/apis-explorer/?hl=en_US#p/
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

async function updateContact(
  { resourceName, first, last, mobile, verified, etag },
  me,
  cb,
) {
  const jwtClient = await generateJWT('rarebeauty@soho.sg');
  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  people.people.updateContact(
    {
      resourceName,
      updatePersonFields: 'phoneNumbers',
      resource: {
        etag: me.tag,
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
    {},
    cb,
  );
}

module.exports = async function update(options) {
  const { resourceName } = options;
  const jwtClient = await generateJWT('rarebeauty@soho.sg');

  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  return new Promise((res, rej) => {
    people.people.get(
      {
        resourceName,
      },
      {},
      (err, me) => {
        // console.log(err || me);
        if (err) {
          rej(err);
        } else {
          updateContact(options, me, (errUpdate, meUpdate) => {
            if (errUpdate) {
              rej(errUpdate);
            } else {
              res(meUpdate);
            }
          });
        }
      },
    );
  });
};
