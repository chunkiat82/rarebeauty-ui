// ssh sohon -L 18091:172.17.0.1:18091 -L 18092:172.17.0.1:18092 -L 18093:172.17.0.1:18093 -L 18094:172.17.0.1:18094 -L 8094:172.17.0.1:8094 -L 8092:172.17.0.1:8092 -L 8091:172.17.0.1:8091 -L 11207:172.17.0.1:11207  -L 11210:172.17.0.1:11210 -L 8093:172.17.0.1:8093 -L 11211:172.17.0.1:11211
const couchbase = require('couchbase');
const config = require('../../config.js');
const tenantsConfig = require('../../api/keys/tenants.json');

const defaultBucketName = process.env.CB_BUCKET || 'default';
const defaultScopeName = process.env.CB_SCOPE || '_default';
const defaultCollectionName = process.env.CB_COLLECTION || '_default';
const defaultUsername = process.env.CB_USERNAME || '_default';
const defaultPassword = process.env.CB_PASSWORD || '_default';
const clusterConnStr = config.couchbase.url;

const clusterCache = {};

function findClusterFromCache(tenant) {
  return clusterCache[tenant];
}
async function findConfig(tenant) {
  if (tenantsConfig[tenant]) {
    const {
      bucketName,
      scopeName,
      collectionName,
      username,
      password,
    } = tenantsConfig[tenant].database;
    return {
      bucketName,
      scopeName,
      collectionName,
      username,
      password,
    };
  }
  // if no tenant found

  return {
    bucketName: defaultBucketName,
    scoscopeNamepe: defaultScopeName,
    collectionName: defaultCollectionName,
    username: defaultUsername,
    password: defaultPassword,
  };
}

/**
 * First it finds the current connection with tenant name in context
 * If it exists then the operations continutes
 * If it does not, then it will find the tenant config to create a new connection then add to cache
 *
 * @param {*} context
 * @returns
 */
async function connect(context) {
  console.error('context', context);
  console.error('all details', JSON.stringify(config.couchbase));

  const { tenant } = context;
  const cacheCluster = findClusterFromCache(tenant);
  const databaseConfig = findConfig(tenant);
  const {
    scopeName,
    bucketName,
    collectionName,
    username,
    password,
  } = databaseConfig;
  console.error('databaseConfig', databaseConfig);
  let cluster = null;

  if (!cacheCluster) {
    console.error('clusterConnStr', clusterConnStr);
    cluster = await couchbase.connect(clusterConnStr, {
      username,
      password,
    });
    console.error('context7', context);
    clusterCache[tenant] = cluster;
    console.error('context8', context);
  } else {
    cluster = cacheCluster;
  }
  console.error('context9', context);
  const bucket = cluster.bucket(bucketName);
  const scope = bucket.scope(scopeName);
  const collection = scope.collection(collectionName);
  return { bucket, scope, collection, cluster };
  // For a secure cluster connection, use `couchbases://<your-cluster-ip>` instead.
}

async function getObject(options) {
  const { collection } = await connect(options.context);
  console.log('database getObject collection', collection);
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
  const { collection } = await connect(options.context);
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
  const { collection } = await connect(options.context);
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
  const { cluster } = await connect(options.context);
  try {
    const { rows } = await cluster.query(queryString, {});
    // console.log('rows', rows);
    return rows;
  } catch (err) {
    console.error('err', err);
    return [];
  }
}

async function runOperation(operation, options, context) {
  let res = null;
  try {
    res = await operation({ ...options, context });
  } catch (err) {
    console.error(`error runOperation=${JSON.stringify(err)}`);
    res = null;
    // throw err;
  }
  // bucket.disconnect();
  return res;
}

export async function upsert(id, doc, context) {
  // console.log(id);
  // console.log(doc);
  const obj = await runOperation(
    setObject,
    {
      id,
      doc,
    },
    context,
  );
  return obj;
}

// couchbase response changed from value to content from 4 to 6.6
export async function get(id, context) {
  const obj = await runOperation(
    getObject,
    {
      id,
    },
    context,
  );
  // console.log(obj.content);
  return obj.content;
}

export async function remove(id, context) {
  const obj = await runOperation(
    deleteObject,
    {
      id,
    },
    context,
  );
  return obj;
}

export async function query(queryString, context) {
  // https://developer.couchbase.com/documentation/server/4.1/sdks/node-2.0/n1ql-queries.html
  const obj = await runOperation(
    queryOperation,
    {
      queryString,
    },
    context,
  );
  return obj;
}

export default {
  upsert,
  get,
  remove,
  query,
};
