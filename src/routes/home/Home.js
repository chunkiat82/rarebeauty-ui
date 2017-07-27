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
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import s from './Home.css';

const listOfServices = [
  'Full Set',
  'Touch Up',
  'Facial',
  'Full Leg Waxing',
  'Half Leg Waxing',
  'Full Arm Waxing',
  'Half Arm Waxing',
  'Under Arm Waxing',
  'Full Face Waxing',
];

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
    post: PropTypes.function.isRequired,
  };

  state = {
    slider: 75,
  };

  handleNewRequest = (inputString, index) => {
    this.setState({ index, ...inputString });
  };

  handleServiceChange = (event, index, services) => this.setState({ services });

  handleSliderChange = (event, value) => {
    this.setState({ slider: value });
  };

  handleDateChange = (something, dateChosen) => this.setState({ dateChosen });
  handleTimeChange = (something, timeChosen) => this.setState({ timeChosen });

  render() {
    const { services } = this.state;
    return (
      <MuiThemeProvider>
        <div className={s.root}>
          <div className={s.container}>
            <AutoComplete
              hintText="Type anything"
              dataSource={this.props.contact}
              dataSourceConfig={{ text: 'name', value: 'name' }}
              onUpdateInput={this.handleNameChange}
              onNewRequest={this.handleNewRequest}
              floatingLabelText="Name"
              filter={AutoComplete.fuzzyFilter}
              fullWidth
            />
            <DatePicker
              hintText="Date"
              autoOk
              fullWidth
              onChange={this.handleDateChange}
              value={this.state.dateChosen}
            />
            <TimePicker
              autoOk
              hintText="Time"
              minutesStep={5}
              onChange={this.handleTimeChange}
              fullWidth
              value={this.state.timeChosen}
            />
            <FontIcon className="material-icons" style={iconStyles}>
              schedule
            </FontIcon>
            <Slider
              defaultValue={75}
              step={5}
              value={this.state.slider}
              min={5}
              max={500}
              onChange={this.handleSliderChange}
            />
            <p>
              <span>
                {'Duration: '}
              </span>
              <span>
                {this.state.slider}
              </span>
            </p>
            <SelectField
              multiple
              hintText="Services"
              value={services}
              onChange={this.handleServiceChange}
              fullWidth
            >
              {listOfServices.map(name =>
                <MenuItem
                  key={name}
                  insetChildren
                  checked={
                    this.state.services &&
                    this.state.services.indexOf(name) > -1
                  }
                  value={name}
                  primaryText={name}
                />,
              )}
            </SelectField>
            <RaisedButton
              label="Create Appointment"
              primary
              fullWidth
              onClick={() => this.props.post(this.state)}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(s)(Home);
