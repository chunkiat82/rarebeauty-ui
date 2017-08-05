export default async function getDelta(options) {
  const syncToken = await getSyncToken();

  const finalOptions = Object.assign(
    { calendarId: 'rarebeauty@soho.sg', syncToken },
    options,
  );
  try {
    const events = await listEvents(finalOptions);
    // console.log(response);
    if (events.length === 0) {
      // console.log('No upcoming events found.');
    } else {
      // bucket.manager().createPrimaryIndex(function () {
      console.log(`Upcoming events (${events.length}):`);
      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];
        if (event.start) {
          const start = event.start.dateTime || event.start.date;
          // console.log(JSON.stringify(event, null, 2));
          console.log(
            '%s - %s - %s - %s',
            start,
            event.summary,
            event.id,
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.mobile) ||
              '0',
            (event.extendedProperties &&
              event.extendedProperties.shared &&
              event.extendedProperties.shared.reminded) ||
              'false',
          );
        } else {
          console.error(event);
        }
      }
    }
    return events;
  } catch (err) {
    throw err;
  }
}
