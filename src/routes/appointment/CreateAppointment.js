import React from 'react';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';

import {
  queryPastAppointments,
  createAppointment,
  createWaitingCalendar,
  listContacts,
  getServices,
  getContact,
} from './common/functions';

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

function copy(store) {
  return value => {
    store.dispatch({ type: 'COPY', value });
  };
}

async function action({ fetch, params, store }) {
  show(store)();

  // console.log(`params=${JSON.stringify(params)}`);

  const customerId = params.customerId;

  const resourceName = customerId ? `people/${customerId}` : null;
  // console.log(`resourceName=${resourceName}`);

  const contacts = await listContacts(fetch)();
  const services = await getServices(fetch)();
  let contact = { name: '', mobile: '' };
  if (customerId) {
    contact = await getContact(fetch)(resourceName);
  }
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
          pastAppointments={[]}
          cancelAppointmentsCount={0}
          queryPastAppointments={queryPastAppointments(fetch)}
          contacts={contacts}
          post={createAppointment(fetch)}
          postWaiting={createWaitingCalendar(fetch)}
          postText={'Create Appointment'}
          postWaitingText={'Create Waiting Appointment'}
          successMessage={'Appointment Added'}
          errorMessage={'Appointment Creation Failed'}
          showLoading={show(store)}
          hideLoading={hide(store)}
          name={contact.name}
          mobile={contact.mobile}
          resourceName={resourceName}
          toBeInformed
          contact
          copy={copy(store)}
        />
      </Layout>
    ),
  };
}

export default action;
