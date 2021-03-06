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
// eslint-disable-next-line css-modules/no-unused-class
import s from '../common/mapAndMessage.css';

async function action({ store }) {
  const {
    event,
    workAddress,
    oldWorkAddress,
    oldSafeEntryLink,
    safeEntryLink,
  } = store.getState();

  const startDateTime = moment(event.start.dateTime);
  const address = startDateTime.isBefore('2020-07-01')
    ? oldWorkAddress
    : workAddress;

  const seLink = startDateTime.isBefore('2020-07-01')
    ? oldSafeEntryLink
    : safeEntryLink;

  const src = startDateTime.isBefore('2020-07-01')
    ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7977.465154156651!2d103.69033662836527!3d1.3367016720327713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f8ffc39bba3%3A0x86c5239af2cbccd7!2sSingapore%20642987!5e0!3m2!1sen!2ssg!4v1571484005118!5m2!1sen!2ssg'
    : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15954.921969560013!2d103.68922277989016!3d1.3379843862102117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f91b8b821c7%3A0xc05561d22390b4e0!2sSingapore%20642649!5e0!3m2!1sen!2ssg!4v1593248847700!5m2!1sen!2ssg';
  return {
    chunks: ['general-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <div className={s.confirmation}>
          <div style={{ width: '20%', float: 'left' }}>
            <a href={seLink}>
              <img src="https://rarebeautysg.s3.amazonaws.com/clickhere_50.png" />
            </a>
          </div>
          <div style={{ width: '80%', float: 'right' }}>
            <a href={seLink}>
              <img src="https://www.safeentry-qr.gov.sg/assets/images/safe_entry_banner.svg" />
            </a>
          </div>
        </div>
        <MapAndMessage
          address={address}
          src={src}
          message={`Appointment is confirmed! See you on ${moment(
            event.start.dateTime,
          )
            .tz('Asia/Singapore')
            .format('LLLL')}`}
        />
      </Layout>
    ),
  };
}

export default action;
