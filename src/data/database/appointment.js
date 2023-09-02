// import moment from 'moment';
import { get as getFromDB } from '../database';

export async function get(id) {
  const apptResponse = await getFromDB(`appt:${id}`);
  const appt = apptResponse;
  const { eventId, transId } = appt;

  const eventResponse = await getFromDB(`event:${eventId}`);
  const transactionResponse = await getFromDB(`trans:${transId}`);

  appt.event = eventResponse;
  appt.transaction = transactionResponse;
  // console.log(`appt=${JSON.stringify(appt, null, 2)}`);
  return appt;
}

export default {
  get,
};
