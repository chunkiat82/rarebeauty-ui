import React from 'react';
import { showLoading, hideLoading } from 'react-redux-loading-bar'
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
                        apptId,
                        serviceIds
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

async function action({ fetch, params, store }) {
  store.dispatch(showLoading());
  const events = await getEvents(fetch);
  store.dispatch(hideLoading());
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
