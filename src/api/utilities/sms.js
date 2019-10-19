const Twilio = require('twilio');
const keys = require('../keys/twilio.json');
const configs = require('./configs');

const defaultMobile = configs.get('mobile');
const client = new Twilio(keys.accountSid, keys.authToken);

const FROM = 'RareBeauty';
const REPLY_MOBILE = defaultMobile;
const TEST_MOBILE = defaultMobile;

export function sendMessage(options) {
  const { test, message } = options;
  const finalMessage = message.replace('REPLY_MOBILE', REPLY_MOBILE);
  let { mobile } = options;

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
  return console.error(`invalid mobile number=${mobile}`);
}

export default sendMessage;
