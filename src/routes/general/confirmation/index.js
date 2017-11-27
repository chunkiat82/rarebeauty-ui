/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../../components/Layout';
import Confirmation from './Confirmation';
import API from '../../../api';

const address = 'Blk 987B Jurong West Street 93 #12-569 S(642987)';

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

export function updateEventStatus(fetch) {
  return async input => {
    const { id, status } = input;

    const dateInput = moment(startDate).format('YYYYMMDD');
    const timeInput = moment(startTime).format('HHmm');

    const resp = await fetch('/graphql', {
      body: JSON.stringify({
        query: `mutation($id: String!, $status: String!) {
          updateEventStatus(id:$id, status:$status) {
                id
                status
            }
          }`,
        variables: JSON.stringify({
          id,
          status,
        }),
      }),
    });

    const { data, errors } = await resp.json();

    return { data, errors };
  };
}

async function action({ fetch, params, store }) {
  const eventId = params.id;

  show(store)();
  const { data, errors } = await updateEventStatus(fetch)();
  // console.log(services);
  hide(store)();

  return {
    chunks: ['general-confirmation'],
    address,
    component: (
      <Layout>
        <Confirmation title={address} errors={errors} />
      </Layout>
    ),
  };
}

export default action;
