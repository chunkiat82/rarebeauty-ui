/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Paper from 'material-ui/Paper';

import s from './Page.css';

const style = {
  width: '80%',
  textAlign: 'center',
  display: 'inline-block',
  margin: '0 auto',
  //   paddingBottom: '5%',
};

const mapStyle = {
  width: '80%',
  textAlign: 'center',
  display: 'inline-block',
  margin: '0 auto',
  padding: '1%',
  background:
    'Radial-gradient(rgba(71, 71, 71, 0.35), rgba(71, 71, 71, 0)), Radial-gradient(at 0 0, #474747, #070707)',
};

class Page extends React.Component {
  static propTypes = {};

  render() {
    return (
      <div className={s.root}>
        <Paper style={style} zDepth={5}>
          <img
            src="https://s3-ap-southeast-1.amazonaws.com/rarebeautysg/rbsg-rect-page-front.jpg"
            className={s.middle}
          />
        </Paper>
        <br />
        <br />
        <Paper style={mapStyle} zDepth={5}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7325944158874!2d103.69252531574084!3d1.336690999025084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f8ffc39bba3%3A0x86c5239af2cbccd7!2sSingapore+642987!5e0!3m2!1sen!2ssg!4v1557561471316!5m2!1sen!2ssg"
            width="100%"
            height="400px"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
          />
        </Paper>
      </div>
    );
  }
}
export default withStyles(s)(Page);
