type Fetch = (url: string, options: ?any) => Promise<any>;

type Options = {
  baseUrl: string,
  cookie?: string,
  originatingUrl?: string,
};


// need to fix how to share token 
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/

function createFetch(fetch: Fetch, { baseUrl, originatingUrl, headers={} }: Options) {
  // NOTE: Tweak the default options to suite your application needs
  // console.log(token);
  const defaults = {
    method: 'POST', // handy with GraphQL backends
    //mode: baseUrl ? 'cors' : 'same-origin',
    mode : 'cors',
    // credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Originating-Url': originatingUrl,
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
            ...headers
          },
          credentials: "include"
        })
      : fetch(url, options);
}

export default createFetch;
