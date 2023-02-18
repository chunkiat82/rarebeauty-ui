## How to Co-Develop with localhost

### Step 1 - 'MASTER BRANCH'

Setup RB "master branch" as API server

Add the following lines in server.js (before alot of inceptors, early part)

```js
// super temporary line #######
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

## Step 2 - 'MASTER BRANCH'
npm run tunnel

### Step 3 - 'MASTER BRANCH'
JWT_SECRET=`replacewithsecret` PORT=3002 npm start

### Step 4 - 'SA BRANCH'
Update createFetch.js file

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

### Step 5 - 'SA BRANCH'
* https://github.com/chunkiat82/rarebeauty-ui/wiki/Import-Guide-on-CORS
* JWT_SECRET=`replacewithsecret` PORT=3000 API_CLIENT_URL=localhost:3002 npm start

### Step 6 - NOT NEEDED NOW [20230218]
Start browser with the follow line
* http://localhost:3000/?API_CLIENT_URL=localhost:4000

Remember to use the CORS Plugin in Chrome