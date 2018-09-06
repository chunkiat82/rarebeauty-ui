// https://developers.google.com/apis-explorer/?hl=en_US#p/
// babel-node cli --action=updateContact --verified=false --resourceName=people/YYY --mobile=XX
import google from 'googleapis';
import { get as getConfig } from '../utilities/configs';

const generateJWT = require('../utilities/jwt');

const WORK_EMAIL = getConfig('work_email');

export default async function get(options) {
  const { resourceName } = options;
  const jwtClient = await generateJWT(WORK_EMAIL);

  const people = google.people({
    version: 'v1',
    auth: jwtClient,
  });

  return new Promise((res, rej) => {
    people.people.get(
      {
        resourceName,
        personFields: ['names', 'phoneNumbers', 'userDefined'],
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
