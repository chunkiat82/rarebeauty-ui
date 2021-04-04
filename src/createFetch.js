type Fetch = (url: string, options: ?any) => Promise<any>;

type Options = {
  baseUrl: string,
  cookie?: string,
};


// need to fix how to share token 
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/

function createFetch(fetch: Fetch, { baseUrl, cookie, token }: Options) {  
  // NOTE: Tweak the default options to suite your application needs  
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    //mode: baseUrl ? 'cors' : 'same-origin',
    mode : 'cors',
    //credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJidXNpbmVzc0Bzb2hvLnNnIiwiaWF0IjoxNjE2MzM3MjA0fQ.fjaG97bF6tzZaCimRsLgKDZlvmFLRXBRQ6mqQiIE1TA',
      'Content-Type': 'application/json',
      // 'Authorization': token,
      ...(cookie ? { Cookie: cookie } : null),
    },
  };
  
  return (url: string, options: any) =>
    url.startsWith('/graphql') || url.startsWith('/api')
      ? fetch(`${baseUrl}${url}`, {
          ...defaults,
          ...options,
          headers: {
            ...defaults.headers,
            ...(options && options.headers),
          },
        })
      : fetch(url, options);
}

export default createFetch;
