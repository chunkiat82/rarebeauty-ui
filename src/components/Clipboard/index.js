/* eslint-disable no-new */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import Clipboard from 'react-clipboard.js';

class ClipboardContainer extends React.Component {
  constructor() {
    super();

    this.onSuccess = this.onSuccess.bind(this);
    this.getText = this.getText.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onSuccess() {
    return console.info('successfully copied');
  }

  getText() {
    return this.props.clipboard || 'Nothing Copied from Rare Beauty';
  }

  render() {
    return (
      <Clipboard option-text={this.getText} onSuccess={this.onSuccess}>
        copy to clipboard
      </Clipboard>
    );
  }
}

const mapStateToProps = state => ({
  clipboard: state.copy,
});

export default connect(mapStateToProps)(ClipboardContainer);
