import { GraphQLObjectType as ObjectType } from 'graphql';

import createAppointment from '../CreateAppointment.js';
import createWaitingAppointment from '../CreateWaitingAppointment.js';
import updateAppointment from '../UpdateAppointment.js';
import cancelAppointment from '../CancelAppointment.js';
import updateEventStatus from '../UpdateEventStatus.js';
import refreshContacts from '../RefreshContacts.js';
import createContact from '../CreateContact.js';

const Mutation = new ObjectType({
  name: 'Mutation',
  fields: () => ({
    createAppointment,
    createWaitingAppointment,
    updateAppointment,
    cancelAppointment,
    updateEventStatus,
    refreshContacts,
    createContact,
  }),
});

export default Mutation;
