/* eslint-disable css-modules/no-unused-class */
/* eslint-disable react/forbid-prop-types */
import 'moment-duration-format';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Appointment.css';
import history from '../../../history';
import Link from '../../../components/Link/Link';

const stylesRed = {
  color: 'red',
  whiteSpace: 'normal',
};

const stylesGreen = {
  color: 'green',
  whiteSpace: 'normal',
};

const whiteSpace = {
  whiteSpace: 'normal',
};

class AppointmentList extends React.Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    services: PropTypes.object.isRequired,
  };

  rows(values) {
    return values.map((value /* ,index */) => (
      <TableRow key={value.id}>
        <TableRowColumn style={{ whiteSpace }}>
          <p>
            {value.shortURL ? (
              <a
                href={`http://${value.shortURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                {value.name}
              </a>
            ) : (
              value.name
            )}
          </p>
          <p>{moment(value.start).format('DD MMM YYYY')}</p>
          <p>{moment(value.start).format('hh:mm A')}</p>
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
            <span style={whiteSpace}>
              <Link to={`/appointment/${value.apptId}/edit`}>Edit</Link>
            </span>
          </p>
        </TableRowColumn>
        <TableRowColumn>
          <p>
            <span style={whiteSpace}>
              Created On: {moment(value.created).format('DD MMM YYYY hh:mm A')}
            </span>
          </p>
          <p>
            <span style={whiteSpace}>
              <ul style={{ padding: 0 }}>
                {value.serviceIds.sort().map(serviceId => (
                  <li key={serviceId}>
                    {this.props.services.peekByKey(serviceId).service}
                  </li>
                ))}
              </ul>
            </span>
          </p>
          <p>
            <span style={whiteSpace}>
              $
              {value.serviceIds.reduce(
                (prevValue, serviceId) =>
                  prevValue + this.props.services.peekByKey(serviceId).price,
                0,
              )}
            </span>
          </p>
        </TableRowColumn>
      </TableRow>
    ));
  }

  // eslint-disable-next-line class-methods-use-this
  select(rows) {
    return row => {
      const event = rows[row];
      const to = `/appointment/${event.apptId}/edit`;
      history.push(to);
    };
  }

  render() {
    return (
      <Table>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Details</TableHeaderColumn>
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
