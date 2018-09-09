import {
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import moment from 'moment';
import AppointmentType from '../types/AppointmentType';
import api from '../../api';
import { get, upsert } from '../database';

export default {
  type: AppointmentType,
  args: {
    id: {
      type: StringType,
    },
    by: {
      // by customer or admin
      type: StringType,
    },
    toBeInformed: {
      type: BooleanType,
    },
  },
  async resolve(value, { id, by, toBeInformed }) {
    // [todo] - what if it's a mobile in the summary

    try {
      const apptResponse = await get(`appt:${id}`);
      const { eventId } = apptResponse.value;

      const event = await get(`event:${eventId}`);
      const transaction = await get(`trans:${id}`);

      const now = moment();
      await upsert(`cancel:${id}`, {
        canceledAt: now,
        id,
        by: by || 'customer',
        event,
        transaction,
      });

      await api({
        action: 'cancelEvent',
        eventId,
        apptId: id,
        informed: !!(
          toBeInformed === undefined ||
          toBeInformed === 'false' ||
          toBeInformed === false
        ), // bad logic too hard to understand //its set to false so that it will be picked up later to be informed
      });
      // console.log(`fullEvent:${JSON.stringify(event)}`);

      return { id };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
