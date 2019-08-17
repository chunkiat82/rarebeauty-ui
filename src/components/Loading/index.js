/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

function LoaderContainer(props) {
  // console.log(`props.loading`,props.loading);
  return props.loading
    ? <div
        style={{
          position: 'fixed',
          content: '',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 800,
        }}
      >
        <div
          style={{
            zIndex: '1000',
            position: 'fixed',
            bottom: '5px',
            left: '50%',
            top: '20%',
            transform: ' translateX(-50%)',
          }}
        >
          <Loader type="bars" color="#373277" height={200} width={200} />
        </div>
      </div>
    : <div />;
}

const mapStateToProps = state => ({
  loading: state.loading,
});

export default connect(mapStateToProps)(LoaderContainer);
