import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import ContactType from '../types/ContactType.js';
import api from '../../api/index.js';

export default {
  type: ContactType,
  args: {
    first: {
      type: new NonNull(StringType),
    },
    last: {
      type: StringType,
    },
    mobile: {
      type: new NonNull(StringType),
    },
  },
  async resolve(_, args, context) {
    try {
      const { first, last, mobile } = args;

      // Call the contact creation API
      const contact = await api({
        action: 'createContact',
        first,
        last,
        mobile,
        context,
      });

      return contact;
    } catch (error) {
      console.error('Error in createContact resolver:', error);

      // Format the error before throwing
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object') {
        throw new Error(JSON.stringify(error));
      } else {
        throw new Error(
          error && error.toString ? error.toString() : 'Unknown error',
        );
      }
    }
  },
};
