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
    // eslint-disable-next-line react/require-default-props
    errors: PropTypes.string,
  };

  render() {
    const { errors, message, address } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h2>
            <center>
              <span>
                {errors ? 'There is error!' : message}
              </span>
            </center>
          </h2>
          <h3 className={s.textCenter}>
            {address}
          </h3>
          <iframe
            style={{
              width: 320,
              height: 240,
              frameborder: 0,
              style: 'border:0',
            }}
            title="addressMap"
            src="https://www.google.com/maps/embed/v1/place?q=Blk%20987B%20Jurong%20West%20Street%2093%20Singapore%20642987&key=AIzaSyCHNiTXwTuXbuIBRqmrdzHkmnds6-JdruA"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapAndMessage);
