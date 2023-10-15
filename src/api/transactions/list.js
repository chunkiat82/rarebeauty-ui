const { query } = require('../../data/database');
const moment = require('moment');

const collectionFullName =
  process.env.CB_BUCKET && process.env.CB_SCOPE && process.env.CB_COLLECTION
    ? `${process.env.CB_BUCKET}.${process.env.CB_SCOPE}.${process.env.CB_COLLECTION}`
    : `default`;

export function listTransactions(options) {
  // console.log(options);
  const { startDT, endDT } = options;

  return new Promise(async (res, rej) => {
    const queryString = `select * from ${collectionFullName} doc where META(doc).id LIKE 'trans%' and apptDate > '${moment(
      startDT,
    ).toISOString()}' and apptDate < '${moment(
      endDT,
    ).toISOString()}' order by apptDate`;

    try {
      //   console.log(queryString);
      const idObjs = await query(queryString);
      res({
        results: idObjs,
      });
    } catch (err) {
      console.error(`Error byPerson=${JSON.stringify(err)}`);
      rej(err);
    }
  });
}

export default listTransactions;
