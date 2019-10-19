/* eslint-disable prettier/prettier */
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
// import {GridList, GridTile} from 'material-ui/GridList';
// import IconButton from 'material-ui/IconButton';
// import Subheader from 'material-ui/Subheader';
// import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Page from './Page';
import Layout from '../../components/PublicLayout';

// const styles = {
//   root: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//   },
//   gridList: {
//     width: '80%', 
//     margin:'0 auto',
//     // overflowY: 'auto',
//   },
// };

// const tilesData = [
//   {
//     img: 'https://scontent.fsin8-2.fna.fbcdn.net/v/t1.0-9/56770613_598602947283480_6817825223040040960_o.jpg?_nc_cat=107&_nc_ht=scontent.fsin8-2.fna&oh=74f99f33302c82771959691410b8a101&oe=5D5E2AB0',
//     title: 'Breakfast',
//     author: 'jill111',
//   },
//   {
//     img: 'images/grid-list/burger-827309_640.jpg',
//     title: 'Tasty burger',
//     author: 'pashminu',
//   },
//   {
//     img: 'images/grid-list/camera-813814_640.jpg',
//     title: 'Camera',
//     author: 'Danson67',
//   },
//   {
//     img: 'images/grid-list/morning-819362_640.jpg',
//     title: 'Morning',
//     author: 'fancycrave1',
//   },
//   {
//     img: 'images/grid-list/hats-829509_640.jpg',
//     title: 'Hats',
//     author: 'Hans',
//   },
//   {
//     img: 'images/grid-list/honey-823614_640.jpg',
//     title: 'Honey',
//     author: 'fancycravel',
//   },
//   {
//     img: 'images/grid-list/vegetables-790022_640.jpg',
//     title: 'Vegetables',
//     author: 'jill111',
//   },
//   {
//     img: 'images/grid-list/water-plant-821293_640.jpg',
//     title: 'Water plant',
//     author: 'BkrmadtyaKarki',
//   },
// ];

async function action() {
  return {
    chunks: ['page'],
    title: 'Rare Beauty Professional',
    component: (
      <Layout>
        <Page />        
        {/* <GridList
          cellHeight={'100%'}
          style={styles.gridList}
        >          
          {tilesData.map((tile) => (
            <GridTile
              key={tile.img}
              title={tile.title}
              subtitle={<span>by <b>{tile.author}</b></span>}
              actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
            >
              <img src={tile.img} />
            </GridTile>
          ))}
        </GridList> */}
      </Layout>
    ),
  };
}

export default action;
