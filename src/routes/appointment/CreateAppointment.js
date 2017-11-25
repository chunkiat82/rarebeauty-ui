import React from 'react';
// import moment from 'moment';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';
import {
  queryPastAppointments,
  createCalendar,
  listContacts,
  getServices,
} from './common/functions';

function show(store) {
  return () => {
    store.dispatch(showLoading());
  };
}

function hide(store) {
  return () => {
    store.dispatch(hideLoading());
  };
}

async function action({ fetch, store }) {
  show(store)();
  const contacts = await listContacts(fetch)();
  const services = await getServices(fetch)();
  // console.log(services);
  hide(store)();

  if (!contacts && !services)
    throw new Error('Failed to load the contacts or services.');

  return {
    chunks: ['appointment-create'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          services={services}
          queryPastAppointments={queryPastAppointments(fetch)}
          contact={contacts}
          post={createCalendar(fetch)}
          buttonText={'Create Appointment'}
          successMessage={'Appointment Added'}
          errorMessage={'Appointment Creation Failed'}
          showLoading={show(store)}
          hideLoading={hide(store)}
        />
      </Layout>
    ),
  };
}

export default action;
