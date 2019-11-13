// ssh sohoe -L 8092:172.17.0.1:8092 -L 8091:172.17.0.1:8091 -L 11207:172.17.0.1:11207  -L 11210:172.17.0.1:11210 -L 8093:172.17.0.1:8093
const couchbase = require('couchbase');
const config = require('../../config.js');

const cluster = new couchbase.Cluster(config.couchbaseUrl);
const N1qlQuery = couchbase.N1qlQuery;
const bucket = cluster.openBucket('default');
bucket.enableN1ql([config.couchbaseQueryUrl]);

async function runOperation(operation, options) {
  let res = null;
  try {
    res = await operation(options);
  } catch (err) {
    // console.error(`runOperation=${JSON.stringify(err)}`);
    res = null;
    // throw err;
  }
  // bucket.disconnect();
  return res;
}

function getObject(options) {
  const { id } = options;
  return new Promise((res, rej) => {
    bucket.get(id, (err, result) => {
      if (err) {
        console.error(`Err getObject id=${options.id}`);
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

function deleteObject(options) {
  const { id } = options;
  return new Promise((res, rej) => {
    bucket.remove(id, (err, result) => {
      if (err) {
        console.error(`Err deleteObject id=${options.id}`);
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

function setObject(options) {
  const { id, doc } = options;
  return new Promise((res, rej) => {
    bucket.upsert(
      id,
      doc,
      {
        persist_to: 1,
      },
      (err, result) => {
        if (err) {
          console.error(`Err setObject id=${options.id}`);
          rej(err);
        } else {
          res(result);
        }
      },
    );
  });
}

function queryOperation(options) {
  const { queryString } = options;

  // console.log(`queryString1=${queryString}`);
  // select * from default events where extendedProperties.shared.resourceName='people/c6618236514557043606 limit 0,10';
  const n1Query = N1qlQuery.fromString(queryString);

  return new Promise((res, rej) => {
    bucket.query(n1Query, (err, rows) => {
      if (err) {
        console.error(`Err queryOperation n1Query=${n1Query}`);
        rej(err);
      } else {
        res(rows);
      }
    });
  });
}

export async function upsert(id, doc) {
  // console.log(id);
  // console.log(doc);
  const obj = await runOperation(setObject, {
    id,
    doc,
  });
  return obj;
}

export async function get(id) {
  const obj = await runOperation(getObject, {
    id,
  });
  // console.log(obj);
  return obj;
}

export async function remove(id) {
  const obj = await runOperation(deleteObject, {
    id,
  });
  return obj;
}

export async function query(queryString) {
  // https://developer.couchbase.com/documentation/server/4.1/sdks/node-2.0/n1ql-queries.html
  const obj = await runOperation(queryOperation, {
    queryString,
  });
  return obj;
}

export default {
  upsert,
  get,
  remove,
  query,
};
