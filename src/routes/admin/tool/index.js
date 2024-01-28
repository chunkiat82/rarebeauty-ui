/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Tool from './Tool';
import Layout from '../../../components/Layout';

function listFreeSlots(fetch) {
  return async () => {
    const slotsResponse = await fetch('/graphql', {
      body: JSON.stringify({
        query: `{slots{   
                    start,
                    end,
                    durationInMinutes,
                    amp,
                  }
                }`,
      }),
    });

    const { data } = await slotsResponse.json();
    return (data && data.slots) || [];
  };
}

function show(store) {
  return () => {
    store.dispatch({ type: 'SHOW_LOADER' });
  };
}

function hide(store) {
  return () => {
    store.dispatch({ type: 'HIDE_LOADER' });
  };
}

async function action({ fetch, store }) {
  show(store)();

  const freeSlots = await listFreeSlots(fetch)();

  hide(store)();

  return {
    chunks: ['tool'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Tool rows={freeSlots} />
      </Layout>
    ),
  };
}

export default action;
