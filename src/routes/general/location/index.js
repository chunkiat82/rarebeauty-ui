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
import Register from './Register';

const address = 'Blk 987B Jurong West Street 93 #12-569 S(642987)';

function action() {
  return {
    chunks: ['general-location'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Register title={address} />
      </Layout>
    ),
  };
}

export default action;
