## How to Co-Develop with RB V2

### Step 1

Setup RB V2 as API server

Add the following lines in server.js (before alot of inceptors, early part)

```js
// super temporary lin #######
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  return next();
});
```

### Step 2
Run RB V2 npm start

### Step 3
Update createFetch.js

Make sure you replace the JWT in the authorization
Make sure you change the mode to 'cors'

Revert these changes with you push

```js
function createFetch(fetch: Fetch, { baseUrl, cookie, token }: Options) {  
  // NOTE: Tweak the default options to suite your application needs  
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    //mode: baseUrl ? 'cors' : 'same-origin',
    mode : 'cors',
    //credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Authorization': `replaceWithJWT`,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : null),
    },
  };
```

### Step 4
Run RB V3 with the following line

* JWT_SECRET=`replacewithsecret` API_CLIENT_URL=http://localhost:4000 npm start

### Step 5

Tunnel to the API

* ssh sohoe -L 4000:localhost:3002

### Step 6
Start browser with the follow line

* http://localhost:3000/?API_CLIENT_URL=http://localhost:4000


Remember to use the CORS Plugin in Chrome