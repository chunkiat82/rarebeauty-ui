/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
// import FlatButton from 'material-ui/FlatButton';
// import FontIcon from 'material-ui/FontIcon';
import React from 'react';
import PropTypes from 'prop-types';
import history from '../../history';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

const divStyle = {
  display: 'inline',
};

class Link extends React.Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    copy: PropTypes.func,
  };

  static defaultProps = {
    onClick: null,
    copy: () => {},
  };

  handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    this.props.copy(this.link.href);

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      return;
    }

    event.preventDefault();
    history.push(this.props.to);
  };

  render() {
    const { to, children, copy, ...props } = this.props;
    return (
      <div style={divStyle}>
        <a
          ref={input => {
            this.link = input;
          }}
          href={to}
          {...props}
          onClick={this.handleClick}
        >
          {children}
        </a>
      </div>
    );
  }
}

export default Link;
