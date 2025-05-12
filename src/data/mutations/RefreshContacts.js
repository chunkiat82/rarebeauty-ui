const {
  GraphQLString
} = require('graphql');
const ResponseType = require('../types/ResponseType');
const api = require('../../api/index');

module.exports = {
  type: ResponseType,
  args: {
    refresh: {
      type: GraphQLString,
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
