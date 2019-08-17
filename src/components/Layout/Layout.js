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
import s from './Layout.css';
import Header from '../Header';
import LoaderContainer from '../Loading';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    userAgent: PropTypes.string,
  };

  render() {
    return (
      <MuiThemeProvider
        muiTheme={getMuiTheme({ userAgent: this.props.userAgent })}
      >
        <div>
          <Header />
          <LoaderContainer />
          {this.props.children}
          <br />
          <br />
        </div>
      </MuiThemeProvider>
    );
  }
}

Layout.defaultProps = {
  userAgent: '',
};

export default withStyles(normalizeCss, s)(Layout);
