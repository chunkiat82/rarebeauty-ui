import { UnauthorizedError as Jwt401Error } from 'express-jwt';

// import { setRuntimeVariable } from './actions/runtime';

export const reactErrorMiddleware = (err, req, res) => {
  // console.log('err', err);
  if (err.name === 'UnauthorizedError') {
    // res.clearCookie('token');
    return res.status(401).send('Please go away');
  }

  // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    return res.clearCookie('token');
  }
  return res.status(401);
};

export default { reactErrorMiddleware };
