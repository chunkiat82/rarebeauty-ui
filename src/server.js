import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import _httpErrorPages from 'http-error-pages';
// import ical from 'ical-generator';
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
function checkingUser(req, _payload, done) {
  const secret = config.auth.jwt.secret;
  done(null, secret);
}

function populatePayload(req, _res, next) {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    req.payload = decoded;
  }
  return next();
}

/* bot denial */
app.use((req, res, next) => {
  if (req.headers.from === 'googlebot(at)googlebot.com') {
    return res.status(401).json({
      message: 'Unathorized Access',
    });
  }
  return next();
});

app.use((req, res, next) => {
  if (req.query.token) {
    res.cookie('token', req.query.token, {
      maxAge: 1000 * expiresIn,
      sameSite: 'none',
      httpOnly: true,
      secure: true,
      domain: __DEV__ ? 'localhost' : '.soho.sg',
      path: '/',
    });
    return next();
  }
  return next();
});

app.use(
  expressJwt({
    secret: checkingUser,
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
      if (req.cookies.token) {
        req.token = req.cookies.token;
        return req.token;
      } else if (req.query && req.query.token) {
        req.token = req.query.token;
        return req.token;
      }

      return null;
    },
  }).unless({
    path: ['/events/calendar', /\/general*/, /\/assets*/, /\/page+/, /\/p+/],
  }),
);

// Error handler for express-jwt
app.use(populatePayload);
app.use(reactErrorMiddleware);

app.use('/general/confirmation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;
  if (eventId === 'images') return;

  const token = jwt.sign(
    {
      user: 'unknown',
      page: '/general/confirmation',
      role: 'user',
      tenant: 'itdepends',
    },
    config.auth.jwt.secret,
    { expiresIn: '1h' },
  );
  req.token = token;

  res.cookie('token', token, {
    maxAge: 1000 * expiresIn,
    sameSite: 'none',
    httpOnly: true,
    secure: true,
    domain: __DEV__ ? 'localhost' : '.soho.sg',
    path: '/',
  });

  req.data = {
    workAddress: config.app.workAddress,
    eventId,
  };

  reactMiddleware(req, res, next);
});

app.use('/general/reservation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;

  const token = jwt.sign(
    {
      user: 'unknown',
      page: '/general/reservation',
      role: 'user',
      tenant: 'itdepends',
    },
    config.auth.jwt.secret,
    { expiresIn: '1h' },
  );
  req.token = token;

  res.cookie('token', token, {
    maxAge: 1000 * expiresIn,
    sameSite: 'none',
    httpOnly: true,
    secure: true,
    domain: __DEV__ ? 'localhost' : '.soho.sg',
    path: '/',
  });

  req.data = {
    workAddress: config.app.workAddress,
    eventId,
  };

  reactMiddleware(req, res, next);
});

app.use('*', reactMiddleware);

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
