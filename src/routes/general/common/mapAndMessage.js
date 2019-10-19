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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7977.465154156651!2d103.69033662836527!3d1.3367016720327713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f8ffc39bba3%3A0x86c5239af2cbccd7!2sSingapore%20642987!5e0!3m2!1sen!2ssg!4v1571484005118!5m2!1sen!2ssg"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapAndMessage);
