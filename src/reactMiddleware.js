import fetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';

import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import createFetch from './createFetch';
// import { setRuntimeVariable } from './actions/runtime';
import router from './router';
import config from './config';

import App from './components/App';
import Html from './components/Html';

const __DEV__ = !(String(process.env.PRODUCTION) === 'true');

export const reactMiddleware = async (req, res, next) => {
  try {
    const css = new Set();

    const { data: reqData } = req;

    let initialState = req.initialState || {
      user: req.user,
      loading: false,
    };
    initialState = { ...reqData, ...initialState };
    const store = configureStore(initialState, {
      fetch,
    });

    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      // Universal HTTP client backend
      // this needs to be fixed based on session ****
      fetch: createFetch(fetch, {
        baseUrl: __DEV__
          ? `http://${process.env.API_CLIENT_URL}`
          : `http://172.17.0.1:3001`,
        headers: {
          Cookie: `token=${req.token}`,
        },
      }),
      userAgent: req.headers['user-agent'],
      store,
      storeSubscription: null,
    };

    // console.log('req.path', req.path);
    const route = await router.resolve({
      ...context,
      path: req.originalUrl,
      query: req.query,
    });

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };

    data.children = ReactDOM.renderToString(
      <App context={context} store={store}>
        {route.component}
      </App>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];
    data.scripts = [assets.vendor.js];
    if (route.chunks) {
      data.scripts.push(...route.chunks.map(chunk => assets[chunk].js));
    }
    data.scripts.push(assets.client.js);
    data.app = {
      apiUrl: config.apiUrl,
      state: context.store.getState(),
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
};

export const reactErrorMiddleware = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // console.error('UnauthorizedError reactErrorMiddleware', err);
    return res.json({ message: err.TokenExpiredError });
  }

  // eslint-disable-line no-unused-vars
  // if (err instanceof Jwt401Error) {
  //   console.error('[express-jwt-error]', req.cookies.id_token);
  //   // `clearCookie`, otherwise user can't use web-app until cookie expires
  //   return res.clearCookie('token');
  // }
  console.error('User-agent', req.get('user-agent'));
  console.error('err', err);
  return next(err);
};

export default { reactMiddleware, reactErrorMiddleware };
