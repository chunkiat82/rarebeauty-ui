/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
import Layout from '../../components/Layout';

function refreshContacts(fetch) {
  return async () => {
    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation {
          refreshContacts {
            id                                               
          }
        }`,
      }),
    });
    await resp.json();
    return { result: 'refreshed' };
  };
}

function generateTiles(fetch) {
  return [
    {
      img: 'images/home/empty-calendar.png',
      title: 'Create Appointment',
      subTitle: 'With/Without Payments',
      link: '/appointment/create',
    },
    {
      img: 'images/home/calendar-appointments.png',
      title: 'List Appointments',
      subTitle: 'Upcoming 20',
      link: '/appointment',
    },
    {
      img: 'images/home/tool.png',
      title: 'Tools',
      subTitle: 'Tools',
      link: '/tool',
    },
    {
      img: 'images/home/phone.png',
      title: 'Refresh Contacts',
      subTitle: 'Refresh Contacts',
      link: '/',
      onClick: async () => {
        refreshContacts(fetch)();
        alert('refreshed');
      },
    },
  ];
}

async function action({ fetch }) {
  return {
    chunks: ['home'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Home tiles={generateTiles(fetch)} />
      </Layout>
    ),
  };
}

export default action;
