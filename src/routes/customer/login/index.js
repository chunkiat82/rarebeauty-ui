/* eslint-disable prettier/prettier */
import React from 'react';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import Layout from '../../../components/Layout';
import Login from './Login';
import history from '../../../history';

async function action(context) {
  // const customerId = params.customerId;
  // console.log(Object.keys(context));
  const { store, query } = context;
  const { url } = query;
  // console.log(url);
  store.dispatch(showLoading());

  function setMobileNumber(number) {
    store.customer = { mobile: number };
    history.push(url);
  }
  // eslint-disable-next-line no-param-reassign

  store.dispatch(hideLoading());

  return {
    chunks: ['customer-login'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Login submit={setMobileNumber} />
      </Layout>
    ),
  };
}

export default action;
