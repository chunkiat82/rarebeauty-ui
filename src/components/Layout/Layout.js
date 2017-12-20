/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import LoadingBar from 'react-redux-loading-bar';
import s from './Layout.css';
import Header from '../Header';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    userAgent: PropTypes.string,
  };

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme({ userAgent: this.props.userAgent })}>
        <div>
          <Header />
          {this.props.children}
          <LoadingBar />
          <br/>
          <br/>
        </div>
      </MuiThemeProvider>
    );
  }
}

// Layout.getInitialProps = async (ctx) => {
//   console.log('test1');
//   const headers = ctx.req ? ctx.req.headers : {}
//   console.log('i got hereA');
//   const userAgent = ctx.req ? ctx.req.headers['user-agent'] : navigator.userAgent
//   console.log('i got here0');
//   const props = {
//     ...await (React.Component.getInitialProps ? React.Component.getInitialProps(ctx) : {})
//   }
//   console.log('i got here1');

//   if (!process.browser) {
//     console.log('i got here2');
//     const app = (
//       <MuiThemeProvider muiTheme={getMuiTheme({ userAgent })}>
//         <div>
//           <Header />
//           {this.props.children}
//         </div>
//       </MuiThemeProvider>
//     )
//   }
//   console.log('i got here3');
//   return {
//     headers,
//     userAgent,
//     ...props
//   }
// }

export default withStyles(normalizeCss, s)(Layout);
