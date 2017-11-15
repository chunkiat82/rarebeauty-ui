import google from 'googleapis';
import moment from 'moment';
import uuidv1 from 'uuid/v1';
import generateJWT from '../utilities/jwt';

function findExistingAppointments(calendar, options) {
  const { calendarId, startDT, endDT } = options;

  return new Promise(async (res, rej) => {
    const timeMin =
      moment(startDT).add(1, 'seconds').toISOString() ||
      moment().subtract(2, 'hours').toISOString();
    const timeMax = endDT || moment().add(2, 'hours').toISOString();
    const finalOptions = {
      calendarId,
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    };

    calendar.events.list(finalOptions, async (err, response) => {
      if (err) {
        rej(err);
      } else {
        res(response.items);
      }
    });
  });
}

function createAppointment(calendar, options) {
  const {
    name,
    mobile,
    startDT,
    endDT,
    services,
    calendarId,
    resourceName,
    reminded,
  } = options;

  return new Promise(async (res, rej) => {
    const uuid = uuidv1();

    calendar.events.insert(
      {
        calendarId,
        resource: {
          start: { dateTime: startDT },
          end: { dateTime: endDT },
          summary: name,
          location: 'Home',
          status: 'tentative',
          extendedProperties: {
            shared: {
              mobile,
              reminded: reminded !== undefined ? reminded : false,
              services: services.map(item => item.id).join(','),
              uuid,
              resourceName,
            },
          },
          attendees: [
            {
              displayName: name,
              comment: mobile,
              email: `test@soho.sg`,
            },
          ],
          description: `${services
            .map(item => item.service)
            .join(',')}\n\nhttps://rarebeauty.soho.sg/appointment/edit/${uuid}`,
        },
      },
      (err, event) => {
        if (err) {
          console.error(
            `There was an error contacting the Calendar service: ${err}`,
          );
          rej(err);
        }
        res({ event, uuid });
      },
    );
  });
}

export default function create(options) {
  const { name, mobile, startDT, endDT, services, force } = options;

  // console.log(options);

  if (!name || !mobile || !startDT || !endDT || !services) {
    return new Promise((res, rej) => {
      rej('no event created');
    });
  }

  return new Promise(async (res, rej) => {
    const jwtClient = await generateJWT();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    if (force) {
      const { event, uuid } = await createAppointment(calendar, options);
      res({ event, uuid });
    } else {
      const events = await findExistingAppointments(calendar, options);
      const filteredEvents = events.filter(
        event => event.summary.indexOf('-') !== 0,
      );
      if (filteredEvents.length > 0) {
        console.error('---------------------------');
        console.error(JSON.stringify(events, null, 2));
        rej({ error: 'Overlapping appointment' });
        console.error('---------------------------');
        return;
      }

      const { event, uuid } = await createAppointment(calendar, options);
      res({ event, uuid });
    }
  });
}
