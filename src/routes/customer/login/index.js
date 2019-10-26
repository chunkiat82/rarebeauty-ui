/* eslint-disable prettier/prettier */
import React from 'react';
import Layout from '../../../components/PublicLayout';
import Login from './Login';
import history from '../../../history';
import {
  getContact,
} from '../../appointment/common/functions';


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


async function action(context) {
  const { fetch, store, query } = context;  
  const { url } = query;

  async function checkValidCustomer(number) {
    // hardcoded for /p/customer/customerId
    const customerId = url.split('/')[3];

    if (customerId) {
      const resourceName = `people/${customerId}`;
      show(store)();
      const contact = await getContact(fetch)(resourceName);
      hide(store)();
      // console.log(contact.mobile.replace(/ /g,''));
      if (contact && contact.mobile && contact.mobile.replace(/ /g,'').indexOf(number) >= 0) {
        // console.log('hit me');
        store.customerId = customerId;
        return history.push(url);
      }
    }
    store.customerId = null;
    return alert('Please enter correct mobile number');
  }

  return {
    chunks: ['customer-login'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Login submit={checkValidCustomer} />
      </Layout>
    ),
  };
}

export default action;
