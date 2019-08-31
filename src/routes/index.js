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
            import(/* webpackChunkName: 'appointment-create' */ './appointment/CreateAppointment'),
        },
        {
          path: '/:customerId/appointments',
          load: () =>
            import(/* webpackChunkName: 'customer-appointments-list' */ './customer/appointments'),
        },
      ],
    },
    {
      path: '/p', // public path
      action: context => {
        // console.log(Object.keys(context));
        const { url, store } = context;
        if (url.indexOf('login') === -1) {
          if (!store.customer) {
            return { redirect: `/p/login?url=${url}` }; // route does not match (skip all /admin* routes)
          }
        }
        return context.next(); // or `return context.next()` - try to match child routes
      },
      children: [
        {
          path: '/login',
          load: () =>
            import(/* webpackChunkName: 'customer-login' */ './customer/login'),
        },
        {
          path: '/customer/:customerId/appointments',
          load: () =>
            import(/* webpackChunkName: 'customer-appointments-list' */ './customer/appointments'),
        },
      ],
    },
    {
      path: '/appointment/create',
      load: () =>
        import(/* webpackChunkName: 'appointment-create' */ './appointment/CreateAppointment'),
    },
    {
      path: '/appointment/edit/:id',
      load: () =>
        import(/* webpackChunkName: 'appointment-edit' */ './appointment/EditAppointment'),
    },
    {
      path: '/appointment/',
      load: () =>
        import(/* webpackChunkName: 'appointment-list' */ './appointment/ListAppointments'),
    },
    {
      path: '/contact',
      load: () => import(/* webpackChunkName: 'contact' */ './contact'),
    },
    {
      path: '/login',
      load: () => import(/* webpackChunkName: 'login' */ './login'),
    },
    {
      path: '/register',
      load: () => import(/* webpackChunkName: 'register' */ './register'),
    },
    {
      path: '/about',
      load: () => import(/* webpackChunkName: 'about' */ './about'),
    },
    {
      path: '/privacy',
      load: () => import(/* webpackChunkName: 'privacy' */ './privacy'),
    },
    {
      path: '/admin',
      load: () => import(/* webpackChunkName: 'admin' */ './admin'),
    },
    {
      path: '/general/confirmation/:id',
      load: () =>
        import(/* webpackChunkName: 'general-confirmation' */ './general/confirmation'),
    },
    {
      path: '/general/reservation/:id',
      load: () =>
        import(/* webpackChunkName: 'general-reservation' */ './general/reservation'),
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
