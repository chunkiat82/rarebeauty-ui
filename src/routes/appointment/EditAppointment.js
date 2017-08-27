import React from 'react';
import moment from 'moment';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';
import { listOfServices, mapOfServices } from '../../data/database/services';
import {
  queryPastAppointments,
  listContacts,
  getAppointment,
  upsertAppointment,
} from './common/functions';

async function action({ fetch, params, store }) {
  const apptId = params.id;

  store.dispatch(showLoading());
  const contact = await listContacts(fetch)();
  const appointment = await getAppointment(fetch)(apptId);

  const { event, transaction } = appointment;
  const name = event.name;
  const mobile = event.mobile;
  const startDate = moment(event.start);
  const endDate = moment(event.end);
  const duration = Number(moment.duration(endDate - startDate) / 60000);
  const serviceIds = event.serviceIds;
  const resourceName = event.resourceName;

  let discount = 0;
  let additional = 0;
  let totalAmount = 0;
  if (transaction) {
    discount = transaction.discount;
    additional = transaction.additional;
    totalAmount = transaction.totalAmount;
  }
  const pastAppointments = await queryPastAppointments(fetch)(resourceName);
  // console.log(`resourceName=${resourceName}`);
  // console.log(`Edit pastAppointments=${JSON.stringify(pastAppointments)}`);
  store.dispatch(hideLoading());

  if (!contact) throw new Error('Failed to load the contact feed.');

  return {
    chunks: ['appointment-edit'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          post={async input => {
            await upsertAppointment(fetch)(
              Object.assign({ id: apptId, resourceName }, input),
            );
            open(location, '_self').close();
          }}
          queryPastAppointments={queryPastAppointments(fetch)}
          pastAppointments={pastAppointments}
          listOfServices={listOfServices}
          mapOfServices={mapOfServices}
          contact={contact}
          name={name}
          mobile={mobile}
          startDate={startDate.toDate()}
          startTime={startDate.toDate()}
          serviceIds={serviceIds}
          discount={discount}
          additional={additional}
          totalAmount={totalAmount}
          duration={duration}
          resourceName={resourceName}
          buttonText={'Update Appointment'}
          successMessage={'Appointment Updated'}
          {...this.props}
        />
      </Layout>
    ),
  };
}

export default action;
