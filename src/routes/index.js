/** https://github.com/kriasoft/universal-router */

/* eslint-disable global-require */

// The top-level (parent) route
import ca from /* webpackChunkName: 'customer-appointments-list' */ './customer/appointments';

const routes = {
  path: '/',
  children: [
    {
      path: '/admin', // admin path
      action: context => {
        const userStore = context.store.getState('user');
        if (
          userStore &&
          (userStore.user.role === 'admin' || userStore.user.user === 'legacy')
        ) {
          return context.next();
        }
        return { redirect: '/page' }; // <== request a redirect
      },
      children: [
        {
          path: '/home',
          load: () => import(/* webpackChunkName: 'home' */ './admin/home'),
        },
        {
          path: '/appointment/create',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-create' */ './admin/appointment/CreateAppointment'
            ),
        },
        {
          path: '/customer/:customerId/createAppointment',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-create' */ './admin/appointment/CreateAppointment'
            ),
        },
        {
          path: '/appointment/:id/edit',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-edit' */ './admin/appointment/EditAppointment'
            ),
        },
        {
          path: '/appointments/',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-list' */ './admin/appointment/ListAppointments'
            ),
        },
        {
          path: '/tool',
          load: () => import(/* webpackChunkName: 'tool' */ './admin/tool'),
        },
      ],
    },
    {
      path: '/appointment', // to be deprecated
      action: context => {
        const userStore = context.store.getState('user');
        if (
          userStore &&
          (userStore.user.role === 'admin' || userStore.user.user === 'legacy')
        ) {
          return context.next();
        }
        return { redirect: '/page' }; // <== request a redirect
      },
      children: [
        {
          path: '/:id/edit',
          load: () =>
            import(
              /* webpackChunkName: 'appointment-edit' */ './admin/appointment/EditAppointment'
            ),
        },
      ],
    },
    {
      path: '/general',
      action: context => context.next(),
      children: [
        {
          path: '/confirmation/:eventId',
          load: () =>
            import(
              /* webpackChunkName: 'general-confirmation' */ './general/confirmation'
            ),
        },
        {
          path: '/reservation/:eventId',
          load: () =>
            import(
              /* webpackChunkName: 'general-reservation' */ './general/reservation'
            ),
        },
      ],
    },
    {
      path: '/customer', // public path
      action: context => context.next(),
      children: [
        {
          path: '/login*',
          load: () =>
            import(/* webpackChunkName: 'customer-login' */ './customer/login'),
        },
        {
          path: '/confirmation/:eventId',
          load: () =>
            import(
              /* webpackChunkName: 'customer-confirmation' */ './customer/confirmation'
            ),
        },
        {
          path: '/reservation/:eventId',
          load: () =>
            import(
              /* webpackChunkName: 'customer-reservation' */ './customer/reservation'
            ),
        },
        {
          path: '/:customerId/appointments',
          action: context => {
            // return aimport(/* webpackChunkName: 'customer-appointments-list' */ './customer/appointments')(context);
            const { url, store, params } = context;
            const { customerId } = params;

            // console.log(`store`, store);
            if (store.customerId !== customerId) {
              return { redirect: `/customer/login?url=${url}` };
            }

            // its so important to preload the page asynchrously
            return ca(context);
          },
        },
      ],
    },
    {
      path: '/page*',
      load: () => import(/* webpackChunkName: 'page' */ './page'),
    },
    {
      path: '*',
      action: context => {
        console.error(
          'Page Not Found - Defaulted to Admin Home or Public Page',
          context.path,
        );
        const userStore = context.store.getState('user');
        if (
          userStore &&
          (userStore.user.role === 'admin' || userStore.user.user === 'legacy')
        ) {
          return { redirect: '/admin/home' }; // <== request a redirect
        }
        return { redirect: '/page' }; // <== request a redirect
      },
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
