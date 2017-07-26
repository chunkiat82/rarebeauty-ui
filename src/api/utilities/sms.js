const Twilio = require('twilio');
const keys = require('../keys/twilio.json');

const client = new Twilio(keys.accountSid, keys.authToken);
const moment = require('moment');

const FROM = 'RareBeauty';
const REPLY_MOBILE = '+6590349137';
const TEST_MOBILE = '+6593663631';
module.exports = function sendReminder(options) {
  const { name, event, test } = options;
  let { mobile } = options;

  if (!mobile.startsWith('+65')) {
    mobile = `+65${mobile}`;
  }
  if (test) {
    mobile = TEST_MOBILE;
  }

  if (mobile.length === 11) {
    // console.log(mobile);
    const startDate = moment(event.start.dateTime).format('DD-MMM');
    const startTime = moment(event.start.dateTime).format('hh:mm a');
    client.messages.create({
      body: `Hi ${name},\n\nGentle reminder for your appt on ${startDate} at ${startTime}.\n\nAny changes, reply to ${REPLY_MOBILE}`,
      to: mobile,
      from: FROM,
    });
    // .then(message => console.log(message.sid));
  }
};
