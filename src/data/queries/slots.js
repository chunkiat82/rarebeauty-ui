const { GraphQLList, GraphQLString } = require('graphql');
// const moment = require('moment');
const SlotType = require('../types/SlotType');
const api = require('../../api/index');

const SLOT_TYPE = 'Free'; // currently not used

const slots = {
  type: new GraphQLList(SlotType),
  args: {
    id: { type: GraphQLString },
  },
  async resolve(_, _args, context) {
    const response = await api({
      action: 'listFreeSlots',
      type: SLOT_TYPE,
      context,
    });
    // console.log(response);
    return response;
  },
};

module.exports = slots;
