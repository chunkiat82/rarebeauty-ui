import { GraphQLString as StringType } from 'graphql';
import moment from 'moment';
import EventStatusType from '../types/EventStatusType.js';
import api from '../../api/index.js';

export default {
  type: EventStatusType,
  args: {
    id: {
      type: StringType,
    },
    status: {
      type: StringType,
    },
  },
  async resolve(_, args, context) {
    const { id, status } = args;
    try {
      await api({
        action: 'patchEvent',
        status: 'confirmed',
        eventId: id,
        confirmed: moment().format('lll'),
        context,
      });
      return { id, status };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
