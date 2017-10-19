// https://developers.google.com/apis-explorer/?hl=en_US#p/
// babel-node cli --action=updateContact --verified=false --resourceName=people/YYY --mobile=XX
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

  // console.error(`verified=${verified}` !== undefined ? verified : true);

  people.people.updateContact(
    {
      resourceName,
      updatePersonFields: ['phoneNumbers', 'userDefined'],
      resource: {
        etag: me.etag,
        phoneNumbers: [
          {
            value: `${mobile}`,
            type: 'mobile',
          },
        ],
        userDefined: [
          {
            key: 'mb',
            value: verified !== undefined ? verified : true,
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
        personFields: ['phoneNumbers', 'userDefined'],
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
