/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import LoadingBar from 'react-redux-loading-bar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import s from './Header.css';
import logoUrl from './logo-small.png';
import logoUrl2x from './logo-small@2x.png';

import history from '../../history';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <LoadingBar />
        <div className={s.container}>
          <div className={s.banner}>
            <img
              src={logoUrl}
              srcSet={`${logoUrl2x} 2x`}
              width="38"
              height="38"
              alt="React"
            />
            <span className={s.brandTxt}>Rare Beauty</span>
          </div>
        </div>
      </div>
    );
  }
}
export default withStyles(s)(Header);
