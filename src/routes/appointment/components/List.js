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

const stylesRed = {
  color: 'red',
};

const stylesGreen = {
  color: 'green',
};
const whiteSpace = {
  whiteSpace: 'none',
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
            <span>
              <a
                href={`/appointment/edit/${value.apptId}`}
                rel="noopener noreferrer"
              >
                Edit
              </a>
            </span>
          </p>
        </TableRowColumn>
        <TableRowColumn>
          <p>{moment(value.start).format('DD MMM YYYY')}</p>
          <p>{moment(value.start).format('hh:mm A')}</p>
          <p>
            <span>
              Created On: {moment(value.created).format('DD MMM YYYY hh:mm A')}
            </span>
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
          </p>
          <p>
            <span>
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
      const to = `/appointment/edit/${event.apptId}`;
      history.push(to);
    };
  }

  render() {
    return (
      <Table>
        <TableHeader displaySelectAll={false}>
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
