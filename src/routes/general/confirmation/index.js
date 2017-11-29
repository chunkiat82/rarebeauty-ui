/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../../components/PublicLayout';
import Confirmation from './Confirmation';

const address = 'Blk 987B Jurong West Street 93 #12-569 S(642987)';

async function action({ fetch, params, store }) {
  const { event } = store.getState();

  return {
    chunks: ['general-confirmation'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Confirmation title={address} event={event} />
      </Layout>
    ),
  };
}

export default action;
