// https://developers.google.com/people/api/rest/v1/people/searchContacts
const { generatePeopleObj } = require('../utilities/jwt');

// Send a warmup request with empty query to update the cache as recommended by Google
async function warmup() {
  const people = await generatePeopleObj();

  return new Promise((resolve, reject) => {
    people.people.searchContacts(
      {
        query: '',
        readMask: 'names,phoneNumbers',
        pageSize: 1,
      },
      (err, response) => {
        if (err) {
          console.error('Search contacts warmup error:', err);
          reject(err);
        } else {
          resolve(response);
        }
      },
    );
  });
}

// Search contacts by name
async function search(options) {
  const { query } = options;
  const people = await generatePeopleObj();

  return new Promise((resolve, reject) => {
    people.people.searchContacts(
      {
        query,
        readMask: 'names,phoneNumbers,emailAddresses',
        pageSize: 10,
      },
      (err, { data }) => {
        if (err) {
          console.error('Search contacts error:', err);
          reject(err);
        } else {
          // Process the results to match format used in the app
          const contacts = (data.results || []).map((result, index) => {
            const person = result.person;

            // Process the same way as in list.js
            const obj = {
              id: index,
              name:
                person &&
                person.names &&
                person.names.length > 0 &&
                person.names[0].displayName,
              mobile:
                person.phoneNumbers &&
                person.phoneNumbers.length > 0 &&
                (
                  person.phoneNumbers[0].canonicalForm ||
                  person.phoneNumbers[0].value ||
                  '0'
                ).replace(/\s/g, ''),
              resourceName: person.resourceName,
            };

            obj.display = `${obj.name} - ${obj.mobile}`;
            return obj;
          });

          resolve(contacts);
        }
      },
    );
  });
}

module.exports = {
  default: search,
  warmup
};
