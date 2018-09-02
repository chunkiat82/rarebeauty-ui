import React from 'react';
import moment from 'moment';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';
import {
  queryPastAppointments,
  listContacts,
  getAppointment,
  updateAppointment,
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

async function action({ fetch, params, store }) {
  const apptId = params.id;

  show(store)();
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
  let deposit = 0;
  if (transaction) {
    discount = transaction.discount;
    additional = transaction.additional;
    totalAmount = transaction.totalAmount;
    deposit = transaction.deposit;
  }
  const pastAppointments = await queryPastAppointments(fetch)(resourceName);
  const services = await getServices(fetch)();
  // console.log(`resourceName=${resourceName}`);
  // console.log(`Edit pastAppointments=${JSON.stringify(pastAppointments)}`);
  hide(store)();

  if (!contact) throw new Error('Failed to load the contact feed.');

  return {
    chunks: ['appointment-edit'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          post={async input => {
            // console.log(input);
            await updateAppointment(fetch)(
              Object.assign({ id: apptId, resourceName }, input),
            );
            setTimeout(() => {
              open(location, '_self').close();
            }, 100);
            return { updatedAppointment: true };
          }}
          queryPastAppointments={queryPastAppointments(fetch)}
          pastAppointments={pastAppointments}
          services={services}
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
          errorMessage={'Appointment Creation Failed'}
          showLoading={show(store)}
          hideLoading={hide(store)}
          deposit={deposit}
          {...this.props}
        />
      </Layout>
    ),
  };
}

export default action;
