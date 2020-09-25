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
// eslint-disable-next-line css-modules/no-unused-class
import s from './mapAndMessage.css';

class MapAndMessage extends React.Component {
  static propTypes = {
    address: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    // src: PropTypes.string.isRequired,
    // eslint-disable-next-line react/require-default-props
    errors: PropTypes.string,
  };

  render() {
    const { errors, message, address /* , src */ } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h2>
            <center>
              <span>{errors ? 'There is error!' : message}</span>
            </center>
          </h2>
          <h3 className={s.textCenter}>{address}</h3>
          <img
            className={s.map}
            src="https://rarebeautysg.s3.amazonaws.com/rb-map-400.png"
          />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapAndMessage);
