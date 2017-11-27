import createAppointment from './CreateAppointment';
import updateAppointment from './UpdateAppointment';
import updateEventStatus from './UpdateEventStatus';

const Mutation = new ObjectType({
  name: 'Mutation',
  fields: () => ({
    createAppointment,
    updateAppointment,
    updateEventStatus,
  }),
});

export default Mutation;
