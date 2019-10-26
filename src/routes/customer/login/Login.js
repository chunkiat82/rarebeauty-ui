/* eslint-disable no-alert */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
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
import s from './Login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mobile: '' };

    this.registerEmail = this.registerEmail.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  registerEmail = e => {
    e.preventDefault();
    if (this.state.mobile.length < 8) {
      alert('Please enter correct mobile number');
    } else {
      this.props.submit(this.state.mobile).then(result => {
        if (!result) alert('Please enter correct mobile number');
      });
    }
  };

  handleChange(event) {
    this.setState({ mobile: event.target.value });
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <br />
          <form onSubmit={this.registerEmail}>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="mobile">
                Your Mobile Number For Verification
              </label>
              <input
                className={s.input}
                id="mobile"
                type="tel"
                name="mobile"
                onChange={this.handleChange}
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
              />
            </div>
            <div className={s.formGroup}>
              <button className={s.button} type="submit">
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Login);
