const {
  GraphQLString,
  GraphQLNonNull
} = require('graphql');
const ContactType = require('../types/ContactType');
const api = require('../../api/index');

module.exports = {
  type: ContactType,
  args: {
    first: {
      type: new GraphQLNonNull(GraphQLString),
    },
    last: {
      type: GraphQLString,
    },
    mobile: {
      type: new GraphQLNonNull(GraphQLString),
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
