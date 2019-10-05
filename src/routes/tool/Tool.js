/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable prettier/prettier */
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
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';

import s from './Tool.css';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 300,
    overflowY: 'auto',
  },
};

class Home extends React.Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,    
  };

  rows(values) {
    return values.map((value) =>
      <TableRow>
        <TableCell>{`
          ${moment(value.start).format('DD/MM/YY')} - ${value.durationInMinutes} Minutes`}
          <br/>
          {moment(value.start).format('h:mm A')}
          <br/>
         {`${moment(value.end).format('h:mm A')} `}
        </TableCell>        
      </TableRow>
    );
  }

  render() {
    return <div style={styles.root}>
      <Table>
        <TableHead displaySelectAll={false}>
          <TableRow>
            <TableCell>Free Slots - Tool 1</TableCell>
            {/* <TableCell>Time Window</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {this.rows(this.props.rows)}
        </TableBody>
      </Table>
    </div>
  }
}
export default withStyles(s)(Home);
