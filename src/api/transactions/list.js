const { query } = require('../../data/database');
const moment = require('moment');

export function listTransactions(options) {
  // console.log(options);
  const { startDT, endDT } = options;

  return new Promise(async (res, rej) => {
    const queryString = `select * from default doc where META(doc).id LIKE 'trans%' and apptDate > '${moment(
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
