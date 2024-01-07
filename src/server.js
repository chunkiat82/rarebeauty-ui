import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import { reactMiddleware, reactErrorMiddleware } from './reactMiddleware';
import config from './config';

const __DEV__ = !(String(process.env.PRODUCTION) === 'true');
const expiresIn = 60 * 60 * 24 * 180; // 180 days
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
  req.payload = payload;
  done(null, secret);
}

// this function has to be called after expressJwt check
function checkPublicPrivateCookie(req, res, next) {
  const token =
    req.token ||
    jwt.sign(
      {
        user: 'unknown',
        page: req.originalUrl,
        role: 'user',
        tenant: 'legacy',
      },
      config.auth.jwt.secret,
      { expiresIn: '6h' },
    );

  res.cookie('token', token, {
    maxAge: 1000 * expiresIn,
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
    domain: __DEV__ ? 'localhost' : '.soho.sg',
    path: '/',
  });

  return next();
}

app.use(
  expressJwt({
    secret: checkingUser,
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
      if (req.query && req.query.token) {
        req.token = req.query.token;
        return req.token;
      } else if (req.cookies.token) {
        req.token = req.cookies.token;
        return req.token;
      }
      return req.token;
    },
  }).unless({
    path: ['/events/calendar', /\/general*/, /\/assets*/, /\/page*/, /\/p+/],
  }),
);

// // after checking admin user

app.use('/g*', checkPublicPrivateCookie);
app.use('/p*', checkPublicPrivateCookie);

// for confirmation page or reservation page
app.use('/general/*/:eventId', async (req, res, next) => {
  const { eventId } = req.params;
  if (eventId === 'images') return;
  req.data = {
    workAddress: config.app.workAddress,
    eventId,
  };
  reactMiddleware(req, res, next);
});

// Error handler for express-jwt
app.use(reactErrorMiddleware);

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
