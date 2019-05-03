import { byPersonCount as getAppointmentsCountByPerson } from '../appointments/person';

const generateJWT = require('../utilities/jwt');
const google = require('googleapis');

const EDIT_URL = 'https://rarebeauty.soho.sg/appointment/edit';
const WHATSAPPURL = 'https://wa.me';

async function patchHandler(res, rej, calendar, options, eventResponse) {
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
    shortURL,
    informed,
    totalAmount,
    deposit,
  } = options;

  const patchObject = {
    calendarId,
    eventId,
    resource: eventResponse,
  };

  const resource = patchObject.resource;

  let finalMobile = mobile;

  // magic number 8 Singapore
  if (mobile && mobile.length === 8) finalMobile = `65${mobile}`;

  if (startDT && endDT) resource.start.dateTime = startDT;
  if (endDT) resource.end.dateTime = endDT;

  if (resource.extendedProperties === undefined)
    resource.extendedProperties = {};
  if (resource.extendedProperties.shared === undefined)
    resource.extendedProperties.shared = {};

  if (finalMobile) resource.extendedProperties.shared.mobile = finalMobile;

  if (services) {
    resource.extendedProperties.shared.services = services
      .map(item => item.id)
      .join(',');
    resource.description = `S($${services.reduce(
      (prevSum, item) => prevSum + item.price,
      0,
    )})-T($${totalAmount})-D($${deposit})

${services
      .map(item => item.service)
      // eslint-disable-next-line prettier/prettier
      .join(',')}\n\n${EDIT_URL}/${apptId}\n\n${WHATSAPPURL}/${finalMobile.replace('+', '')}`;

    const {
      count: countOfExistingAppointments,
    } = await getAppointmentsCountByPerson({
      id: resource.extendedProperties.shared.resourceName,
    });

    resource.summary = `${resource.attendees[0]
      .displayName} (${countOfExistingAppointments > 0
      ? countOfExistingAppointments
      : 'FIRST'}) - S($${services.reduce(
      (prevSum, item) => prevSum + item.price,
      0,
    )})-T($${totalAmount})-D($${deposit})`;
  }
  if (reminded) {
    resource.extendedProperties.shared.reminded = reminded;
  }

  if (touchUpReminded) {
    resource.extendedProperties.shared.touchUpReminded = touchUpReminded;
  }

  resource.extendedProperties.shared.informed = informed;

  if (status) {
    resource.status = status;
  }

  if (apptId) {
    resource.extendedProperties.shared.uuid = apptId;
    resource.extendedProperties.shared.apptId = apptId;
  }

  if (shortURL) {
    resource.extendedProperties.shared.shortURL = shortURL;
  }

  if (confirmed) {
    if (resource.attendees && resource.attendees[0]) {
      resource.attendees[0].responseStatus = 'accepted';
    } else {
      console.error(`no attendees for calendar event -> ${eventId}`);
    }
    resource.extendedProperties.shared.confirmed = confirmed;
  }

  resource.extendedProperties.shared.changed = new Date().getTime();

  // console.log(`patchObject1=${JSON.stringify(patchObject)}`);
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

export default function patch(options) {
  const { calendarId, eventId } = options;

  if (!calendarId || !eventId) {
    return new Promise((res, rej) => {
      rej('no event patched');
    });
  }

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({
      version: 'v3',
      auth: jwtClient,
    });
    calendar.events.get(
      {
        calendarId,
        eventId,
      },
      async (err, response) => {
        if (err) {
          rej(err);
        } else {
          await patchHandler(res, rej, calendar, options, response);
        }
      },
    );
  });
}
