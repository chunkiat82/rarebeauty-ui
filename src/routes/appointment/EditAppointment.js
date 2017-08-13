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
            query: `
            {appointment(id: "${apptId}"){
                id
                event { 
                    name
                    mobile,
                    start,
                    end,
                    serviceIds
                }
                transaction {
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
    return data.appointment;
}

async function action({ fetch, params }) {
    const data = await listContacts(fetch);
    const appointment = await getAppointment(fetch, params.id)
    // // console.log(Promise.all);
    //   const [event, transaction] = Promise.all([eventP, transactionP]);  
    const { event, transaction } = appointment;
    const name = event.name;
    const mobile = event.mobile;
    const startDate = moment(event.start);
    const endDate = moment(event.end);
    const duration = Number(moment.duration(endDate - startDate) / 60000);
    const serviceIds = event.serviceIds;
    const resourceName = 'something';
    const discount = transaction.discount;
    const additional = transaction.additional;
    const totalAmount = transaction.totalAmount;

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
