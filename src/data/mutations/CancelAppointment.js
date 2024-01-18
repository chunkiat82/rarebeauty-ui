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
  async resolve(_, args, context) {
    // [todo] - what if it's a mobile in the summary
    const { id, by, toBeInformed } = args;
    try {
      const apptResponse = await get(`appt:${id}`, context);
      const { eventId } = apptResponse;

      context.callingFunction = 'cancel/appointment';
      const event = await get(`event:${eventId}`, context);
      const transaction = await get(`trans:${id}`, context);

      const now = moment();
      // console.log('cancel:${id}', `cancel:${id}`);
      await upsert(
        `cancel:${id}`,
        {
          canceledAt: now,
          id,
          by: by || 'customer',
          event,
          transaction,
        },
        context,
      );

      await api({
        action: 'cancelEvent',
        eventId,
        apptId: id,
        informed: !!(
          toBeInformed === undefined ||
          toBeInformed === 'false' ||
          toBeInformed === false
        ),
        context, // bad logic too hard to understand //its set to false so that it will be picked up later to be informed
      });
      // console.log(`fullEvent:${JSON.stringify(event)}`);

      return { id };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
