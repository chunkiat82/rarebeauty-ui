/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import moment from 'moment';
import Appointment from './Appointment';
import Layout from '../../components/Layout';
import { listOfServices, mapOfServices } from '../../data/database/services';

async function createCalendar(fetch, input) {
  const {
    duration,
    name,
    mobile,
    resourceName = '',
    startDate,
    startTime,
    serviceIds,
  } = input;

  const dateInput = moment(startDate).format('YYYYMMDD');
  const timeInput = moment(startTime).format('HHmm');

  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `mutation($name: String!, $mobile:String!, $resourceName:String, $start:String!, $services:[String]!, $duration:Int!) {
          createEvent(name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, services:$services, duration:$duration ) {
            name
            mobile
            start
            services
            duration
          }
        }`,
      variables: JSON.stringify({
        name,
        mobile,
        resourceName,
        start: `${dateInput}T${timeInput}`,
        services: serviceIds,
        duration,
      }),
    }),
  });

  const { data } = await resp.json();

  return data;
}

async function listContacts(fetch) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: '{contact{name,mobile,display,resourceName}}',
    }),
  });
  const { data } = await resp.json();

  return data;
}

async function action({ fetch }) {
  const data = await listContacts(fetch);
  if (!data || !data.contact)
    throw new Error('Failed to load the contact feed.');
  return {
    chunks: ['appointment-create'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          listOfServices={listOfServices}
          mapOfServices={mapOfServices}
          contact={data.contact}
          post={input => createCalendar(fetch, input)}
        />
      </Layout>
    ),
  };
}

export default action;
