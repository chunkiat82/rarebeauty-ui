import { GraphQLList as ListType, GraphQLString as StringType } from 'graphql';
// import moment from 'moment';
import SlotType from '../types/SlotType';
import api from '../../api';

const SLOT_TYPE = 'Free'; // currently not used

function querySlots() {
  return api({ action: 'listFreeSlots', type: SLOT_TYPE });
}

const slots = {
  type: new ListType(SlotType),
  args: {
    id: { type: StringType },
  },
  async resolve(_, args) {
    const response = await querySlots(args);
    // console.log(response);
    return response;
  },
};

export default slots;
