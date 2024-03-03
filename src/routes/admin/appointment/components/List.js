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
import history from '../../../../history';
import Link from '../../../../components/Link/Link';

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
      <TableRow key={`TR${value.id}`}>
        <TableRowColumn key={`TC1${value.id}`} style={{ whiteSpace }}>
          <p>
            {value.shortURL ? (
              <a
                href={`${value.shortURL}`}
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
          <Link key={value.id} to={`/appointment/${value.apptId}/edit`}>
            Edit
          </Link>
        </TableRowColumn>
        <TableRowColumn key={`TC2${value.id}`}>
          <p>
            <span style={whiteSpace}>
              Created On: {moment(value.created).format('DD MMM YYYY hh:mm A')}
            </span>
          </p>
          <p>
            <span style={whiteSpace}>
              <div style={{ padding: 0 }}>
                {value.serviceIds.sort().map(serviceId => (
                  <div key={`${serviceId}`}>
                    {' '}
                    {this.props.services.peekByKey(serviceId)
                      ? serviceId
                      : 'null'}
                  </div>
                ))}
              </div>
            </span>
          </p>
          <p>
            <span style={whiteSpace} />
          </p>
        </TableRowColumn>
      </TableRow>
    ));
  }

  // eslint-disable-next-line class-methods-use-this
  select(rows) {
    return row => {
      const event = rows[row];
      const to = `/admin/appointment/${event.apptId}/edit`;
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
