// https://developers.google.com/apis-explorer/?hl=en_US#p/

import google from 'googleapis';
import { get as getConfig } from '../utilities/configs';
import getList from './list';

const generateJWT = require('../utilities/jwt');

const WORK_EMAIL = getConfig('work_email');

export default async function create({ first, last, mobile }) {
  const jwtClient = await generateJWT(WORK_EMAIL);
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
      async (err, me) => {
        // console.log(err || me);
        if (err) {
          rej(err);
        } else {
          await getList({ forceRefresh: true });
          res(me);
        }
      },
    );
  });
}
