import React from 'react';
import Page from './Page';
import Layout from '../../components/PublicLayout';

async function action() {
  return {
    chunks: ['page'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Page />
      </Layout>
    ),
  };
}

export default action;
