import { GraphQLObjectType as ObjectType } from 'graphql';

import createAppointment from './CreateAppointment';
import createWaitingAppointment from './CreateWaitingAppointment';
import updateAppointment from './UpdateAppointment';
import cancelAppointment from './CancelAppointment';
import updateEventStatus from './UpdateEventStatus';

const Mutation = new ObjectType({
  name: 'Mutation',
  fields: () => ({
    createAppointment,
    createWaitingAppointment,
    updateAppointment,
    cancelAppointment,
    updateEventStatus,
  }),
});

export default Mutation;
