/* eslint-disable no-underscore-dangle */

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import { reactMiddleware } from './reactMiddleware';
import config from './config';

const __DEV__ = !(String(process.env.PRODUCTION) === 'true');
const unknownUserJWT = page => ({
  user: 'unknown',
  page,
  role: 'user',
  tenant: 'rarebeauty',
});
const app = express();

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
  // req.payload = payload; //not sure if we can deprecate
  req.auth = payload;
  done(null, secret);
}

/**
 *
 * @param {*} url
 * @returns
 */
function createToken(url) {
  return jwt.sign(unknownUserJWT(url), config.auth.jwt.secret, {
    expiresIn: '1h',
  });
}

/**
 * Refresh token for non-admin users or when there is no token
 * @param {*} token
 * @param {*} url
 * @returns
 */
function refreshToken(token, url) {
  if (token) {
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    if (decoded && decoded.role === 'admin') {
      return token;
    }
  }
  return createToken(url);
}

// this function has to be called after expressJwt check
function refreshCookie(req, res, next) {
  const token = req.token;
  let expires = new Date(Date.now() + 24 * 3600 * 1000);
  if (req.auth) {
    expires = new Date(req.auth.exp * 1000 - 2000);
  }
  // so that cookie expire before JWT to renew one
  res.cookie('token', token, {
    expires,
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
    domain: __DEV__ ? 'localhost' : '.soho.sg',
    path: '/',
  });

  // if (next) return next();
  return next();
}

app.use(
  expressJwt({
    secret: checkingUser,
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
      if (req.query && req.query.token) {
        // console.log('i was here with query');
        req.token = refreshToken(req.query.token, req.originalUrl);
        return req.token;
      } else if (req.cookies.token) {
        // console.log('i was here with cookies');
        req.token = refreshToken(req.cookies.token, req.originalUrl);
        return req.token;
      }
      // console.log('i was here with nothing', req.originalUrl);
      req.token = createToken(req.originalUrl);
      return req.token;
    },
  }).unless({
    path: ['/events/calendar', /\/assets*/],
  }),
);

app.use('*', refreshCookie);

// Error handler for express-jwt
// app.use(reactErrorMiddleware);

app.use('*', reactMiddleware);

//
// Error handling
// -----------------------------------------------------------------------------
if (__DEV__) {
  const pe = new PrettyError();
  pe.skipNodeFiles();
  pe.skipPackage('express');
}

//
// Launch the server
// -----------------------------------------------------------------------------
if (!module.hot) {
  const port = config.port;
  app.listen(port, () => {
    console.info(`The server is running at http://localhost:${port}/`);
  });
} else {
  // development mode
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
