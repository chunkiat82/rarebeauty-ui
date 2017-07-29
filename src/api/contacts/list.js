// https://developers.google.com/apis-explorer/?hl=en_US#p/
const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

module.exports = async function list() {
  const jwtClient = await generateJWT('rarebeauty@soho.sg');
  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  return new Promise((res, rej) => {
    people.people.connections.list(
      {
        resourceName: 'people/me',
        personFields: 'names,phoneNumbers',
        pageSize: 2000, // future problem
      },
      (err, me) => {
        if (err) {
          rej(err);
          return;
        }
        // console.log(me.connections.length);
        // console.log(JSON.stringify(me, null, 2));
        const contacts = me.connections.map((one, index) => {
          const obj = {
            id: index,
            name:
              one &&
              one.names &&
              one.names.length > 0 &&
              one.names[0].displayName,
            mobile: ((one.phoneNumbers &&
              (one.phoneNumbers[0].canonicalForm ||
                one.phoneNumbers[0].value)) ||
              '0')
              .replace(/\s/g, ''),
            resourceName: one.resourceName,
          };
          obj.display = `${obj.name} - ${obj.mobile}`;
          return obj;
        });

        contacts.sort((a, b) => (a.name && a.name.localeCompare(b.name)) || 0);

        const final = [];
        contacts.forEach(item => {
          if (item.name && item.mobile) final[final.length] = item;
        });
        res(final);
      },
    );
  });
};
