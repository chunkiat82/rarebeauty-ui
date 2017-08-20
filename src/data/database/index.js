const couchbase = require('couchbase');
const config = require('../../config.js');
const cluster = new couchbase.Cluster(config.couchbaseUrl);

export async function upsert(id, doc) {
  // console.log(id);
  // console.log(doc);
  const obj = await runOperation(setObject, { id, doc });
  return obj;
}

export async function get(id) {  
  const obj = await runOperation(getObject, { id });
  // console.log(obj);
  return obj;
}

export async function remove(id) {
  const obj = await runOperation(deleteObject, { id });
  return obj;
}

async function runOperation(operation, options) {
  const bucket = cluster.openBucket('default');
  let res = null;
  try {
    res = await operation(bucket, options);
  } catch (err) {
    console.log(err);
    throw err;    
  }
  bucket.disconnect();
  return res;
}

function getObject(bucket, options) {
  const { id } = options;
  return new Promise((res, rej) => {
    bucket.get(id, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

function deleteObject(bucket, options) {
  const { id } = options;
  return new Promise((res, rej) => {
    bucket.remove(id, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
}

function setObject(bucket, options) {
  const { id, doc } = options;
  return new Promise((res, rej) => {
    bucket.upsert(id, doc, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
}
export default {
  upsert,
  get,
  remove,
};
