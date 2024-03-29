/* eslint-disable no-unused-expressions */
import { byPersonCount as getAppointmentsCountByPerson } from '../appointments/person';

const { generateCalendarObj } = require('../utilities/jwt');

const APPOINTMENT_URL = 'https://appointments.soho.sg/appointment';
const WHATSAPPURL = 'https://wa.me';

async function updateHandler(options, event) {
  const {
    calendarId,
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
    eventId: event.id,
    requestBody: event,
  };

  const resource = patchObject.requestBody;

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
    )})-T($${totalAmount})-D($${deposit})\n\n${services
      .map(item => item.service)
      // eslint-disable-next-line prettier/prettier
      .join(
        ',',
      )}\n\n${APPOINTMENT_URL}/${apptId}/edit\n\n${WHATSAPPURL}/${finalMobile.replace(
      '+',
      '',
    )}`;

    const {
      count: countOfExistingAppointments,
    } = await getAppointmentsCountByPerson({
      id: resource.extendedProperties.shared.resourceName,
    });

    resource.summary = `${resource.attendees[0].displayName} (${
      countOfExistingAppointments > 0 ? countOfExistingAppointments : 'FIRST'
    }) - S($${services.reduce(
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
      console.error(`no attendees for calendar event -> ${event.id}`);
    }
    resource.extendedProperties.shared.confirmed = confirmed;
  }

  resource.extendedProperties.shared.changed = new Date().getTime();

  if (touchUpReminded || reminded) {
    console.error(`updateHandler reminded =${JSON.stringify(patchObject)}`);
  }
  const calendar = await generateCalendarObj();
  return new Promise((res, rej) => {
    calendar.events.update(patchObject, (err, response) => {
      if (err || !response) {
        console.error(
          '-------------------------------UPDATE START-----------------------',
        );
        // console.error(
        //   `res(patchObject)=${JSON.stringify(patchObject, null, 2)}`,
        // );
        // console.error(`Calendar Patch Error: ${JSON.stringify(err, null, 2)}`);
        // console.error(
        //   `Calendar Patch Response: ${JSON.stringify(response, null, 2)}`,
        // );
        err &&
          err.repsonse &&
          err.response.data &&
          err.response.data.error &&
          console.error(
            'Calendar Update Response Error Message:',
            err.response.data.error.message,
          );
        console.error(
          '-------------------------------UPDATE END-----------------------',
        );
        return rej(err);
      }
      const { data: updatedEvent } = response;
      return res(updatedEvent);
    });
  });
}

export default function update(options) {
  const { calendarId, event } = options;

  if (!calendarId || !event) {
    return new Promise((_res, rej) => {
      rej('no event patched');
    });
  }

  return updateHandler(options, event);
}
