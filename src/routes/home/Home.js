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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import s from './Home.css';
import Link from '../../components/Link/Link';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 500,
    overflowY: 'auto',
  },
};

const tilesData = [
  {
    img: 'images/home/empty-calendar.png',
    title: 'Create Appointment',
    subTitle: 'With/Without Payments',
    link: '/appointment/create'
  },
  {
    img: 'images/home/calendar-appointments.png',
    title: 'List Appointments',
    subTitle: 'Upcoming 20',
    link: '/appointment'
  },
  {
    img: 'images/home/tool.png',
    title: 'Tools',
    subTitle: 'Tools',
    link: '/tool'
  }
];

class Home extends React.Component {

  render() {
    return <div style={styles.root}>      
      <GridList
        cellHeight={180}
        // cellWidth={180}
        style={styles.gridList}
      >
        <Subheader style={{ textAlign: 'center' }}>How can I help you, Today?</Subheader>
        {tilesData.map((tile) => (
          <Link key={tile.link} to={tile.link}>
            <GridTile
              key={tile.img}
              title={tile.title}
              subtitle={<span>{tile.subTitle}</span>}
              actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
            >
              <img src={tile.img} />
            </GridTile>
          </Link>
        ))}
      </GridList>
    </div>
  }
}
export default withStyles(s)(Home);
