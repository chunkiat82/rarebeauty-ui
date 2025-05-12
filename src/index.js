const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const { createHandler } = require('graphql-http/lib/use/express');

const schema = require('./data/schema');
const { handleCalendarWebhook } = require('./webhooks/calendar');
const { handleTwilioWebhook } = require('./webhooks/twilio');
const db = require('./utils/db');
const checkEnvironment = require('./utils/checkEnv');
const logger = require('./utils/logger');

const app = express();

// Check environment variables
if (!checkEnvironment()) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

// Connect to database and initialize test data
async function initialize() {
  try {
    await db.connect();
    logger.info('Database initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize:', err);
    process.exit(1);
  }
}

initialize();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Get allowed origins from environment variable
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Originating-Url'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Bot denial
app.use((req, res, next) => {
  if (req.headers.from === 'googlebot(at)googlebot.com') {
    return res.status(401).json({ message: 'Unauthorized Access' });
  }
  return next();
});

// JWT Authentication
const getToken = (req) => {
  if (req.cookies.token && req.cookies.token !== 'undefined') {
    return req.cookies.token;
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  if (req.headers && req.headers.authorization) {
    return req.headers.authorization;
  }
  return null;
};

app.use(
  jwt({
    secret: process.env.JWT_SECRET || 'development-secret-key',
    algorithms: ['HS256'],
    credentialsRequired: true,
    getToken,
  }).unless({
    path: [/^\/general/, /^\/assets/, /^\/page/, /^\/p/, /^\/api/, /^\/webhooks/, /^\/graphql/],
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GraphQL endpoint
app.use('/graphql', createHandler({
  schema,
  context: (req) => ({
    tenant: req.auth?.tenant || 'default',
    role: req.auth?.role || 'user',
    user: req.auth?.user || 'anonymous',
    userAgent: req.headers['user-agent'],
  }),
}));

// For GraphQL IDE in development
if (process.env.NODE_ENV === 'development') {
  app.get('/graphiql', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>GraphiQL</title>
          <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
        </head>
        <body style="margin: 0; height: 100vh;">
          <div id="graphiql" style="height: 100vh;"></div>
          <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
          <script>
            const fetcher = GraphiQL.createFetcher({
              url: '/graphql',
            });
            ReactDOM.render(
              React.createElement(GraphiQL, { fetcher }),
              document.getElementById('graphiql'),
            );
          </script>
        </body>
      </html>
    `);
  });
}

// Webhooks
app.post('/webhooks/google/calendar', async (req, res, next) => {
  try {
    await handleCalendarWebhook(req.headers);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Calendar webhook error:', err);
    next(err);
  }
});

app.post('/webhooks/twilio', async (req, res, next) => {
  try {
    await handleTwilioWebhook(req);
    res.status(201).send('null');
  } catch (err) {
    logger.error('Twilio webhook error:', err);
    next(err);
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Application error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err : {},
    message: err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server...');
  await db.close();
  process.exit(0);
});

// Start server
const port = process.env.PORT || 3004;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'development') {
    logger.info(`GraphQL IDE available at http://localhost:${port}/graphql`);
  }
});

module.exports = app; 