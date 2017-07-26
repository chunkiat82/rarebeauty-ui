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
import s from './Header.css';
import Link from '../Link';
// import Navigation from '../Navigation';
import logoUrl from './logo-small.png';
import logoUrl2x from './logo-small@2x.png';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {/* <Navigation /> */}
          <div className={s.banner}>
            <Link className={s.brand} to="/">
              <img
                src={logoUrl}
                srcSet={`${logoUrl2x} 2x`}
                width="38"
                height="38"
                alt="React"
              />
            </Link>
            <span className={s.brandTxt}>Rare Beauty</span>
            <h5 className={s.bannerTitle}>Create Appointment</h5>
            <p className={s.bannerDesc}>
              Name, Mobile, Date, Time, Duration &amp; Services
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
