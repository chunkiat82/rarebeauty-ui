import React from 'react';
import Layout from '../../components/Layout';
import AppointmentList from './components/List';

import { getServices } from './common/functions';

function show(store) {
  return () => {
    store.dispatch({ type: 'SHOW_LOADER' });
  };
}

function hide(store) {
  return () => {
    store.dispatch({ type: 'HIDE_LOADER' });
  };
}

async function getEvents(fetch) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `{
                    events {
                        id,
                        status,
                        name
                        mobile,
                        start,
                        end,
                        apptId,
                        serviceIds,
                        confirmed,
                        shortURL,
                        created
                    }
                }`,
    }),
  });
  const { data } = await resp.json();
  // console.log(`data=${JSON.stringify(data, null, 2)}`);
  return data.events.reduce((array, item) => {
    if (item) {
      // eslint-disable-next-line no-param-reassign
      array[array.length] = item;
    }
    return array;
  }, []);
}

// eslint-disable-next-line no-unused-vars
async function action({ fetch, _, store }) {
  show(store)();
  const events = await getEvents(fetch);
  const services = await getServices(fetch)();
  hide(store)();

  return {
    chunks: ['appointment-list'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <AppointmentList rows={events} services={services} />
      </Layout>
    ),
  };
}

export default action;
