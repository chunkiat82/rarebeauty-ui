/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/forbid-prop-types */
import 'moment-duration-format';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import moment from 'moment';
import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Appointment.css';
import history from '../../../history';

const stylesGreen = {
  color: 'green'
};

const stylesPurple = {
  color: 'purple'
};

const whiteSpace = {
  whiteSpace: 'normal'
};

class AppointmentList extends React.Component {
  //   static propTypes = {
  //     rows: PropTypes.array.isRequired,
  //     services: PropTypes.array.isRequired,
  //   };

  rows(appointments) {
    return appointments.map((value /* ,index */) => (
      <TableRow key={value.id}>
        <TableRowColumn>
          <p>
            {value.event.shortURL ? (
              <a
                href={`http://${value.event.shortURL}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                {' '}
                {value.event.shortURL}
              </a>
            ) : (
              value.name
            )}
          </p>
          <p>
            <span
              style={{
                color:
                  value.event.status === 'confirmed'
                    ? stylesPurple.color
                    : stylesGreen.color,
                ...whiteSpace
              }}
            >
              {value.event.status === 'tentative'
                ? 'Appointment Created'
                : 'Appointment Confirmed by Customer'}
            </span>
          </p>
        </TableRowColumn>
        <TableRowColumn>
          <p>
            {moment(value.event.start).format('DD MMM YYYY')}
            &nbsp;-&nbsp;
            {moment(value.event.start).format('hh:mm A')}
          </p>

          <span style={whiteSpace}>
            <ul style={{ padding: 0 }}>
              {value.event.serviceIds.sort().map(serviceId => (
                <li key={serviceId}>
                  {this.props.services.peekByKey(serviceId).service}
                </li>
              ))}
            </ul>
          </span>

          <span style={whiteSpace}>
            $
            {value.transaction.totalAmount}
          </span>
        </TableRowColumn>
      </TableRow>
    ));
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
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Status</TableHeaderColumn>
            <TableHeaderColumn>Details</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.rows(this.props.appointments)}
        </TableBody>
      </Table>
    );
  }
}
export default withStyles(s)(AppointmentList);
