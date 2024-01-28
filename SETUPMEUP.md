## How to Co-Develop with Remote

### Step 1 - 'SA BRANCH'
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

### Step 2 - 'SA BRANCH'
* I have enabled CORS on 'master branch'
* ssh sohoe -L 4000:localhost:3002


### Step 5 - 'SA BRANCH'
* https://github.com/chunkiat82/rarebeauty-ui/wiki/Import-Guide-on-CORS
* JWT_SECRET=`replacewithsecret` PORT=3000 API_CLIENT_URL=localhost:4000 npm start

### Step 6 - NOT NEEDED NOW [20230218]

Remember to use the CORS Plugin in Chrome

