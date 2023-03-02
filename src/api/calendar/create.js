import moment from 'moment';
import uuidv1 from 'uuid/v1';
import { generateCalendarObj } from '../utilities/jwt';
import { byPersonCount as getAppointmentsCountByPerson } from '../appointments/person';

const APPOINTMENT_URL = 'https://appointments.soho.sg/appointment';
const TEST_EMAIL = `test@soho.sg`;
const WHATSAPPURL = 'https://wa.me';

function findExistingAppointments(calendar, options) {
  const { calendarId, startDT, endDT } = options;

  return new Promise(async (res, rej) => {
    const timeMin =
      moment(startDT)
        .add(1, 'seconds')
        .toISOString() ||
      moment()
        .subtract(2, 'hours')
        .toISOString();
    const timeMax =
      endDT ||
      moment()
        .add(2, 'hours')
        .toISOString();
    const finalOptions = {
      calendarId,
      timeMin,
      timeMax,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    };

    calendar.events.list(finalOptions, async (err, { data }) => {
      if (err) {
        rej(err);
      } else {
        res(data.items);
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
    informed,
    totalAmount,
    deposit,
  } = options;

  return new Promise(async (res, rej) => {
    const uuid = uuidv1();

    const {
      count: countOfExistingAppointments,
    } = await getAppointmentsCountByPerson({
      id: resourceName,
    });
    // const countOfExistingAppointments = 0;

    let finalMobile = mobile;

    // magic number 8 Singapore
    if (mobile && mobile.length === 8) finalMobile = `65${mobile}`;
    // FIRST logic can be better
    calendar.events.insert(
      {
        calendarId,
        resource: {
          start: {
            dateTime: startDT,
          },
          end: {
            dateTime: endDT,
          },
          summary: `${name} (${
            countOfExistingAppointments > 0
              ? countOfExistingAppointments
              : 'FIRST'
          }) - S($${services.reduce(
            (prevSum, item) => prevSum + item.price,
            0,
          )})-T($${totalAmount})-D($${deposit})`,
          location: 'Home',
          status: 'tentative',
          extendedProperties: {
            shared: {
              mobile,
              reminded: reminded !== undefined ? reminded : false,
              informed: informed !== undefined ? informed : false,
              services: services.map(item => item.id).join(','),
              uuid,
              resourceName,
            },
          },
          attendees: [
            {
              displayName: name,
              comment: mobile,
              email: TEST_EMAIL,
            },
          ],
          description: `S($${services.reduce(
            (prevSum, item) => prevSum + item.price,
            0,
          )})-T($${totalAmount})-D($${deposit})\n\n${services
            .map(item => item.service)
            .join(
              ',',
            )}\n\n${APPOINTMENT_URL}/${uuid}/edit\n\n${WHATSAPPURL}/${finalMobile.replace(
            '+',
            '',
          )}`,
        },
      },
      (err, { data: event }) => {
        if (err) {
          console.error(`Create Appointment Error: ${err}`);
          return rej(err);
        }
        // console.log(`event`, event);
        return res({
          event,
          uuid,
        });
      },
    );
  });
}

export default function create(options) {
  const { name, mobile, startDT, endDT, services, force } = options;

  // console.error(options);

  // console.log(options);

  if (!name || !mobile || !startDT || !endDT || !services) {
    return new Promise((res, rej) => {
      rej('no event created');
    });
  }

  return new Promise(async (res, rej) => {
    try {
      const calendar = await generateCalendarObj();

      // console.log(`calendar`, calendar);

      if (!force) {
        const events = await findExistingAppointments(calendar, options);
        const filteredEvents = events.filter(
          event => event.summary.indexOf('-') !== 0,
        );

        if (filteredEvents.length > 0) {
          console.error('------------Overlapping appointment 1---------------');
          console.error(JSON.stringify(events, null, 2));
          rej({
            error: 'Overlapping appointment',
          });
          return console.error(
            '--------Overlapping appointment 2-------------------',
          );
        }
      }

      const { event, uuid } = await createAppointment(
        calendar,
        Object.assign({ sendUpdates: 'none' }, options),
      );
      return res({
        event,
        uuid,
      });
    } catch (err) {
      console.error('calendar create', err, options);
      return rej('no event created in the end');
    }
  });
}
