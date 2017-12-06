import fetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { UnauthorizedError as Jwt401Error } from 'express-jwt';

import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import createFetch from './createFetch';
import { setRuntimeVariable } from './actions/runtime';
import router from './router';
import config from './config';

import App from './components/App';
import Html from './components/Html';

export const reactMiddleware = async (req, res, next) => {
  try {
    const css = new Set();
    // console.error(req.headers);
    // not sure if this is a good idea???
    req.url = req.originalUrl;

    const { data: reqData } = req;

    let initialState = req.initialState || {
      user: req.user || null,
    };

    initialState = { ...reqData, ...initialState };

    const store = configureStore(initialState, {
      fetch,
      // I should not use `history` on server.. but how I do redirection? follow universal-router
    });

    // console.log(store);

    store.dispatch(
      setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }),
    );

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      // Universal HTTP client
      fetch: createFetch(fetch, {
        baseUrl: config.api.serverUrl,
        cookie: req.headers.cookie,
      }),
      userAgent: req.headers['user-agent'],
      store,
      storeSubscription: null,
    };
    // console.log(` req.userAgent=${ req.userAgent}`);

    // route.component will have this context too

    // console.log(req.path);

    const route = await router.resolve({
      ...context,
      path: req.path,
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
      apiUrl: config.api.clientUrl,
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
    res.clearCookie('token');
    res.status(401);
    // return res.status(401).send('Unauthorized Access...Please leave');
    // handle error pages
    // return
  }

  // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie('id_token');
  }
  next(err);
};

export default { reactMiddleware, reactErrorMiddleware };
