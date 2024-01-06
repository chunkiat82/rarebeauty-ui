/**
 /**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLString as StringType } from 'graphql';
import AppointmentType from '../types/AppointmentType';
import { get } from '../database';

const appointment = {
  type: AppointmentType,
  args: {
    id: { type: StringType },
  },
  async resolve(_, args, context) {
    // console.log('query appointment args', JSON.stringify(args));
    // console.log('query appointment context', JSON.stringify(context));
    const dbObj = await get(`appt:${args.id}`, context);
    // remember to check AppointmentType
    // console.log('query appointment dbObj', JSON.stringify(dbObj));
    return dbObj;
  },
};

export default appointment;
