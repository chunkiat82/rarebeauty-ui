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
// import AutoComplete from 'material-ui/AutoComplete';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';
import FontIcon from 'material-ui/FontIcon';

import s from './Home.css';

const iconStyles = {
  marginRight: 24,
};

class Home extends React.Component {
  static propTypes = {
    contact: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        mobile: PropTypes.string.isRequired,
        resourceName: PropTypes.string.isRequired,
      }),
    ).isRequired,
  };

  state = {
    dataSource: [],
    values: [],
    services: ['Full Set', 'Touch Up', 'Facial', 'Waxing'],
    slider: 75,
  };

  handleUpdateInput = value => {
    this.setState({
      dataSource: [value, value + value, value + value + value],
    });
  };

  handleChange = (event, index, value) => this.setState({ value });
  handleChangeService = (event, index, services) => this.setState({ services });
  handleSlider = (event, value) => {
    this.setState({ slider: value });
  };

  // menuItems(values) {
  //   return names.map(name =>
  //     <MenuItem
  //       key={name}
  //       insetChildren
  //       checked={values && values.indexOf(name) > -1}
  //       value={name}
  //       primaryText={name}
  //     />,
  //   );
  // }

  render() {
    const { services } = this.state;
    return (
      <MuiThemeProvider>
        <div className={s.root}>
          <div className={s.container}>
            <SelectField
              floatingLabelText="Name"
              value={this.state.value}
              onChange={this.handleChange}
              fullWidth
            >
              {this.props.contact.map(item =>
                <MenuItem value={1} primaryText={item.name} />,
              )}
            </SelectField>
            <DatePicker hintText="Date" autoOk fullWidth />
            <TimePicker autoOk hintText="Time" minutesStep={5} fullWidth />
            <FontIcon className="material-icons" style={iconStyles}>
              schedule
            </FontIcon>
            <Slider
              defaultValue={75}
              step={5}
              value={this.state.slider}
              min={5}
              max={500}
              onChange={this.handleSlider}
            />
            <p>
              <span>
                {'The value of this slider is: '}
              </span>
              <span>
                {this.state.slider}
              </span>
            </p>
            <SelectField
              multiple
              hintText="Services"
              value={services}
              onChange={this.handleChangeService}
              fullWidth
            >
              {this.menuItems(services)}
            </SelectField>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(s)(Home);
