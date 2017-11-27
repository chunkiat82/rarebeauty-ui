import AST from 'auto-sorting-array';
import {
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLList as ListType,
  GraphQLFloat as FloatType,
} from 'graphql';
import moment from 'moment';
import EventStatusType from '../types/EventStatusType';
import api from '../../api';
import { get, upsert } from '../database';

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
      return { id, status };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
