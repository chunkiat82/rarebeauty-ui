/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { HashLoader } from 'react-spinners';

const override = `
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function LoaderContainer(props) {
  // console.log(`props.loading`,props.loading);
  return props.loading ? (
    <div
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
        <HashLoader
          css={override}
          sizeUnit={'px'}
          size={120}
          color={'#373277'}
          loading={props.loading}
        />
      </div>
    </div>
  ) : (
    <div />
  );
}

const mapStateToProps = state => ({
  loading: state.loading,
});

export default connect(mapStateToProps)(LoaderContainer);
