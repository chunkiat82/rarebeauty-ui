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
  const src =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15954.921969560013!2d103.68922277989016!3d1.3379843862102117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f91b8b821c7%3A0xc05561d22390b4e0!2sSingapore%20642649!5e0!3m2!1sen!2ssg!4v1593248847700!5m2!1sen!2ssg';

  const event = await getEvent(fetch)(eventId);
  await patchEvent(fetch)(eventId, 'confirmed');

  return {
    chunks: ['customer-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <MapAndMessage
          address={address}
          src={src}
          message={`Appointment is confirmed! See you on ${moment(event.start)
            .tz('Asia/Singapore')
            .format('LLLL')}`}
        />
      </Layout>
    ),
  };
}

export default action;
