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
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import Snackbar from 'material-ui/Snackbar';
import s from './Home.css';

const listOfServices = [
  'Full Set',
  'Touch Up',
  'Removal',
  'Radiance Facial',
  'Brazilian Waxing',
  'Full Leg Waxing',
  'Half Leg Waxing',
  'Full Arm Waxing',
  'Half Arm Waxing',
  'Under Arm Waxing',
  'Full Face Waxing',
  'Lower Lip Waxing',
  'Eyebrow Threading',
  'Lower Lip Threading',
  'Upper Lip Threading',
  'Full Face Threading',
];

const iconStyles = {
  marginRight: 24,
  verticalAlign: 'middle',
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
    post: PropTypes.func.isRequired,
  };

  state = {
    open: false,
    slider: 75,
  };

  handleNewRequest = (inputString, index) =>
    this.setState({ index, nameInput: '', mobileInput: '', ...inputString });
  handleServiceChange = (event, index, services) => {
    this.setState({ services });
  };
  handleSliderChange = (event, value) => this.setState({ slider: value });
  handleDateChange = (something, dateChosen) => this.setState({ dateChosen });
  handleTimeChange = (something, timeChosen) => this.setState({ timeChosen });
  handleUpdateName = nameInput =>
    this.setState({ nameInput, resourceName: '' });
  handleUpdateMobile = mobileInput =>
    this.setState({ mobileInput, resourceName: '' });

  render() {
    const { services } = this.state;
    // console.log(this.state);
    return (
      <MuiThemeProvider>
        <div className={s.root}>
          <div className={s.container}>
            <AutoComplete
              ref={c => {
                this.nameAC = c;
              }}
              hintText="Type anything"
              dataSource={this.props.contact}
              dataSourceConfig={{ text: 'display', value: 'name' }}
              onNewRequest={this.handleNewRequest}
              onUpdateInput={this.handleUpdateName}
              floatingLabelText="Name"
              filter={AutoComplete.fuzzyFilter}
              fullWidth
              searchText={this.state.name}
            />
            <AutoComplete
              ref={c => {
                this.mobileAC = c;
              }}
              hintText="Type anything"
              dataSource={this.props.contact}
              dataSourceConfig={{ text: 'mobile', value: 'mobile' }}
              onNewRequest={this.handleNewRequest}
              floatingLabelText="Mobile"
              onUpdateInput={this.handleUpdateMobile}
              filter={AutoComplete.fuzzyFilter}
              fullWidth
              searchText={this.state.mobile}
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
              format="24hr"
              hintText="Time"
              minutesStep={5}
              onChange={this.handleTimeChange}
              fullWidth
              value={this.state.timeChosen}
            />
            <p>
              <FontIcon className="material-icons" style={iconStyles}>
                schedule
              </FontIcon>
              <span>
                {'Duration: '}
              </span>
              <span>
                {this.state.slider}
              </span>
            </p>
            <Slider
              defaultValue={75}
              step={5}
              value={this.state.slider}
              min={5}
              max={500}
              onChange={this.handleSliderChange}
            />
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
              ref={c => {
                this.submitBtn = c;
              }}
              label="Create Appointment"
              primary
              fullWidth
              onClick={() => {
                const inputs = Object.assign({}, this.state);
                inputs.mobile = inputs.mobileInput || inputs.mobile;
                inputs.name = inputs.nameInput || inputs.name;

                this.props.post(inputs);
                this.setState({
                  open: true,
                  name: '',
                  duration: 75,
                  mobile: '',
                  timeChosen: {},
                  dateChosen: {},
                  services: [],
                  nameInput: '',
                  mobileInput: '',
                  resourceName: '',
                });
                this.nameAC.setState({ searchText: '' });
                this.mobileAC.setState({ searchText: '' });
                setTimeout(() => this.nameAC.focus(), 200);
                setTimeout(() => this.setState({ open: false }), 2000);
              }}
            />
            <Snackbar
              open={this.state.open}
              message="Appointment Added"
              bodyStyle={{
                backgroundColor: '#373277',
                paddingBottom: 28,
                paddingTop: 28,
              }}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
export default withStyles(s)(Home);
