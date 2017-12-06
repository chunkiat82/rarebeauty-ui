const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

function patchHandler(res, rej, calendar, options, eventResponse) {
  const {
    calendarId,
    eventId,
    mobile,
    startDT,
    endDT,
    services,
    reminded,
    touchUpReminded,
    apptId,
    status,
    confirmed,
  } = options;

  const patchObject = {
    calendarId,
    eventId,
    resource: eventResponse,
  };

  const resource = patchObject.resource;

  if (startDT && endDT) resource.start.dateTime = startDT;
  if (endDT) resource.end.dateTime = endDT;

  if (resource.extendedProperties === undefined)
    resource.extendedProperties = {};
  if (resource.extendedProperties.shared === undefined)
    resource.extendedProperties.shared = {};

  if (mobile) resource.extendedProperties.shared.mobile = mobile;

  if (services) {
    resource.extendedProperties.shared.services = services
      .map(item => item.id)
      .join(',');
    resource.description = `${services
      .map(item => item.service)
      .join(',')}\n\nhttps://rarebeauty.soho.sg/appointment/edit/${apptId}`;
  }
  if (reminded) {
    resource.extendedProperties.shared.reminded = reminded;
  }

  if (touchUpReminded) {
    resource.extendedProperties.shared.touchUpReminded = touchUpReminded;
  }

  if (status) {
    resource.status = status;
  }

  if (apptId) {
    resource.extendedProperties.shared.uuid = apptId;
    resource.extendedProperties.shared.apptId = apptId;
  }

  if (confirmed) {
    resource.extendedProperties.shared.confirmed = confirmed;
  }

  resource.extendedProperties.shared.changed = new Date().getTime();

  // console.log(`patchObject=${JSON.stringify(patchObject)}`);
  calendar.events.patch(patchObject, (err, event) => {
    if (err) {
      console.error(
        `There was an error contacting the Calendar service: ${JSON.stringify(
          err,
        )}`,
      );
      rej(err);
    }
    // console.log(`res(event)=${JSON.stringify(event)}`);
    res(event);
  });
}

module.exports = function patch(options) {
  const { calendarId, eventId } = options;

  if (!calendarId || !eventId) {
    return new Promise((res, rej) => {
      rej('no event patched');
    });
  }

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    calendar.events.get(
      {
        calendarId,
        eventId,
      },
      (err, response) => {
        if (err) {
          rej(err);
        } else {
          patchHandler(res, rej, calendar, options, response);
        }
      },
    );
  });
};
