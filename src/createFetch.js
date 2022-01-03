type Fetch = (url: string, options: ?any) => Promise<any>;

type Options = {
  baseUrl: string,
  cookie?: string,
};


// need to fix how to share token 
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/

function createFetch(fetch: Fetch, { baseUrl, cookie, token }: Options) {  
  // NOTE: Tweak the default options to suite your application needs
  // console.log(token);
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    //mode: baseUrl ? 'cors' : 'same-origin',
    mode : 'cors',
    // credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : null),
    },
  };
  // console.log('defaults', defaults);
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
