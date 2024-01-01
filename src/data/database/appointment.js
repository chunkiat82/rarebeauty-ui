// import moment from 'moment';
import { get as getFromDB } from '../database';

export async function get(id, context) {
  try {
    const apptResponse = await getFromDB(`appt:${id}`, context);
    const appt = apptResponse;
    const { eventId, transId } = appt;
    // console.log(`appt1=${JSON.stringify(appt, null, 2)}`);
    const eventResponse = await getFromDB(`event:${eventId}`, context);
    // console.log(`event=${JSON.stringify(appt, null, 2)}`);

    const transactionResponse = await getFromDB(`trans:${transId}`, context);
    // console.log(`trans=${JSON.stringify(appt, null, 2)}`);

    appt.event = eventResponse;
    appt.transaction = transactionResponse;
    // console.log(`appt2=${JSON.stringify(appt, null, 2)}`);
    return appt;
  } catch (error) {
    console.error('[DB get by person error]', error);
    // return { id, event:{}, transaction:{},createdAt:new Date(), lastUpdate: new Date() }
    throw error;
  }
}

export default {
  get,
};
