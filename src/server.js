// https://github.com/kriasoft/react-starter-kit/blob/master/docs/recipes/how-to-implement-routing.md

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import expressGraphQL from 'express-graphql';
// import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import _httpErrorPages from 'http-error-pages';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import createFetch from './createFetch';
import passport from './passport';
import router from './router';
import models from './data/models';
import schema from './data/schema';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import { setRuntimeVariable } from './actions/runtime';
import config from './config';
import { handleCalendarWebhook } from './hooks';
import { logLogin } from './data/database/login';

import API from './api/';

const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
function checkingUser(req, payload, done) {
  const secret = config.auth.jwt.secret;
  logLogin(payload.data.username, payload);
  // console.log(payload);
  done(null, secret);
}

if (!__DEV__) {
  app.use(
    expressJwt({
      secret: checkingUser,
      credentialsRequired: true,
      getToken: function fromHeaderOrQuerystring(req) {
        if (req.cookies.token) {
          return req.cookies.token;
        } else if (req.query && req.query.token) {
          return req.query.token;
        }
        return null;
      },
    }).unless({
      path: [/\/events\/calendar/, /\/public\/appointment\/confirm\/.*/],
    }),
  );
  // Error handler for express-jwt

  app.use((err, req, res, next) => {
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
  });

  app.use((req, res, next) => {
    if (req.query.token) {
      const expiresIn = 60 * 60 * 24 * 180; // 180 days
      res.cookie('token', req.query.token, {
        maxAge: 1000 * expiresIn,
        httpOnly: true,
      });
    }
    next();
  });
}

app.use(passport.initialize());

// if (__DEV__) {
//   app.enable('trust proxy');
// }
// app.get(
//   '/login/facebook',
//   passport.authenticate('facebook', {
//     scope: ['email', 'user_location'],
//     session: false,
//   }),
// );
// app.get(
//   '/login/facebook/return',
//   passport.authenticate('facebook', {
//     failureRedirect: '/login',
//     session: false,
//   }),
//   (req, res) => {
//     const expiresIn = 60 * 60 * 24 * 180; // 180 days
//     const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
//     res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
//     res.redirect('/');
//   },
// );

//
// Register API middleware
// -----------------------------------------------------------------------------
app.use(
  '/graphql',
  expressGraphQL(async req => ({
    schema,
    graphiql: __DEV__,
    rootValue: { request: req },
    pretty: __DEV__,
  })),
);

app.use('/events/calendar', async (req, res) => {
  await handleCalendarWebhook(req.headers);
  res.sendStatus(200);
});

app.use('/public/appointment/confirm/:eventId', async (req, res) => {
  const { eventId } = req.params;
  console.error(`req.params.eventId=${eventId}`);
  // do something here to update to confirm
  await API({ action: 'patchEvent', status: 'confirmed', eventId });
  res.status(200);
  res.send(
    `<!doctype html><html><body style="background-color:#373277"><h1><center><span style="color:white">Your Appointment is confirmed!</span></center></h1></body></html>`,
  );
});

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    const initialState = {
      user: req.user || null,
    };

    const store = configureStore(initialState, {
      fetch,
      // I should not use `history` on server.. but how I do redirection? follow universal-router
    });

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
});

//
// Error handling
// -----------------------------------------------------------------------------
if (__DEV__) {
  const pe = new PrettyError();
  pe.skipNodeFiles();
  pe.skipPackage('express');

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(pe.render(err));
    const html = ReactDOM.renderToStaticMarkup(
      <Html
        title="Internal Server Error_httpErrorPages(app);"
        description={err.message}
        styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
      >
        {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
      </Html>,
    );
    res.status(err.status || 500);
    res.send(`<!doctype html>${html}`);
  });
} else {
  _httpErrorPages(app);
}

//
// Launch the server
// -----------------------------------------------------------------------------
const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
  promise.then(() => {
    app.listen(config.port, () => {
      console.info(`The server is running at http://localhost:${config.port}/`);
    });
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
