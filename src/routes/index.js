/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable global-require */

// The top-level (parent) route

import ca from /* webpackChunkName: 'customer-appointments-list' */ './customer/appointments';

const routes = {
  path: '/',

  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '/page',
      load: () => import(/* webpackChunkName: 'page' */ './page'),
    },
    {
      path: '/',
      load: () => import(/* webpackChunkName: 'home' */ './home'),
    },
    {
      path: '/tool',
      load: () => import(/* webpackChunkName: 'tool' */ './tool'),
    },
    {
      path: '/customer',
      children: [
        {
          path: '/:customerId/createAppointment',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-create' */ './appointment/CreateAppointment'
            ),
        },
        {
          path: '/:customerId/appointments',
          load: () =>
            import(
              /* webpackChunkName: 'customer-appointments-list' */ './customer/appointments'
            ),
        },
      ],
    },
    {
      path: '/p', // public path
      action: context => context.next(),
      children: [
        {
          path: '/login',
          load: () =>
            import(/* webpackChunkName: 'customer-login' */ './customer/login'),
        },
        {
          path: '/customer/:customerId/appointments',
          action: context => {
            const { url, store, params } = context;
            const { customerId } = params;
            // console.log(`store.getState().user`, store.getState().user);
            if (
              store.getState().user &&
              store.getState().user.type === 'admin'
            ) {
              // console.log('context.params.customerId', context.params.customerId);
              return {
                redirect: `/customer/${customerId}/createAppointment`,
              };
            }
            // console.log('redirect', `/p/login?url=${url}`);
            // console.log(`store`, store);
            if (store.customerId !== customerId) {
              return { redirect: `/p/login?url=${url}` }; // route does not match (skip all /admin* routes)
              // }
            }
            return ca(context);
            // return action(context);
          },
        },
      ],
    },
    {
      path: '/appointment/create',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-create' */ './appointment/CreateAppointment'
        ),
    },
    {
      path: '/appointment/edit/:id',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-edit' */ './appointment/EditAppointment'
        ),
    },
    {
      path: '/appointment/',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-list' */ './appointment/ListAppointments'
        ),
    },
    {
      path: '/login',
      load: () => import(/* webpackChunkName: 'login' */ './login'),
    },
    {
      path: '/general/confirmation/:id',
      load: () =>
        import(
          /* webpackChunkName: 'general-confirmation' */ './general/confirmation'
        ),
    },
    {
      path: '/general/reservation/:id',
      load: () =>
        import(
          /* webpackChunkName: 'general-reservation' */ './general/reservation'
        ),
    },

    // Wildcard routes, e.g. { path: '*', ... } (must go last)
    {
      path: '*',
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
    },
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();

    // Provide default values for title, description etc.
    route.title = `${route.title || 'Untitled Page'}`;
    route.description = route.description || '';

    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
  routes.children.unshift({
    path: '/error',
    action: require('./error').default,
  });
}

export default routes;
