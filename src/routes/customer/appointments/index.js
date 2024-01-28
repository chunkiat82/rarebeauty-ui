/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable prettier/prettier */
import React from 'react';
import Layout from '../../../components/PublicLayout';
import AppointmentList from './ListAppointments';
import {
  queryPastAppointments,
  getServices,
} from '../../admin/common/functions';


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


async function action({ fetch, params, store }) {
  const { customerId } = params;
  const resourceName = `people/${customerId}`;

  show(store)();

  const { appointments } = await queryPastAppointments(fetch)(resourceName);
  const services = await getServices(fetch)();

  hide(store)();

  return {
    chunks: ['customer-appointments-list'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <center><span><h1>Last 5 Appointments</h1></span></center>
        <AppointmentList appointments={appointments} services={services} />
      </Layout>
    ),
  };

}

export default action;
