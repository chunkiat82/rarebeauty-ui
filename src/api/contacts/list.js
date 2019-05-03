// https://developers.google.com/apis-explorer/?hl=en_US#p/

import google from 'googleapis';
import { get as getConfig } from '../utilities/configs';

const generateJWT = require('../utilities/jwt');

const WORK_EMAIL = getConfig('work_email');

// function

export default async function list() {
  const jwtClient = await generateJWT(WORK_EMAIL);
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
        let contacts = me.connections.filter(contact =>
          Array.isArray(contact.phoneNumbers),
        );
        contacts = contacts.map((one, index) => {
          // console.log(one);

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
            mobile: (phoneNumbers[0].canonicalForm ||
              phoneNumbers[0].value ||
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
}
