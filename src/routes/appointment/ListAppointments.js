import React from 'react';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Layout from '../../components/Layout';
import AppointmentList from './components/List';

import { getServices } from './common/functions';

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
      array[array.length] = item;
    }
    return array;
  }, []);
}

async function action({ fetch, params, store }) {
  store.dispatch(showLoading());
  const events = await getEvents(fetch);
  const services = await getServices(fetch)();
  store.dispatch(hideLoading());

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
