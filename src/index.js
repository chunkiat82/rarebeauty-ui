const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const { graphql } = require('graphql');

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

// Debug middleware for GraphQL requests
app.use('/graphql', (req, res, next) => {
  if (req.method === 'POST') {
    const body = req.body;
    // Enhanced logging for GraphQL requests
    logger.info('GraphQL Request:', {
      contentType: req.headers['content-type'],
      bodyType: typeof body,
      hasQuery: body && typeof body.query === 'string',
      query: body?.query,
      variables: body?.variables,
      operationName: body?.operationName
    });
  }
  next();
});

// Custom GraphQL endpoint (more compatible with legacy clients)
app.post('/graphql', async (req, res) => {
  try {
    const { query, variables: rawVariables, operationName } = req.body;
    
    // Make sure we have a query
    if (!query) {
      return res.status(400).json({ errors: [{ message: 'Missing query' }] });
    }
    
    // Parse variables if they're a string
    let variables = rawVariables;
    if (typeof variables === 'string' && variables.trim() !== '') {
      try {
        variables = JSON.parse(variables);
      } catch (e) {
        logger.error('Failed to parse variables:', e);
        return res.status(400).json({ 
          errors: [{ message: 'Invalid variables format' }] 
        });
      }
    }
    
    // Add context based on request
    const context = {
      tenant: req.auth?.tenant || 'default',
      role: req.auth?.role || 'user',
      user: req.auth?.user || 'anonymous',
      userAgent: req.headers['user-agent'],
    };
    
    // Execute the GraphQL query
    const result = await graphql({
      schema,
      source: query,
      contextValue: context,
      variableValues: variables,
      operationName
    });
    
    // Send the result
    return res.json(result);
  } catch (error) {
    logger.error('GraphQL execution error:', {
      message: error.message,
      path: error.path,
      locations: error.locations,
      stack: error.stack,
      originalError: error.originalError ? {
        message: error.originalError.message,
        name: error.originalError.name
      } : null
    });
    return res.status(500).json({
      errors: [{ message: error.message }]
    });
  }
});

// Keep the GET handler for simple queries and tools like GraphiQL
app.get('/graphql', async (req, res) => {
  try {
    const { query, variables: rawVariables, operationName } = req.query;
    
    // Make sure we have a query
    if (!query) {
      return res.status(400).json({ errors: [{ message: 'Missing query' }] });
    }
    
    // Parse variables if they're a string
    let variables = rawVariables;
    if (typeof variables === 'string' && variables.trim() !== '') {
      try {
        variables = JSON.parse(variables);
      } catch (e) {
        logger.error('Failed to parse variables:', e);
        return res.status(400).json({ 
          errors: [{ message: 'Invalid variables format' }] 
        });
      }
    }
    
    // Add context based on request
    const context = {
      tenant: req.auth?.tenant || 'default',
      role: req.auth?.role || 'user',
      user: req.auth?.user || 'anonymous',
      userAgent: req.headers['user-agent'],
    };
    
    // Execute the GraphQL query
    const result = await graphql({
      schema,
      source: query,
      contextValue: context,
      variableValues: variables,
      operationName
    });
    
    // Send the result
    return res.json(result);
  } catch (error) {
    logger.error('GraphQL execution error:', {
      message: error.message,
      path: error.path,
      locations: error.locations,
      stack: error.stack,
      originalError: error.originalError ? {
        message: error.originalError.message,
        name: error.originalError.name
      } : null
    });
    return res.status(500).json({
      errors: [{ message: error.message }]
    });
  }
});

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
  
  // Debug endpoint to test GraphQL queries with detailed errors
  app.post('/graphql-debug', async (req, res) => {
    try {
      const { query, variables, operationName } = req.body;
      
      logger.info('GraphQL Debug Request:', {
        query,
        variables,
        operationName
      });
      
      if (!query) {
        return res.status(400).json({ 
          errors: [{ message: 'Missing query' }],
          debug: { received: req.body }
        });
      }
      
      const context = {
        tenant: req.auth?.tenant || 'default',
        role: req.auth?.role || 'user',
        user: req.auth?.user || 'anonymous',
        userAgent: req.headers['user-agent'],
        debug: true
      };
      
      const result = await graphql({
        schema,
        source: query,
        contextValue: context,
        variableValues: variables,
        operationName
      });
      
      // Enhanced response with debug info
      return res.json({
        ...result,
        debug: {
          query,
          variables,
          operationName,
          context: {
            tenant: context.tenant,
            role: context.role,
            user: context.user
          }
        }
      });
    } catch (error) {
      logger.error('GraphQL Debug Error:', {
        message: error.message,
        stack: error.stack,
        query: req.body.query,
        variables: req.body.variables
      });
      
      return res.status(500).json({
        errors: [{ 
          message: error.message,
          locations: error.locations,
          path: error.path 
        }],
        debug: {
          stack: error.stack,
          query: req.body.query,
          variables: req.body.variables
        }
      });
    }
  });
  
  // Debug endpoint to check database records directly
  app.get('/debug/db/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      
      // Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: 'Debug endpoint only available in development' });
      }
      
      // Validate type parameter
      const validTypes = ['appt', 'event', 'contact', 'trans'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid type parameter',
          validTypes
        });
      }
      
      logger.info(`Debug DB access for ${type}:${id}`);
      
      const context = { tenant: 'rarebeauty' };
      const dbKey = `${type}:${id}`;
      
      const result = await db.get(dbKey, context);
      
      if (!result) {
        return res.status(404).json({
          error: 'Record not found',
          key: dbKey
        });
      }
      
      return res.json({
        data: result,
        meta: {
          key: dbKey,
          type,
          id
        }
      });
    } catch (error) {
      logger.error('Debug DB error:', error);
      return res.status(500).json({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
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

// Print final environment variables used by the application
console.log('\n============ FINAL ENVIRONMENT VARIABLES USED ============');
console.log('PORT:', port);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('CBURL:', process.env.CBURL || process.env.COUCHBASE_URL);
console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
console.log('GOOGLE_WAITINGLIST_CALENDAR_ID:', process.env.GOOGLE_WAITINGLIST_CALENDAR_ID);
console.log('CONFIRMATION_URL:', process.env.CONFIRMATION_URL);
console.log('RESERVATION_URL:', process.env.RESERVATION_URL);
console.log('CUSTOMER_URL:', process.env.CUSTOMER_URL);
console.log('=====================================================\n');

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'development') {
    logger.info(`GraphQL IDE available at http://localhost:${port}/graphql`);
  }
});

module.exports = app; 