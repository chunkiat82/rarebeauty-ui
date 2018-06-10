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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Appointment.css';
import history from '../../../history';

const stylesRed = {
  color: 'red',
};

const stylesGreen = {
  color: 'green',
};

class AppointmentList extends React.Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    services: PropTypes.array.isRequired,
  };

  rows(values) {
    return values.map((value /* ,index*/) =>
      <TableRow key={value.id}>
        <TableCell>
          {value.shortURL
            ? <a href={value.shortURL} target="_blank">
                {' '}{value.name}
              </a>
            : value.name}
        </TableCell>
        <TableCell>
          <p>
            {moment(value.start).format('DD MMM YYYY')}
          </p>
          <p>
            {moment(value.start).format('hh:mm A')}
          </p>
          <p>
            <span
              style={value.status === 'confirmed' ? stylesGreen : stylesRed}
            >
              {value.status === 'confirmed'
                ? `${value.status} - ${value.confirmed}`
                : `${value.status}`}
            </span>
          </p>
          <p>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography >More Details</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                Created On: {moment(value.created).format('DD MMM YYYY hh:mm A')}
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          </p>
        </TableCell>
        <TableCell style={{ whiteSpace: 'wrap', textOverflow: 'wrap' }}>
          {value.serviceIds
            .map(
              serviceId =>
                // console.log(serviceId);
                this.props.services.peekByKey(serviceId).service,
            )
            .join(', ')}
        </TableCell>
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
        <TableHead displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date/Time</TableCell>
            <TableCell>Services</TableCell>
          </TableRow>
        </TableHead>
        <TableBody displayRowCheckbox={false}>
          {this.rows(this.props.rows)}
        </TableBody>
      </Table>
    );
  }
}
export default withStyles(s)(AppointmentList);
