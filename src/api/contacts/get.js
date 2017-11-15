// https://developers.google.com/apis-explorer/?hl=en_US#p/
// babel-node cli --action=updateContact --verified=false --resourceName=people/YYY --mobile=XX
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

export default async function get(options) {
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
          res(me);
        }
      },
    );
  });
}
