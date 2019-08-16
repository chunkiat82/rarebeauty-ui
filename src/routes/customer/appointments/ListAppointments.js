/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/forbid-prop-types */
import 'moment-duration-format';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
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

  rows(appointments) {
    return appointments.map((value /* ,index*/) =>
      <TableRow key={value.id}>
        <TableCell>
          <p>
            {value.event.shortURL
              ? <a href={`http://${value.event.shortURL}`} target="_blank">
                {' '}{value.event.shortURL}
              </a>
              : value.name}
          </p>
          <p>
            <span
              style={value.event.status === 'confirmed' ? stylesPurple : stylesGreen}
            >
              {value.event.status === 'tentative' ? 'Appointment Created' : 'Appointment Confirmed by Customer'}
            </span>
          </p>    
        </TableCell>
        <TableCell>
          <p>
            {moment(value.event.start).format('DD MMM YYYY')}
            &nbsp;-&nbsp;
            {moment(value.event.tart).format('hh:mm A')}
          </p>
          <p>
            <span>
            {value.event.serviceIds
              .map(
                serviceId =>
                  // console.log(serviceId);
                  this.props.services.peekByKey(serviceId).service,
              )
              .join(', ')}
          </span>
          </p>
          <p>
          <span>
              ${value.event.serviceIds.reduce(
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
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.rows(this.props.appointments)}
        </TableBody>
      </Table>
    );
  }
}
export default withStyles(s)(AppointmentList);