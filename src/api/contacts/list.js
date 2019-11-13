/* eslint-disable consistent-return */
// https://developers.google.com/apis-explorer/?hl=en_US#p/
const { generatePeopleObj } = require('../utilities/jwt');

// function
let cache = [];
// let stateTimer = setTimeout()

export default async function list(options = { forceRefresh: false }) {
  const { forceRefresh } = options;
  // console.log("forceRefresh", forceRefresh);
  const people = await generatePeopleObj();

  // caching is amazing but becareful when it becomes stale
  return new Promise((res, rej) => {
    if (cache.length > 0 && forceRefresh !== true) {
      return res(cache);
    }
    // console.log('i was here her her');
    people.people.connections.list(
      {
        resourceName: 'people/me',
        personFields: 'names,phoneNumbers',
        pageSize: 2000, // future problem
      },
      (err, { data }) => {
        if (err) {
          return rej(err);
        }
        // console.log(me.connections.length);
        // console.log(JSON.stringify(me, null, 2));

        let contacts = data.connections.filter(contact =>
          Array.isArray(contact.phoneNumbers),
        );
        contacts = contacts.map((one, index) => {
          const phoneNumbers = one.phoneNumbers.filter(
            number => number.type !== 'whatsapp',
          );

          const obj = {
            id: index,
            name:
              one &&
              one.names &&
              one.names.length > 0 &&
              one.names[0].displayName,
            mobile: (
              phoneNumbers[0].canonicalForm ||
              phoneNumbers[0].value ||
              '0'
            ).replace(/\s/g, ''),
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
        cache = final;
        return res(cache);
      },
    );
  });
}
