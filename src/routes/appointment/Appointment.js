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
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Slider from 'material-ui/Slider';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import Snackbar from 'material-ui/Snackbar';
import s from './Appointment.css';

const iconStyles = {
  marginRight: 24,
  verticalAlign: 'middle',
};

class Appointment extends React.Component {

  static propTypes = {
    contact: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        mobile: PropTypes.string.isRequired,
        resourceName: PropTypes.string.isRequired,
      }),
    ).isRequired,
    post: PropTypes.func.isRequired,
    listOfServices: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        service: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired
      })
    )
  };

  componentWillMount() {
    const { contact, name, mobile, startDate, startTime, duration, serviceIds, resourceName, prices, id, discount, additional } = this.props;
    const amount = 0;
    const finalDuration = duration || 0;
    const finalDiscount = discount || 0;
    const finalAdditional = additional || 0;

    this.setState({
      contactDS: contact,
      name,
      mobile,
      startDate,
      startTime,
      serviceIds,
      resourceName,
      prices,
      notify: false,
      appId: id,
      duration: finalDuration,
      discount: finalDiscount,
      additional: finalAdditional,
      totalAmount: this.calculateTotal(serviceIds, finalAdditional, finalDiscount)
    });
  }

  calculateTotal(serviceIds, additional, discount) {
    if (!serviceIds) return 0;
    // console.log(serviceIds);
    const totalServices = serviceIds.reduce((sum, serviceId) => {
      return sum + this.props.mapOfServices[serviceId].price
    }, 0);
    return totalServices + Number(additional) - Number(discount);
  }

  calculateDuration(serviceIds) {
    if (!serviceIds) return 0;
    // console.log(serviceIds);
    const totalServices = serviceIds.reduce((sum, serviceId) => {

      return sum + this.props.mapOfServices[serviceId].duration
    }, 0);
    return totalServices + 5 /* settling in time */ ;
  }

  handleNewRequest = (inputString, index) => this.setState({ index, nameInput: '', mobileInput: '', ...inputString });
  handleServiceChange = (event, index, serviceIds) => { 
    this.setState({ 
      serviceIds, 
      totalAmount: this.calculateTotal(serviceIds, this.state.additional, this.state.discount), 
      duration: this.calculateDuration(serviceIds)
    }) 
  }
  handleSliderChange = (event, value) => this.setState({ duration: value });
  handleDateChange = (something, dateChosen) => this.setState({ startDate: dateChosen });
  handleTimeChange = (something, timeChosen) => this.setState({ startTime: timeChosen });
  handleUpdateName = nameInput => this.setState({ nameInput, resourceName: '' });
  handleUpdateMobile = mobileInput => this.setState({ mobileInput, resourceName: '' });
  handleDiscountChange = (event, newDiscount) => this.setState({ discount: newDiscount, totalAmount: this.calculateTotal(this.state.serviceIds, this.state.additional, newDiscount) });
  handleAdditionalChange = (event, newAdditional) => this.setState({ additional: newAdditional, totalAmount: this.calculateTotal(this.state.serviceIds, newAdditional, this.state.discount) });

  render() {
    return (
      <div className={s.root}>
        {/* <span>{this.state.appId}</span> */}
        <div className={s.container}>
          <AutoComplete
            ref={c => {
              this.nameAC = c;
            }}
            hintText="Type anything"
            dataSource={this.state.contactDS}
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
            dataSource={this.state.contactDS || []}
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
            value={this.state.startDate}
          />
          <TimePicker
            autoOk
            format="24hr"
            hintText="Time"
            minutesStep={5}
            onChange={this.handleTimeChange}
            fullWidth
            value={this.state.startTime}
          />
          <p>
            <FontIcon className="material-icons" style={iconStyles}>
              schedule
            </FontIcon>
            <span>
              {'Duration: '}
            </span>
            <span>
              {this.state.duration}
            </span>
          </p>
          <Slider            
            step={5}
            value={this.state.duration}
            min={0}
            max={500}
            onChange={this.handleSliderChange}
          />
          <p>
            <FontIcon className="material-icons" style={iconStyles}>
              attach_money
            </FontIcon>
            <span>
              {'Total Amount: '}
            </span>
            <span>
              {this.state.totalAmount}
            </span>
          </p>
          <SelectField
            multiple
            hintText="Services"
            value={this.state.serviceIds}
            onChange={this.handleServiceChange}
            fullWidth
          >
            {this.props.listOfServices.map(item =>
              <MenuItem
                key={item.id}
                insetChildren
                checked={
                  this.state.serviceIds && this.state.serviceIds.indexOf(item.id) > -1
                }
                value={item.id}
                primaryText={`${item.service} - ${item.price}`}
              />,
            )}
          </SelectField>
          <TextField
            hintText="Additional"
            floatingLabelText="Additional"
            onChange={this.handleAdditionalChange}
            value={this.state.additional}
            fullWidth={true} />
          <TextField
            hintText="Discount"
            floatingLabelText="Discount"
            onChange={this.handleDiscountChange}
            value={this.state.discount}
            fullWidth={true} />
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
                notify: true,
                name: '',
                duration: 75,
                mobile: '',
                startTime: {},
                startDate: {},
                serviceIds: [],
                discount: 0,
                additional: 0,
                totalAmount: 0,
                nameInput: '',
                mobileInput: '',
                resourceName: '',
              });
              this.nameAC.setState({ searchText: '' });
              this.mobileAC.setState({ searchText: '' });
              setTimeout(() => this.nameAC.focus(), 200);
              setTimeout(() => this.setState({ notify: false }), 2000);
            }}
          />
          <Snackbar
            open={this.state.notify}
            message="Appointment Added"
            bodyStyle={{
              backgroundColor: '#373277',
              paddingBottom: 28,
              paddingTop: 28,
            }}
          />
        </div>
      </div>
    );
  }
}
export default withStyles(s)(Appointment);
