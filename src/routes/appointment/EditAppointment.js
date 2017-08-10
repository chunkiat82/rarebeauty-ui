import React from 'react';
import moment from 'moment';
import Appointment from './Appointment';
import Layout from '../../components/Layout';
import { listOfServices, mapOfServices } from '../../data/database/services';

async function updateCalendar(fetch, input) {
  const {
    slider: duration,
    name,
    mobile,
    resourceName = '',
    timeChosen,
    dateChosen,
    services,
  } = input;

  const dateInput = moment(dateChosen).format('YYYYMMDD');
  const timeInput = moment(timeChosen).format('HHmm');

  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `mutation($id: String!, $name: String!, $mobile:String!, $resourceName:String, $start:String!, $services:[String]!, $duration:Int!, prices:[Float]!) {
          updateEvent(id:$id name:$name, mobile:$mobile, resourceName:$resourceName, start:$start, services:$services, duration:$duration, prices:$prices ) {
            name
            mobile
            start
            services
            duration
            prices
          }
        }`,
      variables: JSON.stringify({
        name,
        mobile,
        resourceName,
        start: `${dateInput}T${timeInput}`,
        services,
        duration,
        prices
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
      query: `{appointment(id: "${apptId}"){id, eventId,transId}}`,
    }),
  });
  const { data } = await resp.json();
  return data.appointment;
}

async function getEvent(fetch, eventId) {  
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: `{event(id: "${eventId}"){name,mobile}}`,
    }),
  });
  const { data } = await resp.json();
  console.log(data);

  return {
    "kind": "calendar#event",
    "etag": "\"3004489380866000\"",
    "id": eventId,
    "status": "confirmed",
    "htmlLink": "https://www.google.com/calendar/event?eid=dnAwYjIwa2lhcGQzZmdqc3RjN2prbjBndmMgcmFyZWJlYXV0eUBzb2hvLnNn",
    "created": "2017-08-09T02:11:30.000Z",
    "updated": "2017-08-09T02:11:30.433Z",
    "summary": "Michelle Chan",
    "description": "Touch Up - Dense,Eye Mask,Full Face Threading\n\nhttps://rarebeauty.soho.sg/appointment/edit/0ebbad20-7ca8-11e7-8e30-0f09b6bc2a21",
    "location": "Home",
    "creator": {
      "email": "serviceaccount@rare-beauty-calendar.iam.gserviceaccount.com"
    },
    "organizer": {
      "email": "rarebeauty@soho.sg",
      "self": true
    },
    "start": {
      "dateTime": "2017-08-09T10:45:00+08:00"
    },
    "end": {
      "dateTime": "2017-08-09T12:00:00+08:00"
    },
    "iCalUID": "vp0b20kiapd3fgjstc7jkn0gvc@google.com",
    "sequence": 0,
    "attendees": [
      {
        "email": "81889366@rarebeauty.soho.sg",
        "displayName": "Michelle Chan",
        "responseStatus": "needsAction",
        "comment": "+6581889366"
      }
    ],
    "extendedProperties": {
      "shared": {
        "mobile": "+6581889366",
        "reminded": "false",
        "services": "service:4,service:5,service:18",
        "uuid": "0ebbad20-7ca8-11e7-8e30-0f09b6bc2a21"
      }
    },
    "reminders": {
      "useDefault": true
    }
  };
}

async function getTransaction(fetch, transactionId) {

  return {
    "id": transactionId,
    "items": [
      {
        "itemId": 'service:4',
        "name": 'Full Set - Dense',
        "price": 60
      },
      {
        "itemId": 'service:5',
        "name": 'Eye Mask',
        "price": 5
      },
      {
        "itemId": 'service:18',
        "name": 'Full Face Threading',
        "price": 20
      }
    ],
    "totalAmount": 85,
    "services": 85,
    "products": 0,
    "discount": 0,
    "additional": 0,
    "createdAt": "2017-08-09T10:45:00+08:00"
  };
}



async function action({ fetch, params }) {
  const data = await listContacts(fetch);
  const { eventId, transactionId } = await getAppointment(fetch, params.id)
  const event = await getEvent(fetch, eventId);
  const transaction = await getTransaction(fetch, transactionId);
  // // console.log(Promise.all);
  //   const [event, transaction] = Promise.all([eventP, transactionP]);
  // console.log(event)
  const name = event.attendees[0].displayName;
  const mobile = event.extendedProperties.shared.mobile;
  const startDate = moment(event.start.dateTime);
  const endDate = moment(event.end.dateTime);
  const duration = Number(moment.duration(endDate - startDate) / 60000);
  const serviceIds = event.extendedProperties.shared.services.split(',');
  const resourceName = 'something';
  const discount = transaction.discount;
  const additional = transaction.additional;
  const totalAmount = transaction.totalAmount;

  // contact, name, mobile, startDate, startTime, duration, serviceIds, resourceName, prices, id, discount, additional
  // 

  if (!data || !data.contact)
    throw new Error('Failed to load the contact feed.');

  return {
    chunks: ['appointment-edit'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Appointment
          post={input => updateCalendar(fetch, input)}
          listOfServices={listOfServices}
          mapOfServices={mapOfServices}
          contact={data.contact}
          name={name}
          mobile={mobile}
          startDate={startDate.toDate()}
          startTime={startDate.toDate()}
          serviceIds={serviceIds}
          resourceName={resourceName}
          discount={discount}
          additional={additional}
          totalAmount={totalAmount}
          duration={duration}
          buttonText={"Update Appointment"}
          {...this.props}
        />
      </Layout>
    ),
  };
}

export default action;
