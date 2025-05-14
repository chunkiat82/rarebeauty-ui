# Tests Directory

This directory contains various test scripts for the Rare Beauty Salon application backend.

## Available Tests

### Database Tests
- `test-connection.js` - Basic Couchbase connection test with multiple connection attempts
- `test-db.js` - Comprehensive Couchbase connection test with scope/collection access
- `verify-db-connection.js` - Simple database connection verification using the app's DB utility

### Environment Tests
- `test-env.js` - Tests environment variable loading and displays their values

### URL Shortener Tests
- `test-shorturl.js` - Tests the URL shortener API with various configurations
- `test-shorturl-trim.js` - Tests the URL shortener with special handling for trimmed password values
- `test-url-shortener.js` - Tests the internal URL shortener function directly

### Utility Tests
- `test-ast.js` - Tests the auto-sorting-array library functionality used by appointment services

## Running Tests

All tests can be run from the project root directory:

```bash
# Run a specific test
node tests/test-env.js

# Run a database connection test
node tests/test-connection.js

# Test URL shortener
node tests/test-url-shortener.js
```

Or from within the tests directory:

```bash
cd tests
node test-ast.js
```

## Adding New Tests

When adding new tests, please follow these conventions:
1. Name files with the prefix `test-` followed by a descriptive name
2. Ensure imports reference parent directory paths correctly (e.g., `require('../load-env')`)
3. Add proper documentation comments at the top of the file
4. Update this README with information about the new test 