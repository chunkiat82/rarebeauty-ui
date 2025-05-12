const { google } = require('googleapis');
const config = require('../config');
const db = require('../utils/db');

const calendar = google.calendar({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_id: config.google.calendar.clientId,
      client_secret: config.google.calendar.clientSecret,
      redirect_uri: config.google.calendar.redirectUri,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  }),
});

async function handleCalendarWebhook(headers) {
  try {
    const channelId = headers['x-goog-channel-id'];
    const resourceId = headers['x-goog-resource-id'];
    const state = headers['x-goog-resource-state'];

    // Validate the webhook
    if (!channelId || !resourceId) {
      throw new Error('Invalid webhook headers');
    }

    // Store the webhook data
    await db.upsert(`calendar:webhook:${channelId}`, {
      channelId,
      resourceId,
      state,
      timestamp: new Date().toISOString(),
    });

    // Handle different states
    switch (state) {
      case 'sync':
        // Initial sync, no action needed
        break;
      case 'exists':
      case 'update':
        // Fetch and process updated events
        await processCalendarUpdates(channelId);
        break;
      case 'delete':
        // Handle deleted events
        await handleDeletedEvents(channelId);
        break;
      default:
        console.warn(`Unhandled calendar webhook state: ${state}`);
    }

    return true;
  } catch (error) {
    console.error('Calendar webhook error:', error);
    throw error;
  }
}

async function processCalendarUpdates(channelId) {
  try {
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Process and store updated events
    for (const event of events.data.items) {
      await db.upsert(`calendar:event:${event.id}`, {
        eventId: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        updated: event.updated,
      });
    }
  } catch (error) {
    console.error('Failed to process calendar updates:', error);
    throw error;
  }
}

async function handleDeletedEvents(channelId) {
  // Implement deletion logic if needed
  console.log(`Processing deleted events for channel: ${channelId}`);
}

module.exports = {
  handleCalendarWebhook,
}; 