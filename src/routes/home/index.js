/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
import Layout from '../../components/Layout';

async function action({ fetch }) {
  const resp = await fetch('/graphql', {
    body: JSON.stringify({
      query: '{contact{name,mobile,resourceName}}',
    }),
  });
  const { data } = await resp.json();

  // console.log(data.contact);

  if (!data || !data.contact)
    throw new Error('Failed to load the contact feed.');
  return {
    chunks: ['home'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Home contact={data.contact} />
      </Layout>
    ),
  };
}

export default action;
