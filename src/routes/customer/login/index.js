/* eslint-disable prettier/prettier */
import React from 'react';
import Layout from '../../../components/PublicLayout';
import Login from './Login';
import history from '../../../history';
import {
  getContact,
} from '../../admin/common/functions';


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
    // hardcoded for /customer/c1019801061454220195/appointments
    const customerId = url.split('/')[2];
    // console.log('customerId',customerId);

    if (customerId && number) {
      const resourceName = `people/${customerId}`;
      show(store)();
      const contact = await getContact(fetch)(resourceName);
      hide(store)();
      // console.log(contact.mobile.replace(/ /g,''));
      if (contact && contact.mobile && contact.mobile.replace(/ /g,'').indexOf(number.replace(/ /g,'')) >= 0) {        
        store.customerId = customerId;
        history.push(url);
        return true;
      }
    }
    store.customerId = null;
    return false;
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
