// https://developers.google.com/apis-explorer/?hl=en_US#p/
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = async function list() {
  const jwtClient = await generateJWT('rarebeauty@soho.sg');
  const people = google.people({ version: 'v1', auth: jwtClient });

  return new Promise((res, rej) => {
    people.people.connections.list(
      {
        resourceName: 'people/me',
        personFields: 'names,phoneNumbers',
      },
      (err, me) => {
        if (err) {
          rej(err);
          return;
        }
        // console.log(me);
        // console.log(JSON.stringify(me, null, 2));
        const final = me.connections.map((one, index) => ({
          id: index,
          name:
            one &&
            one.names &&
            one.names.length > 0 &&
            one.names[0].displayName,
          mobile: ((one.phoneNumbers &&
            (one.phoneNumbers[0].canonicalForm || one.phoneNumbers[0].value)) ||
            '0')
            .replace(/\s/g, ''),
          resourceName: one.resourceName,
        }));
        // console.log(JSON.stringify(final, null, 2));
        final.sort((a, b) => a.name.localeCompare(b.name));
        res(final);
      },
    );
  });
};
