import AST from 'auto-sorting-array';
import {
  //   GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntegerType,
  GraphQLList as ListType,
  GraphQLFloat as FloatType,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import moment from 'moment';
import AppointmentType from '../types/AppointmentType';
import api from '../../api';
import { get, upsert } from '../database';

export default {
  type: AppointmentType,
  args: {
    name: {
      type: StringType,
    },
    start: {
      type: StringType,
    },
    mobile: {
      type: StringType,
    },
    serviceIds: {
      type: new ListType(StringType),
    },
    duration: {
      type: IntegerType,
    },
    resourceName: {
      type: StringType,
    },
    totalAmount: {
      type: FloatType,
    },
    additional: {
      type: FloatType,
    },
    discount: {
      type: FloatType,
    },
    toBeInformed: {
      type: BooleanType,
    },
    deposit: {
      type: FloatType,
    },
    force: {
      type: BooleanType,
    },
    waitingList: {
      type: BooleanType,
    },
  },
  async resolve(
    _,
    {
      name,
      mobile,
      resourceName,
      serviceIds,
      start,
      duration,
      totalAmount,
      additional,
      discount,
      toBeInformed,
      deposit,
    },
  ) {
    let finalResourceName = resourceName;

    if (resourceName === '' || resourceName === undefined) {
      // find by mobile first before creating

      const firstLast = name.split(' ');
      const first = firstLast[0];
      const last = firstLast[1] || '';
      // console.log(`first=${first} last = ${last}`);
      const res = await api({
        action: 'createContact',
        first,
        last,
        mobile,
      });
      finalResourceName = res.resourceName;
    }

    try {
      /* need to abstract this logic */
      const response = await get(`config:services`);
      const listOfServices = response.services;
      const astServices = new AST(listOfServices, 'id');

      const services = serviceIds.map(serviceId =>
        // console.log(`serviceId=${serviceId}`);
        astServices.getByKey(serviceId),
      );
      // console.error('i was here');
      // console.error(services);
      // console.error(astServices.getArray());

      upsert(`config:services`, {
        services: astServices.getArray(),
      });
      /* end of abstraction */

      // get finalResourceName here
      const person = await api({
        action: 'getContact',
        resourceName: finalResourceName,
      });
      const userDefined = person && person.userDefined;

      let reminded = false;

      if (userDefined) {
        const validPhoneArray = userDefined.filter(
          obj => obj.key === 'validPhone',
        );
        // this is the business logic
        /* i think we must check the whole array */
        reminded = validPhoneArray[0] && validPhoneArray[0] === 'false';
      }

      const now = moment();
      // create event vs waiting list

      const { event, uuid } = await api({
        action: 'createWaitingEvent',
        name,
        start,
        mobile,
        // these services sent in are objects
        services,
        duration,
        resourceName: finalResourceName,
        // these are sent in as floats not actually needed
        totalAmount,
        additional,
        discount,
        reminded,
        informed: !!(
          toBeInformed === undefined ||
          toBeInformed === 'false' ||
          toBeInformed === false
        ), // bad logic
        deposit,
        force: true,
      });
      return {
        id: uuid,
        event,
        transaction: {},
        createdAt: now,
        lastUpdated: now,
      };
    } catch (err) {
      // this is scenario to rollback when appointment cannot be created.
      // remove contact
      if (
        (resourceName === '' || resourceName === undefined) &&
        finalResourceName
      ) {
        await api({
          action: 'deleteContact',
          resourceName: finalResourceName,
        });
      }

      console.error(err);
      throw err;
    }
  },
};
