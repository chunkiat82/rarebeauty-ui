/* eslint-disable prettier/prettier */
import React from 'react';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Layout from '../../../components/Layout';
import AppointmentList from './ListAppointments';
import {
  queryPastAppointments,
  getServices,
} from '../../appointment/common/functions';

async function action({ fetch, params, store }) {
  const customerId = params.customerId;

  const resourceName = `people/${customerId}`;

  store.dispatch(showLoading());
  const { appointments } = await queryPastAppointments(fetch)(resourceName);
  const services = await getServices(fetch)();
  const events = appointments.map(item => {
    const { event } = item;
    return { ...event };
  });
  store.dispatch(hideLoading());

  return {
    chunks: ['appointment-list'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <center><span><h1>Last 5 Appointments</h1></span></center>
        <AppointmentList rows={events} services={services} />
      </Layout>
    ),
  };
}

export default action;
