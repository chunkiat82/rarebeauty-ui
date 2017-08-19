import React from 'react';
import moment from 'moment';
import Appointment from './components/Individual';
import Layout from '../../components/Layout';
import { listOfServices, mapOfServices } from '../../data/database/services';

async function upsertAppointment(fetch, input) {
  const {
    duration,
    id,
    name,
    mobile,
    resourceName,
    startDate,
    startTime,
    serviceIds,
    totalAmount,
    additional,
    discount,
  } = input;

  const dateInput = moment(startDate).format('YYYYMMDD');
  const timeInput = moment(startTime).format('HHmm');

  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `mutation($id: String!, $name: String!, $mobile:String!, $resourceName:String, $start:String!, $serviceIds:[String]!, $duration:Int!, $totalAmount:Float, $additional:Float, $discount:Float) {
            updateAppointment(id:$id, name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, serviceIds:$serviceIds, duration:$duration, totalAmount:$totalAmount, additional:$additional, discount:$discount ) {
                id
                event { 
                    id,
                    name
                    mobile,
                    start,
                    end,
                    serviceIds
                }
                transaction {
                    id,
                    items { id, type, name, price },
                   totalAmount,
                    service,
                    product,
                    discount,
                    additional
                }
            }
            }`,
      variables: JSON.stringify({
        id,
        name,
        mobile,
        resourceName,
        start: `${dateInput}T${timeInput}`,
        serviceIds,
        duration,
        totalAmount,
        additional,
        discount,
      }),
    }),
  });

  const { data } = await resp.json();

  return data;
}

async function listContacts(fetch) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: '{contact{name,mobile,display,resourceName}}',
    }),
  });
  const { data } = await resp.json();
  return data;
}

async function getAppointment(fetch, apptId) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `
            {appointment(id: "${apptId}"){
                id,
                event {
                    id,
                    name
                    mobile,
                    start,
                    end,
                    serviceIds
                },
                transaction {
                    id,
                    items { id, type, name, price },
                    totalAmount,
                    service,
                    product,
                    discount,
                    additional
                } 
            }}`,
    }),
  });
  const { data } = await resp.json();
  // console.log(`data=${JSON.stringify(data, null, 2)}`);
  return data.appointment;
}

async function action({ fetch, params }) {
  const apptId = params.id;
  const data = await listContacts(fetch);
  const appointment = await getAppointment(fetch, apptId);
  // // console.log(Promise.all);
  //   const [event, transaction] = Promise.all([eventP, transactionP]);
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

  // contact, name, mobile, startDate, startTime, duration, serviceIds, resourceName, id, discount, additional
  //

  if (!data || !data.contact)
    throw new Error('Failed to load the contact feed.');

  return {
    chunks: ['appointment-edit'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          post={async (input) => {
            await upsertAppointment(
              fetch,
              Object.assign({ id: apptId, resourceName }, input)
            );
            open(location, '_self').close();
          }}
          listOfServices={listOfServices}
          mapOfServices={mapOfServices}
          contact={data.contact}
          name={name}
          mobile={mobile}
          startDate={startDate.toDate()}
          startTime={startDate.toDate()}
          serviceIds={serviceIds}
          discount={discount}
          additional={additional}
          totalAmount={totalAmount}
          duration={duration}
          buttonText={'Update Appointment'}
          successMessage={'Appointment Updated'}
          {...this.props}
        />
      </Layout>
    ),
  };
}

export default action;
