// ssh sohon -L 18091:172.17.0.1:18091 -L 18092:172.17.0.1:18092 -L 18093:172.17.0.1:18093 -L 18094:172.17.0.1:18094 -L 8094:172.17.0.1:8094 -L 8092:172.17.0.1:8092 -L 8091:172.17.0.1:8091 -L 11207:172.17.0.1:11207  -L 11210:172.17.0.1:11210 -L 8093:172.17.0.1:8093 -L 11211:172.17.0.1:11211
const couchbase = require('couchbase');
const config = require('../../config.js');

const bucketName = process.env.CB_BUCKET || 'default';
const scopeName = process.env.CB_SCOPE || '_default';
const collectionName = process.env.CB_COLLECTION || '_default';

async function connect() {
  // For a secure cluster connection, use `couchbases://<your-cluster-ip>` instead.

  let cluster = null;
  let bucket = null;
  let scope = null;
  let collection = null;

  if (cluster && scope && bucket && collection)
    return { bucket, scope, collection, cluster };

  console.error('all details', JSON.stringify(config.couchbase));
  // console.error('all env', JSON.stringify(process.env));

  const clusterConnStr = config.couchbase.url;
  const username = config.couchbase.username;
  const password = config.couchbase.password;

  cluster = await couchbase.connect(clusterConnStr, {
    username,
    password,
  });

  bucket = cluster.bucket(bucketName);

  // Get a reference to the default collection, required only for older Couchbase server versions
  scope = bucket.scope(scopeName);
  collection = scope.collection(collectionName);
  return { bucket, scope, collection, cluster };
}

async function getObject(options) {
  const { collection } = await connect();

  const { id } = options;
  return new Promise((res, rej) => {
    collection.get(id, (err, result) => {
      if (err) {
        console.error(`Err getObject id=${options.id}`);
        console.error(`getObject err`, err);
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

async function deleteObject(options) {
  const { collection } = await connect();
  const { id } = options;
  return new Promise((res, rej) => {
    collection.remove(id, (err, result) => {
      if (err) {
        console.error(`Err deleteObject id=${options.id}`);
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

async function setObject(options) {
  const { collection } = await connect();
  const { id, doc } = options;
  return new Promise((res, rej) => {
    collection.upsert(
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

async function queryOperation(options) {
  const { queryString } = options;

  // console.log(`queryString1=${queryString}`);
  // select * from default events where extendedProperties.shared.resourceName='people/c6618236514557043606 limit 0,10';
  const { cluster } = await connect();
  try {
    const { rows } = await cluster.query(queryString, {});
    // console.log('rows', rows);
    return rows;
  } catch (err) {
    console.error('err', err);
    return [];
  }
}

async function runOperation(operation, options) {
  let res = null;
  try {
    res = await operation(options);
  } catch (err) {
    console.error(`runOperation=${JSON.stringify(err)}`);
    res = null;
    // throw err;
  }
  // bucket.disconnect();
  return res;
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

// couchbase response changed from value to content from 4 to 6.6
export async function get(id) {
  const obj = await runOperation(getObject, {
    id,
  });
  // console.log(obj.content);
  return obj.content;
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
