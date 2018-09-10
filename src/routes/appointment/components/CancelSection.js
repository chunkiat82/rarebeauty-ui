/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
// http://www.material-ui.com/#/components/select-field
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './Appointment.css';
import history from '../../../history';

class AppointmentCancelSection extends React.Component {
  state = {
    submitted: false,
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = async () => {
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
  };

  render() {
    const actions = [
      <FlatButton
        label="No"
        onClick={() => {
          this.setState({ open: false });
        }}
      />,
      <FlatButton label="Yes" primary onClick={this.handleClose} />,
    ];

    return (
      <div>
        <RaisedButton
          ref={c => {
            this.submitBtn = c;
          }}
          label={this.props.label}
          secondary
          fullWidth
          disabled={this.state.submitted}
          onClick={() => {
            this.handleClickOpen();
          }}
        />
        <Dialog
          title="Are you sure?"
          actions={actions}
          modal
          open={this.state.open}
        >
          Please click yes to delete...
        </Dialog>
      </div>
    );
  }
}
export default withStyles(s)(AppointmentCancelSection);
