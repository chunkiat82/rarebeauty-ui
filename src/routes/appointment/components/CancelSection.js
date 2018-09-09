/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
// http://www.material-ui.com/#/components/select-field
import PropTypes from 'prop-types';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Appointment.css';
import history from '../../../history';

class AppointmentCancelSection extends React.Component {
  componentWillMount() {
    this.setState({ submitted: false });
  }

  render() {
    return (
      <RaisedButton
        ref={c => {
          this.submitBtn = c;
        }}
        label={this.props.label}
        secondary
        fullWidth
        disabled={this.state.submitted}
        onClick={async () => {
          this.props.showLoading();
          this.setState({
            submitted: true,
          });
          const results = await this.props.post();
          this.props.hideLoading();

          if (results.errors) {
            this.setState({ error: 'Error In Creating Appointment' });
            console.error('Error In Creating Appointment');
          } else {
            this.setState({ notify: false });
            history.push(`/`);
          }
        }}
      />
    );
  }
}
export default withStyles(s)(AppointmentCancelSection);
