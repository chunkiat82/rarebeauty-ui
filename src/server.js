// https://github.com/kriasoft/react-starter-kit/blob/master/docs/recipes/how-to-implement-routing.md

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import noBots from 'express-nobots';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
// import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import _httpErrorPages from 'http-error-pages';

import passport from './passport';
import models from './data/models';
import schema from './data/schema';

import { handleCalendarWebhook } from './hooks';
import { logLogin } from './data/database/login';
import { reactMiddleware, reactErrorMiddleware } from './reactMiddleware';
import API from './api/';

import config from './config';

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
  if (payload.data) {
    logLogin(payload.data.username, payload);
  }
  done(null, secret);
}

if (!__DEV__) {
  // const myFilter = function(req) {
  //   console.error(req.url.indexOf('/public/appointment/confirm/') === 0);
  //   console.error(req.url);

  //   if (
  //     req.url.indexOf('/public/appointment/confirm/') === 0 ||
  //     /\/events\/calendar/.test(req.url)
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };
  app.use(noBots({ block: true }));
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
      path: ['/events/calendar', /\/general*/, /\/assets*/],
    }),
  );
  // Error handler for express-jwt

  app.use(reactErrorMiddleware);

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
  await API({ action: 'patchEvent', status: 'confirmed', eventId });
  res.status(200);
  res.send(
    `<!doctype html><html><body style="background-color:#373277"><h1><center><span style="color:white">Your Appointment is confirmed!</span></center></h1></body></html>`,
  );
});

app.use('/general/confirmation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;

  const event = await API({ action: 'getEvent', eventId });
  req.data = { event, workAddress: config.app.workAddress };
  await API({ action: 'patchEvent', status: 'confirmed', eventId });

  reactMiddleware(req, res, next);
});

app.use('/general/reservation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;
  const event = await API({ action: 'getEvent', eventId });
  req.data = { event, workAddress: config.app.workAddress };

  reactMiddleware(req, res, next);
});

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', reactMiddleware);

//
// Error handling
// -----------------------------------------------------------------------------
if (__DEV__) {
  const pe = new PrettyError();
  pe.skipNodeFiles();
  pe.skipPackage('express');

  // eslint-disable-next-line no-unused-vars
  app.use(reactErrorMiddleware);
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
