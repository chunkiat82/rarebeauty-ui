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
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
import PrettyError from 'pretty-error';
import _httpErrorPages from 'http-error-pages';

import schema from './data/schema';
import { handleCalendarWebhook, handleTwilioWebhook } from './hooks';
import { reactErrorMiddleware } from './reactMiddleware';
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

/** very important CORS lines */
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://appointments.soho.sg',
    'https://rb.soho.sg',
    'https://rarebeauty.soho.sg',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, *',
  );
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

// to be deleted
app.use('/getToken', (req, res) => {
  const { user, role, tenant } = config.clients[req.query.client || 'client1'];
  const token = jwt.sign({ user, role, tenant }, config.auth.jwt.secret, {
    expiresIn: '1h',
  });
  res.send(`?token=${token}`);
});

app.use(
  expressJwt({
    secret: (req, payload, done) => {
      req.auth = payload; // this is here because req.auth not populating by framework as promised
      done(null, config.auth.jwt.secret);
    },
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
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
      /\/general*/,
      /\/assets*/,
      /\/page+/,
      /\/p+/,
      /\/api+/,
      /\/webhooks+/,
    ],
  }),
);

app.use(reactErrorMiddleware);

//
// Register API middleware
// -----------------------------------------------------------------------------

const allowOnlyPost = (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(401).send(`Method ${req.method} not allowed`);
  }
  return next();
};

app.use(
  '/graphql',
  allowOnlyPost,
  (req, res, next) => {
    // type to be cleaned up
    // this mapping is found in rarebeauty-ui-sa server.js
    if (
      req.auth.type === 'admin' ||
      req.auth.role === 'admin' ||
      req.auth.page.includes('general') ||
      req.auth.page.includes('public')
    )
      next();
    else {
      res.status(401).send('Not Allowed Here');
    }
  },
  // https://www.npmjs.com/package/express-graphql
  expressGraphQL(async req => ({
    schema,
    graphiql: __DEV__,
    rootValue: { request: req },
    pretty: __DEV__,
    context: {
      tenant: req.auth.tenant,
      role: req.auth.role,
      user: req.auth.user,
    },
  })),
);

app.use('/webhooks/google/calendar', async (req, res, next) => {
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
