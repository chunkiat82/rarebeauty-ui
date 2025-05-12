const twilio = require('twilio');
const db = require('../utils/db');

// Initialize Twilio client only if credentials are available
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function handleTwilioWebhook(req) {
  try {
    // Skip signature validation in development
    if (process.env.NODE_ENV !== 'development') {
      const twilioSignature = req.headers['x-twilio-signature'];
      const url = req.protocol + '://' + req.get('host') + req.originalUrl;
      
      const isValidRequest = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        req.body
      );

      if (!isValidRequest) {
        throw new Error('Invalid Twilio request signature');
      }
    }

    const {
      MessageSid,
      From,
      To,
      Body,
      Status,
      ErrorCode,
      ErrorMessage,
    } = req.body;

    // Store the message data
    await db.upsert(`sms:${MessageSid || Date.now()}`, {
      messageId: MessageSid,
      from: From,
      to: To,
      body: Body,
      status: Status,
      errorCode: ErrorCode,
      errorMessage: ErrorMessage,
      timestamp: new Date().toISOString(),
    });

    // Handle different message statuses
    switch (Status) {
      case 'delivered':
        await handleDeliveredMessage(MessageSid);
        break;
      case 'failed':
        await handleFailedMessage(MessageSid, ErrorCode, ErrorMessage);
        break;
      case 'received':
        await handleIncomingMessage(From, Body);
        break;
      default:
        console.warn(`Unhandled message status: ${Status}`);
    }

    return true;
  } catch (error) {
    console.error('Twilio webhook error:', error);
    throw error;
  }
}

async function handleDeliveredMessage(messageId) {
  try {
    const message = await db.get(`sms:${messageId}`);
    if (message) {
      message.deliveredAt = new Date().toISOString();
      await db.upsert(`sms:${messageId}`, message);
    }
  } catch (error) {
    console.error('Failed to handle delivered message:', error);
  }
}

async function handleFailedMessage(messageId, errorCode, errorMessage) {
  try {
    const message = await db.get(`sms:${messageId}`);
    if (message) {
      message.failedAt = new Date().toISOString();
      message.errorDetails = { code: errorCode, message: errorMessage };
      await db.upsert(`sms:${messageId}`, message);
    }
  } catch (error) {
    console.error('Failed to handle failed message:', error);
  }
}

async function handleIncomingMessage(from, body) {
  try {
    // Store incoming message
    await db.upsert(`sms:incoming:${Date.now()}`, {
      from,
      body,
      receivedAt: new Date().toISOString(),
    });

    // Send auto-reply if needed and Twilio client is available
    if (body.toLowerCase().includes('help') && client) {
      await client.messages.create({
        body: 'Thank you for contacting us. Our team will get back to you shortly.',
        to: from,
        from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_SENDER,
      });
    }
  } catch (error) {
    console.error('Failed to handle incoming message:', error);
  }
}

module.exports = {
  handleTwilioWebhook,
}; 