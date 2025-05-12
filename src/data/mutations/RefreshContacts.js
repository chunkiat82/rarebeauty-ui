import { GraphQLString as StringType } from 'graphql';
import ResponseType from '../types/ResponseType.js';
import api from '../../api/index.js';

export default {
  type: ResponseType,
  args: {
    refresh: {
      type: StringType,
    },
  },
  async resolve(_, _args, context) {
    try {
      await api({ action: 'listContacts', forceRefresh: true, context });
      return { id: 0, code: 'refreshed' };
    } catch (err) {
      console.error(err);
      // throw err;
      return { id: -1, code: 'error refreshing' };
    }
  },
};
