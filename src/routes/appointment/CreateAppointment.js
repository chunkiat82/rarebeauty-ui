import React from 'react';
// import moment from 'moment';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';
import { listOfServices, mapOfServices } from '../../data/database/services';
import {
  queryPastAppointments,
  createCalendar,
  listContacts,
} from './common/functions';

async function action({ fetch, store }) {
  store.dispatch(showLoading());
  const contact = await listContacts(fetch)();
  store.dispatch(hideLoading());

  if (!contact) throw new Error('Failed to load the contact feed.');

  return {
    chunks: ['appointment-create'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          listOfServices={listOfServices}
          mapOfServices={mapOfServices}
          queryPastAppointments={queryPastAppointments(fetch)}
          contact={contact}
          post={createCalendar(fetch)}
          buttonText={'Create Appointment'}
          successMessage={'Appointment Added'}
        />
      </Layout>
    ),
  };
}

export default action;
