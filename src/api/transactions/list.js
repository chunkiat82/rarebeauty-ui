const { query } = require('../../data/database');
const moment = require('moment');

// Helper function to get the fully qualified collection name using environment variables
function getCollectionPath(tenantName) {
  if (tenantName === 'legacy') {
    return 'default';
  }
  
  // Use environment variables directly instead of tenantConfig
  const bucketName = process.env.CB_BUCKET || 'appointments';
  const scopeName = process.env.CB_SCOPE || tenantName;
  const collectionName = process.env.CB_COLLECTION || 'default';
  
  return `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``;
}

function listTransactions(options) {
  // console.log(options);
  const { startDT, endDT, context } = options;
  const tenantName = context?.tenant || 'rarebeauty';
  const collectionFullName = getCollectionPath(tenantName);

  return new Promise(async (res, rej) => {
    const queryString = `select * from ${collectionFullName} doc where META(doc).id LIKE 'trans%' and apptDate > '${moment(
      startDT,
    ).toISOString()}' and apptDate < '${moment(
      endDT,
    ).toISOString()}' order by apptDate`;

    try {
      //   console.log(queryString);
      const idObjs = await query(queryString, context);
      res({
        results: idObjs,
      });
    } catch (err) {
      console.error(`Error byPerson=${JSON.stringify(err)}`);
      rej(err);
    }
  });
}

module.exports = {
  listTransactions,
  default: listTransactions
};
