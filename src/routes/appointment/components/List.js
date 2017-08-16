/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
// http://www.material-ui.com/#/components/select-field
import 'moment-duration-format';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Appointment.css';
import history from '../../../history';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

class AppointmentList extends React.Component {
  static propTypes = {};

  rows(values) {
    return values.map((value, index) =>
      <TableRow key={value.id}>
        <TableRowColumn>
          {index + 1}
        </TableRowColumn>
        <TableRowColumn>
          {value.name}
        </TableRowColumn>
        <TableRowColumn>
          {moment(value.start).format('DD MMM YYYY hh:mm A')}
        </TableRowColumn>
      </TableRow>,
    );
  }

  select(rows) {
    return row => {
      const event = rows[row];
      const to = `/appointment/edit/${event.apptId}`;
      history.push(to);
    };
  }

  render() {
    return (
      <Table onRowSelection={this.select(this.props.rows)}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>ID</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Status</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.rows(this.props.rows)}
        </TableBody>
      </Table>
    );
  }
}
export default withStyles(s)(AppointmentList);
