const Twilio = require('twilio');
const logger = require('../../utils/logger');

// Use environment variable directly
const defaultMobile = process.env.WORK_MOBILE;

// Make Twilio client optional
let client = null;
try {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (twilioAccountSid && twilioAuthToken) {
    client = new Twilio(twilioAccountSid, twilioAuthToken);
    logger.info('Twilio client initialized');
  } else {
    logger.warn('Twilio credentials missing, SMS features will be disabled');
  }
} catch (err) {
  logger.error('Failed to initialize Twilio client:', err);
}

// Use environment variable without fallback
const FROM = process.env.TWILIO_SENDER;
const REPLY_MOBILE = defaultMobile;
const TEST_MOBILE = defaultMobile;

function sendMessage(options) {
  // If Twilio client is not initialized, log the message and return
  if (!client) {
    logger.warn('SMS not sent (Twilio disabled):', options.message);
    return Promise.resolve({ status: 'disabled' });
  }

  const { test, message } = options;
  const finalMessage = message.replace('REPLY_MOBILE', REPLY_MOBILE);
  let { mobile } = options;

  mobile = mobile.replace(/\s/g, '');

  if (mobile.length >= 8) {
    mobile = mobile
      .split('')
      .reverse()
      .join('')
      .substring(0, 8)
      .split('')
      .reverse()
      .join('');
  }

  if (!mobile.startsWith('+65')) {
    mobile = `+65${mobile}`;
  }

  if (test) {
    mobile = TEST_MOBILE;
  }

  if (mobile.length === 11) {
    // console.log(mobile);
    return client.messages.create({
      body: finalMessage,
      to: mobile,
      from: FROM,
    });
  }
  return Promise.reject(new Error(`invalid mobile number=${mobile}`));
}

module.exports = {
  sendMessage
};
