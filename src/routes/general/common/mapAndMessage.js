import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from './mapAndMessage.css';

class MapAndMessage extends React.Component {
  static propTypes = {
    address: PropTypes.string,
    message: PropTypes.string.isRequired,
    // src: PropTypes.string.isRequired,
    // eslint-disable-next-line react/require-default-props
    errors: PropTypes.string,
  };

  render() {
    const { errors, message, address /* , src */ } = this.props;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h2>
            <center>
              <span>{errors ? 'There is error!' : message}</span>
            </center>
          </h2>
          <h3 className={s.textCenter}>{address}</h3>
          {address && (
            <img src="https://rarebeautysg.s3.amazonaws.com/rb-map-400.png" />
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(MapAndMessage);
