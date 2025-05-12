/* eslint-disable import/no-named-as-default */
const handleCalendarWebhook = require('./google');
const { handleTwilioWebhook } = require('./twilio');;

module.exports = require('./google');
module.exports = require('./twilio');
