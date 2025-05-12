const { 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean
} = require('graphql');

const db = require('../utils/db');

// Define types
const ServiceType = new GraphQLObjectType({
  name: 'Service',
  fields: {
    id: { type: GraphQLString },
    service: { type: GraphQLString },
    price: { type: GraphQLFloat },
    duration: { type: GraphQLInt },
    enabled: { type: GraphQLBoolean }
  }
});

const AppointmentType = new GraphQLObjectType({
  name: 'Appointment',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    mobile: { type: GraphQLString },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
    services: { type: new GraphQLList(ServiceType) },
    status: { type: GraphQLString },
    resourceName: { type: GraphQLString },
    totalAmount: { type: GraphQLFloat },
    deposit: { type: GraphQLFloat },
    createdAt: { type: GraphQLString }
  }
});

// Define queries
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    services: {
      type: new GraphQLList(ServiceType),
      resolve: async () => {
        const result = await db.get('config:services');
        return result.services;
      }
    },
    service: {
      type: ServiceType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { id }) => {
        const result = await db.get('config:services');
        return result.services.find(service => service.id === id);
      }
    },
    appointments: {
      type: new GraphQLList(AppointmentType),
      args: {
        status: { type: GraphQLString }
      },
      resolve: async (_, { status }) => {
        // For now, return test data
        const appointments = await db.query('SELECT * FROM appointments WHERE type = "appointment"');
        if (status) {
          return appointments.filter(appt => appt.status === status);
        }
        return appointments;
      }
    },
    appointment: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { id }) => {
        return await db.get(id);
      }
    }
  }
});

// Define mutations
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createAppointment: {
      type: AppointmentType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        mobile: { type: new GraphQLNonNull(GraphQLString) },
        start: { type: new GraphQLNonNull(GraphQLString) },
        end: { type: new GraphQLNonNull(GraphQLString) },
        serviceIds: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        resourceName: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, args) => {
        const servicesConfig = await db.get('config:services');
        const selectedServices = args.serviceIds.map(id => 
          servicesConfig.services.find(s => s.id === id)
        ).filter(Boolean);

        const appointment = {
          id: `appt:${Date.now()}`,
          name: args.name,
          mobile: args.mobile,
          start: args.start,
          end: args.end,
          services: selectedServices,
          status: 'confirmed',
          resourceName: args.resourceName,
          totalAmount: selectedServices.reduce((sum, s) => sum + s.price, 0),
          deposit: 0,
          createdAt: new Date().toISOString()
        };

        await db.upsert(appointment.id, appointment);
        return appointment;
      }
    },
    updateAppointmentStatus: {
      type: AppointmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { id, status }) => {
        const appointment = await db.get(id);
        appointment.status = status;
        await db.upsert(id, appointment);
        return appointment;
      }
    }
  }
});

// Create and export schema
const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});

module.exports = schema; 