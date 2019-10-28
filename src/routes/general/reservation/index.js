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

async function action({ store }) {
  const { event, workAddress } = store.getState();

  return {
    chunks: ['general-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href={`/general/calendar/${event.id}`}>
            Save Calendar
            <br />
            <i className={'material-icons'}>calendar_today</i>
          </a>
        </div>
        <MapAndMessage
          address={workAddress}
          message={`Slot reserved on ${moment(event.start.dateTime)
            .tz('Asia/Singapore')
            .format('LLLL')}`}
        />
      </Layout>
    ),
  };
}

export default action;
