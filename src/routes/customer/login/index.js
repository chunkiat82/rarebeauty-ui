/* eslint-disable prettier/prettier */
import React from 'react';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Layout from '../../../components/Layout';
import Login from './Login';
import history from '../../../history';
import {
  getContact,
} from '../../appointment/common/functions';

async function action(context) {
  const { fetch, store, query } = context;  
  const { url } = query;

  async function checkValidCustomer(number) {
    // hardcoded for /p/customer/customerId
    const customerId = url.split('/')[3];

    if (customerId) {
      const resourceName = `people/${customerId}`;
      store.dispatch(showLoading());
      const contact = await getContact(fetch)(resourceName);
      store.dispatch(hideLoading());
      // console.log(contact.mobile.replace(/ /g,''));
      if (contact && contact.mobile && contact.mobile.replace(/ /g,'').indexOf(number) >= 0) {        
        store.customer = true;
        return history.push(url);
      }
    }
    store.customer = false;
    return history.push('/');
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
