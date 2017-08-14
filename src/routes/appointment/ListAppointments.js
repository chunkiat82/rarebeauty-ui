import React from 'react';

import Layout from '../../components/Layout';
import AppointmentList from './components/List';
async function action({ fetch, params }) {

    return {
        chunks: ['appointment-list'],
        title: 'Rare Beauty Professional',
        component: (
            <Layout>
                <AppointmentList></AppointmentList>
            </Layout>
        ),
    };
}

export default action;