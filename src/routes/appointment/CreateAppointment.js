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
  getContact,
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

async function action({ fetch, params, store }) {
  show(store)();

  // console.log(`params=${JSON.stringify(params)}`);

  const customerId = params.customerId;

  const resourceName = `people/${customerId}`;
  // console.log(`resourceName=${resourceName}`);

  const contacts = await listContacts(fetch)();
  const services = await getServices(fetch)();
  let contact = null;
  let pastAppointments = null;
  if (customerId) {
    contact = await getContact(fetch)(resourceName);
    pastAppointments = await queryPastAppointments(fetch)(resourceName);
  }
  // console.log(`contact = ${JSON.stringify(contact)}`);

  // console.
  // const customer = customerId && await
  // console.log(contacts);
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
          pastAppointments={pastAppointments}
          queryPastAppointments={queryPastAppointments(fetch)}
          contacts={contacts}
          post={createCalendar(fetch)}
          buttonText={'Create Appointment'}
          successMessage={'Appointment Added'}
          errorMessage={'Appointment Creation Failed'}
          showLoading={show(store)}
          hideLoading={hide(store)}
          name={contact.name}
          mobile={contact.mobile}
          resourceName={contact.resourceName}
          contact
        />
      </Layout>
    ),
  };
}

export default action;
