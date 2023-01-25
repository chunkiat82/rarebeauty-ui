// https://github.com/kriasoft/react-starter-kit/blob/master/docs/recipes/how-to-implement-routing.md

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import moment from 'moment';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import _httpErrorPages from 'http-error-pages';
import ical from 'ical-generator';

import schema from './data/schema';

import { handleCalendarWebhook, handleTwilioWebhook } from './hooks';
// import { logLogin } from './data/database/login';
import { reactMiddleware, reactErrorMiddleware } from './reactMiddleware';
import API from './api/';

import config from './config';

const PEOPLE_PREFIX = 'people/';

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

// super temporary lin #######
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://*.soho.sg');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  return next();
});

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
  if (req.query.token) {
    // console.log('req.query.token', req.query.token);
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    res.cookie('token', req.query.token, {
      maxAge: 1000 * expiresIn,
      httpOnly: true,
    });
    /* tech debt */
    res.cookie('jwt', req.query.token, {
      maxAge: 1000 * expiresIn,
      httpOnly: true,
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
      // console.log(`req.cookies`, JSON.stringify(req.cookies, null, 2));
      if (req.cookies.token) {
        return req.cookies.token;
      } else if (req.query && req.query.token) {
        return req.query.token;
      } else if (req.headers && req.headers.authorization) {
        return req.headers.authorization; // base64Credentials;
      }
      return null;
    },
  }).unless({
    path: [
      '/events/calendar',
      /\/general*/,
      /\/assets*/,
      /\/page+/,
      /\/p+/,
      /\/api+/,
      /\/webhooks+/,
      /\/graphql*/,
    ],
  }),
);
// Error handler for express-jwt
app.use(populatePayload);
app.use(reactErrorMiddleware);

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

app.use('/events/calendar', async (req, res, next) => {
  // console.error('handleCalendarWebhook typeof', typeof handleCalendarWebhook);
  try {
    await handleCalendarWebhook(req.headers);
    res.json({ ok: true });
  } catch (e) {
    console.error(`handleCalendarWebhook`, e);
    next(e);
  }
});

app.use('/webhooks/twilio', async (req, res) => {
  handleTwilioWebhook(req);
  res.send('null');
  res.status(201).end();
});

app.use('/public/appointment/confirm/:eventId', async (req, res) => {
  const { eventId } = req.params;
  await API({ action: 'patchEvent', status: 'confirmed', eventId });
  res.send(
    `<!doctype html><html><body style="background-color:#373277"><h1><center><span style="color:white">Your Appointment is confirmed!</span></center></h1></body></html>`,
  );
});

app.use('/general/confirmation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;

  console.log('user-agent:',req.headers['user-agent']);

  const event = await API({ action: 'getEvent', eventId });
  req.data = {
    event,
    workAddress: config.app.workAddress,
    oldWorkAddress: config.app.oldWorkAddress,
    safeEntryLink: config.app.safeEntryLink,
    oldSafeEntryLink: config.app.oldSafeEntryLink,
  };
  await API({
    action: 'patchEvent',
    status: 'confirmed',
    confirmed: moment().format('lll'),
    eventId,
  });

  reactMiddleware(req, res, next);
});

app.use('/general/reservation/:eventId', async (req, res, next) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;
  const event = await API({ action: 'getEvent', eventId });
  req.data = {
    event,
    workAddress: config.app.workAddress,
    oldWorkAddress: config.app.oldWorkAddress,
    safeEntryLink: config.app.safeEntryLink,
    oldSafeEntryLink: config.app.oldSafeEntryLink,
  };

  const now = moment();
  const appointmentEnd = moment(event.end.dateTime);
  // eslint-disable-next-line consistent-return
  if (now.isAfter(appointmentEnd)) {
    res.redirect('/');
  } else {
    reactMiddleware(req, res, next);
  }
});

app.use('/general/calendar/:eventId', async (req, res) => {
  const { eventId } = req.params;

  if (eventId === 'images') return;
  const event = await API({ action: 'getEvent', eventId });

  const customerId = event.extendedProperties.shared.resourceName;

  const cal = ical({
    domain: config.app.workDomain,
    name: config.app.workCalendar,
  });

  cal.createEvent({
    start: event.start.dateTime,
    end: event.end.dateTime,
    summary: 'Rare Beauty Appointment',
    description: `
We do Lash Extensions, Facial, Waxing, Threading and More

Appointment(s) are found @ ${config.app.customerURL}/${customerId.substring(
      PEOPLE_PREFIX.length,
      customerId.length,
    )}/appointments
    `,
    location: config.app.workAddress,
    url:
      (event.extendedProperties && event.extendedProperties.shared.shortURL) ||
      config.app.workDomain,
  });

  // eslint-disable-next-line consistent-return
  return cal.serve(res);
  // next(req, res, next);
});

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
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
  app.listen(config.port, () => {
    console.info(`The server is running at http://localhost:${config.port}/`);
  });
} else {
  // development mode
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
