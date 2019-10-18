import { GraphQLString as StringType } from 'graphql';
import ResponseType from '../types/ResponseType';
import API from '../../api';

export default {
  type: ResponseType,
  args: {
    refresh: {
      type: StringType,
    },
  },
  async resolve() {
    try {
      await API({ action: 'listContacts', forceRefresh: true });
      return { id: 0, code: 'refreshed' };
    } catch (err) {
      console.error(err);
      // throw err;
      return { id: -1, code: 'error refreshing' };
    }
  },
};
