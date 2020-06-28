/* eslint-disable jsx-a11y/alt-text */
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
import s from './mapAndMessage.css';

class MapAndMessage extends React.Component {
  static propTypes = {
    address: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    // eslint-disable-next-line react/require-default-props
    errors: PropTypes.string,
    seLink: PropTypes.string.isRequired,
  };

  render() {
    const { errors, message, address, src } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <br />
          <a href={this.props.seLink}>
            <img src="https://www.safeentry-qr.gov.sg/assets/images/safe_entry_banner.svg" />
          </a>
          <br />
          <h2>
            <center>
              <span>{errors ? 'There is error!' : message}</span>
            </center>
          </h2>
          <h3 className={s.textCenter}>{address}</h3>
          <iframe
            style={{
              width: 320,
              height: 240,
              frameborder: 0,
              style: 'border:0',
            }}
            title="addressMap"
            src={src}
            allowFullScreen
          />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapAndMessage);
