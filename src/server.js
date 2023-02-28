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

// const PEOPLE_PREFIX = 'people/';

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
  // req.payload = { foo: 'bar' };
  // console.log(`checking req.url`, req.url);
  // console.log(`payload`, payload);
  // if (payload.data) {
  //   logLogin(payload.data.username, payload);
  // }
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

/* to populate cross cookies, tech debt */
app.use((req, res, next) => {
  const expiresIn = 60 * 60 * 24 * 180; // 180 days
  res.cookie('api', process.env.API_CLIENT_URL, {
    maxAge: 1000 * expiresIn,
    sameSite: 'none',
    secure: true,
  });
  if (req.query.token) {
    res.cookie('token', req.query.token, {
      maxAge: 1000 * expiresIn,
      sameSite: 'none',
      secure: true,
    });
    /* tech debt */
    res.cookie('jwt', req.query.token, {
      maxAge: 1000 * expiresIn,
      sameSite: 'none',
      secure: true,
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
      // console.log(`Object.keys(req)`, Object.keys(req));
      // console.log(`req.cookies`, req.cookies);
      if (req.cookies.token) {
        return req.cookies.token;
      } else if (req.query && req.query.token) {
        return req.query.token;
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

//
// Register API middleware
// -----------------------------------------------------------------------------

function createConfig() {
  return {
    token: jwt.sign({ user: config.user }, config.auth.jwt.secret),
    baseUrl: config.apiUrl,
  };
}

app.use('/getToken', (_req, res) => {
  const deploymentConfig = createConfig();
  res.json({ token: deploymentConfig.token });
});

app.use('/general/confirmation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;

  req.data = {
    workAddress: config.app.workAddress,
    eventId,
  };

  reactMiddleware(req, res, next);
});

app.use('/general/reservation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;

  req.data = {
    workAddress: config.app.workAddress,
    eventId,
  };

  reactMiddleware(req, res, next);
});

// app.use('/general/calendar/:eventId', async (req, res) => {
//   const { eventId } = req.params;

//   if (eventId === 'images') return;
//   const event = await API({ action: 'getEvent', eventId });

//   const customerId = event.extendedProperties.shared.resourceName;

//   const cal = ical({
//     domain: config.app.workDomain,
//     name: config.app.workCalendar,
//   });

//   cal.createEvent({
//     start: event.start.dateTime,
//     end: event.end.dateTime,
//     summary: 'Rare Beauty Appointment',
//     description: `
// We do Lash Extensions, Facial, Waxing, Threading and More

// Appointment(s) are found @ ${config.app.customerURL}/${customerId.substring(
//       PEOPLE_PREFIX.length,
//       customerId.length,
//     )}/appointments
//     `,
//     location: config.app.workAddress,
//     url:
//       (event.extendedProperties && event.extendedProperties.shared.shortURL) ||
//       config.app.workDomain,
//   });

//   // eslint-disable-next-line consistent-return
//   return cal.serve(res);
//   // next(req, res, next);
// });

// //
// // Register server-side rendering middleware
// // -----------------------------------------------------------------------------
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
