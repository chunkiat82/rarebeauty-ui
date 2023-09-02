// import moment from 'moment';
import { get as getFromDB } from '../database';

export async function get(id) {
  const apptResponse = await getFromDB(`appt:${id}`);
  const appt = apptResponse;
  const { eventId, transId } = appt;
  // console.log(`appt1=${JSON.stringify(appt, null, 2)}`);
  const eventResponse = await getFromDB(`event:${eventId}`);
  // console.log(`event=${JSON.stringify(appt, null, 2)}`);

  const transactionResponse = await getFromDB(`trans:${transId}`);
  // console.log(`trans=${JSON.stringify(appt, null, 2)}`);

  appt.event = eventResponse;
  appt.transaction = transactionResponse;
  // console.log(`appt2=${JSON.stringify(appt, null, 2)}`);
  return appt;
}

export default {
  get,
};
