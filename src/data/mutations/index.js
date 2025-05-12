const {
  GraphQLObjectType
} = require('graphql');

const createAppointment = require('./CreateAppointment');
const createWaitingAppointment = require('./CreateWaitingAppointment');
const updateAppointment = require('./UpdateAppointment');
const cancelAppointment = require('./CancelAppointment');
const updateEventStatus = require('./UpdateEventStatus');
const refreshContacts = require('./RefreshContacts');
const createContact = require('./CreateContact');

const Mutation = new GraphQLObjectType({
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

module.exports = Mutation;
