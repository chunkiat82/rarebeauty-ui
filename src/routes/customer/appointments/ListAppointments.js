/* eslint-disable prettier/prettier */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/forbid-prop-types */
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

const stylesGreen = {
  color: 'green',
};

const stylesPurple = {
  color: 'purple',
};

class AppointmentList extends React.Component {
  //   static propTypes = {
  //     rows: PropTypes.array.isRequired,
  //     services: PropTypes.array.isRequired,
  //   };

  rows(values) {
    return values.map((value /* ,index*/) =>
      <TableRow key={value.id}>
        <TableCell>
          <p>
            {value.shortURL
              ? <a href={`http://${value.shortURL}`} target="_blank">
                {' '}{value.shortURL}
              </a>
              : value.name}
          </p>
          <p>
            <span
              style={value.status === 'confirmed' ? stylesPurple : stylesGreen}
            >
              {value.status === 'tentative' ? 'Appointment Created' : 'Appointment Confirmed by Customer'}
            </span>
          </p>    
        </TableCell>
        <TableCell>
          <p>
            {moment(value.start).format('DD MMM YYYY')}
          </p>
          <p>
            {moment(value.start).format('hh:mm A')}
          </p>
          <p>
            <span>
            {value.serviceIds
              .map(
                serviceId =>
                  // console.log(serviceId);
                  this.props.services.peekByKey(serviceId).service,
              )
              .join(', ')}
          </span>
            -
              <span>
              ${value.serviceIds.reduce(
                (prevValue, serviceId) =>
                  prevValue + this.props.services.peekByKey(serviceId).price,
                0,
              )}
            </span>
          </p>
        </TableCell>
      </TableRow>,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  select(rows) {
    return row => {
      const event = rows[row];
      const to = `/appointment/edit/${event.apptId}`;
      history.push(to);
    };
  }

  render() {
    // const rows = this.props.rows;
    // console.log(JSON.stringify(this.props.rows, null, 2));
    // console.log(this.props.services);
    return (
      <Table onRowSelection={this.select(this.props.rows)}>
        <TableHead displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Details</TableCell>
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
