// Use environment variables directly instead of loading from JSON files
const configs = {
  // Include common Google config items from environment variables
  type: process.env.GOOGLE_ACCOUNT_TYPE || 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  api_key: process.env.GOOGLE_API_KEY,
  calendar_id: process.env.GOOGLE_CALENDAR_ID
};

function get(key) {
  return configs[key] || process.env[`GOOGLE_${key.toUpperCase()}`] || null;
}

module.exports = {
  get
};
