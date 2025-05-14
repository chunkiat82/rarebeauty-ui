const { GraphQLList, GraphQLString } = require('graphql');
const ServiceType = require('../types/ServiceType');
const { get } = require('../database');

const services = {
  type: new GraphQLList(ServiceType),
  async resolve(_, _args, context) {
    const response = await get(`config:services`, context);
    const finalServices = response.services;
    return finalServices;
  },
};

module.exports = services;
