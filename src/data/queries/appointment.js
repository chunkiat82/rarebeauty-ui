/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const { GraphQLString } = require('graphql');
const AppointmentType = require('../types/AppointmentType');
const { get } = require('../database');
const logger = require('../../utils/logger');

const appointment = {
  type: AppointmentType,
  args: {
    id: { type: GraphQLString },
  },
  async resolve(_, args, context) {
    try {
      logger.info(`Query appointment requested for id: ${args.id}`, {
        context: {
          tenant: context.tenant,
          userAgent: context.userAgent,
          debug: context.debug
        },
        args
      });
      
      if (!args.id) {
        throw new Error("Appointment ID is required");
      }
      
      const dbObj = await get(`appt:${args.id}`, context);
      
      if (!dbObj) {
        logger.warn(`Appointment not found for id: ${args.id}`);
        throw new Error(`Appointment with ID ${args.id} not found`);
      }
      
      logger.info(`Appointment found:`, {
        id: dbObj.id,
        createdAt: dbObj.createdAt,
        eventId: dbObj.eventId
      });
      
      return dbObj;
    } catch (error) {
      logger.error(`Error fetching appointment:`, {
        id: args.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
};

module.exports = appointment;
