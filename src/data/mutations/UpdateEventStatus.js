import {
  GraphQLString as StringType,
  // GraphQLInt as IntegerType,
  // GraphQLList as ListType,
  // GraphQLFloat as FloatType,
} from 'graphql';
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
  async resolve(value, { id, status }) {
    try {
      await API({ action: 'patchEvent', status: 'confirmed', eventId: id });
      return { id, status };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
