import { GraphQLString as StringType } from 'graphql';
import moment from 'moment';
import EventStatusType from '../types/EventStatusType';
import API from '../../api';

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
  async resolve(_, { id, status }) {
    try {
      await API({
        action: 'patchEvent',
        status: 'confirmed',
        eventId: id,
        confirmed: moment().format('lll'),
      });
      return { id, status };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
