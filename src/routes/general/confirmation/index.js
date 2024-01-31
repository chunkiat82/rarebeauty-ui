/* eslint-disable jsx-a11y/alt-text */
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import moment from 'moment-timezone';
import Layout from '../../../components/PublicLayout';
import MapAndMessage from '../common/mapAndMessage';
import { getEvent, patchEvent } from '../common/functions';

async function action({ store, fetch, params }) {
  const { eventId } = params;
  const { workAddress } = store.getState();

  const address = workAddress;
  const event = await getEvent(fetch)(eventId);

  if (event && event.error) {
    return {
      chunks: ['general-confirmation'],
      title: 'Rare Beauty Professional',
      component: (
        <Layout>
          <MapAndMessage message={`Appointment Not Found!`} />
        </Layout>
      ),
    };
  }
  await patchEvent(fetch)(eventId, 'confirmed');

  return {
    chunks: ['general-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <MapAndMessage
          address={address}
          message={`Appointment is confirmed! See you on ${moment(event.start)
            .tz('Asia/Singapore')
            .format('LLLL')}`}
        />
      </Layout>
    ),
  };
}

export default action;
