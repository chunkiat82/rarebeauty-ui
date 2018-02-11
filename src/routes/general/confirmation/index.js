/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import moment from 'moment';
import Layout from '../../../components/PublicLayout';
import MapAndMessage from '../common/mapAndMessage';

async function action({ fetch, params, store }) {
  const { event, workAddress } = store.getState();
  return {
    chunks: ['general-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <MapAndMessage
          address={workAddress}
          message={`Appointment is confirmed! See you on ${moment(
            event.start.dateTime,
          ).format('LLLL')}`}
        />
      </Layout>
    ),
  };
}

export default action;
