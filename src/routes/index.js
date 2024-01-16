/** https://github.com/kriasoft/universal-router */

/* eslint-disable global-require */

// The top-level (parent) route
import ca from /* webpackChunkName: 'customer-appointments-list' */ './customer/appointments';
// import home from /* webpackChunkName: 'home' */ './home';

const routes = {
  path: '/',
  // Keep in mind, routes are evaluated in order
  children: [
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
    {
      path: '/appointment/create',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-create' */ './appointment/CreateAppointment'
        ),
    },
    {
      path: '/appointment/:id/edit',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-edit' */ './appointment/EditAppointment'
        ),
    },
    {
      path: '/appointments/',
      load: () =>
        import(
          /* webpackChunkName: 'appointment-list' */ './appointment/ListAppointments'
        ),
    },
    {
      path: '/page*',
      load: () => import(/* webpackChunkName: 'page' */ './page'),
    },
    {
      path: '/home',
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
          path: '/login*',
          load: () =>
            import(/* webpackChunkName: 'customer-login' */ './customer/login'),
        },
        {
          path: '/customer/:customerId/appointments',
          action: context => {
            // return aimport(/* webpackChunkName: 'customer-appointments-list' */ './customer/appointments')(context);
            const { url, store, params } = context;
            const { customerId } = params;

            // console.log(`store`, store);
            if (store.customerId !== customerId) {
              return { redirect: `/p/login?url=${url}` };
            }

            // its so important to preload the page asynchrously
            return ca(context);
          },
        },
      ],
    },
    {
      path: '/login',
      load: () => import(/* webpackChunkName: 'login' */ './login'),
    },

    {
      path: '*',
      action: context => {
        // console.log('context', context);
        const userStore = context.store.getState('user');
        if (
          userStore &&
          (userStore.user.role === 'admin' || userStore.user.user === 'legacy')
        ) {
          return { redirect: '/home' }; // <== request a redirect
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
