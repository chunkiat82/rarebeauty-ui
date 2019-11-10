/* eslint-disable no-console */

/* sample body

{ SmsMessageSid: 'SM13243e427b2b53606c77c4cc0c93c840',
  NumMedia: '0',
  SmsSid: 'SM13243e427b2b53606c77c4cc0c93c840',
  SmsStatus: 'received',
  Body: 'test again',
  To: 'whatsapp:+14084129807',
  NumSegments: '1',
  MessageSid: 'SM13243e427b2b53606c77c4cc0c93c840',
  AccountSid: 'AC5592f04d75d6ccf4eba102992a0a9f27',
  From: 'whatsapp:+6593663631',
  ApiVersion: '2010-04-01' }s
*/

const Twilio = require('twilio');
const keys = require('../api/keys/twilio.json');

const client = new Twilio(keys.accountSid, keys.authToken);

export function handleTwilioWebhook(req, res) {
  console.log(req.body);

  client.messages
    .create({
      to: req.body.From,
      from: req.body.To,
      body: `You said ${req.body.Body}`,
    })
    .then(message => console.log(message.sid));
  return res.status(200);
}

export default handleTwilioWebhook;
