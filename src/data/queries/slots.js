import { GraphQLList as ListType, GraphQLString as StringType } from 'graphql';
// import moment from 'moment';
import SlotType from '../types/SlotType';
import api from '../../api';

const SLOT_TYPE = 'Free'; // currently not used

const slots = {
  type: new ListType(SlotType),
  args: {
    id: { type: StringType },
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

export default slots;
