import React from 'react';

import Layout from '../../components/Layout';
import AppointmentList from './components/List';

async function getEvents(fetch) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `{
                    events {
                        id,
                        name
                        mobile,
                        start,
                        end,
                        apptId
                    }
                }`,
    }),
  });
  const { data } = await resp.json();
  // console.log(`data=${JSON.stringify(data, null, 2)}`);
  return data.events.reduce((array, item) => {
    if (item) array[array.length] = item;
    return array;
  }, []);
}

async function action({ fetch, params }) {
  const events = await getEvents(fetch);
  return {
    chunks: ['appointment-list'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <AppointmentList rows={events} />
      </Layout>
    ),
  };
}

export default action;
