/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
// http://www.material-ui.com/#/components/select-field
import AST from 'auto-sorting-array';
import 'moment-duration-format';
import moment from 'moment';
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
import { Card, CardText } from 'material-ui/Card';
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
    queryPastAppointments: PropTypes.func.isRequired,
    // listOfServices: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     id: PropTypes.string.isRequired,
    //     service: PropTypes.string.isRequired,
    //     price: PropTypes.number.isRequired,
    //     duration: PropTypes.number.isRequired
    //   }).isRequired,
    // ).isRequired,
    services: PropTypes.instanceOf(AST),
    buttonText: PropTypes.string.isRequired,
    name: PropTypes.string,
    mobile: PropTypes.string,
    // startDate: PropTypes.instanceOf(PropTypes.string),
    // startTime: PropTypes.instanceOf(PropTypes.string),
    duration: PropTypes.number,
    serviceIds: PropTypes.arrayOf(PropTypes.string),
    resourceName: PropTypes.string,
    // id: PropTypes.string,
    discount: PropTypes.number,
    additional: PropTypes.number,
    // pastAppointments: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     id: PropTypes.string,
    //   }),
    // ),
    // mapOfServices: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     price: PropTypes.number,
    //     duration: PropTypes.number,
    //   }),
    // ),
    successMessage: PropTypes.string,
    errorMessage: PropTypes.string,
    // startDate: PropTypes.string.isRequired,
    // startTime: PropTypes.string.isRequired,
    // id: PropTypes.string,
  };
  static defaultProps = {
    successMessage: '',
    errorMessage: '',
    name: '',
    mobile: '',
    duration: 0,
    serviceIds: [],
    resourceName: '',
    id: 0,
    discount: 0,
    additional: 0,
    pastAppointments: {},
    services: {},
    // mapOfServices: {},
  };

  componentWillMount() {
    const {
      contact,
      name,
      mobile,
      startDate,
      startTime,
      duration,
      serviceIds,
      resourceName,
      id,
      discount,
      additional,
      pastAppointments,
    } = this.props;
    const finalDuration = duration || 0;
    const finalDiscount = discount || 0;
    const finalAdditional = additional || 0;

    // console.log(`componentWillMount expanded=${pastAppointments && pastAppointments.length > 0}`);
    // console.log(`pastAppointments=${JSON.stringify(pastAppointments)}`);
    this.setState({
      contactDS: contact,
      name,
      mobile,
      startDate,
      startTime,
      serviceIds,
      resourceName,
      pastAppointments,
      notify: false,
      appId: id,
      duration: finalDuration,
      discount: finalDiscount,
      additional: finalAdditional,
      totalAmount: this.calculateTotal(
        serviceIds,
        finalAdditional,
        finalDiscount,
      ),
      error: false,
      expanded: pastAppointments && pastAppointments.length > 0,
    });
  }

  calculateTotal(serviceIds, additional, discount) {
    if (!serviceIds) return 0;
    const totalServices = serviceIds.reduce(
      (sum, serviceId) => sum + this.props.services.peekByKey(serviceId).price,
      0,
    );
    return totalServices + Number(additional) - Number(discount);
  }

  calculateDuration(serviceIds) {
    if (!serviceIds) return 0;
    const totalServices = serviceIds.reduce(
      (sum, serviceId) =>
        sum + this.props.services.peekByKey(serviceId).duration,
      0,
    );
    return totalServices + 5 /* settling in time */;
  }

  handleNewRequest = async (inputString, index) => {
    // console.log(`handleNewRequest=${JSON.stringify(inputString)}`);

    const { resourceName } = inputString;
    // console.log(`resourceName=${resourceName}`);
    const appointments = await this.props.queryPastAppointments(resourceName);
    // console.log(`appointments=${JSON.stringify(appointments)}`);
    // console.log(`expanded=${appointments && appointments.length > 0}`);
    this.setState({
      index,
      nameInput: '',
      mobileInput: '',
      expanded: appointments && appointments.length > 0,
      pastAppointments: appointments,
      ...inputString,
    });
  };
  handleServiceChange = (event, index, serviceIds) => {
    this.setState({
      serviceIds,
      totalAmount: this.calculateTotal(
        serviceIds,
        this.state.additional,
        this.state.discount,
      ),
      duration: this.calculateDuration(serviceIds),
    });
  };
  handleSliderChange = (event, value) => this.setState({ duration: value });
  handleDateChange = (something, dateChosen) =>
    this.setState({ startDate: dateChosen });
  handleTimeChange = (something, timeChosen) =>
    this.setState({ startTime: timeChosen });
  handleUpdateName = nameInput => {
    this.setState({ nameInput, resourceName: '' });
  };
  handleExpandChange = expanded => {
    this.setState({ expanded });
  };
  handleUpdateMobile = mobileInput =>
    this.setState({ mobileInput, resourceName: '' });
  handleDiscountChange = (event, newDiscount) =>
    this.setState({
      discount: newDiscount,
      totalAmount: this.calculateTotal(
        this.state.serviceIds,
        this.state.additional,
        newDiscount,
      ),
    });
  handleAdditionalChange = (event, newAdditional) =>
    this.setState({
      additional: newAdditional,
      totalAmount: this.calculateTotal(
        this.state.serviceIds,
        newAdditional,
        this.state.discount,
      ),
    });
  handleCloseCard = () => {
    this.setState({ expanded: false });
  };

  renderPastAppointments = () => {
    if (this.state.pastAppointments && this.state.pastAppointments.length > 0) {
      const pastAppointments = this.state.pastAppointments.reduce(
        (array, appt) => {
          if (appt === undefined) return array;
          // console.log(appt.transaction.items.reduce((array, item) => { return array[0] = String(item.name) }, []));
          const services =
            appt.transaction && appt.transaction.items
              ? appt.transaction.items.reduce((serviceArray, item) => {
                  serviceArray.push(item.name);
                  return serviceArray;
                }, [])
              : [];
          if (services.length > 0) {
            array.push(
              React.createElement(
                'div',
                { key: `pastAppt${array.length}` },
                `${moment(appt.event.start).format(
                  'DD MMM YY - HH:mm',
                )} - ${services.join(', ')}`,
              ),
            );
          }

          return array;
        },
        [],
      );
      if (pastAppointments.length > 0) {
        return (
          <div>
            {pastAppointments}
          </div>
        );
      }
      return ['No Past Appointments'];
    }
    return ['No Past Appointments'];
  };

  render() {
    return (
      <div
        className={s.root}
        ref={c => {
          this.rootComponent = c;
        }}
      >
        <div className={s.container}>
          <Card
            expanded={this.state.expanded}
            onExpandChange={this.handleExpandChange}
          >
            <CardText expandable>
              {this.renderPastAppointments()}
            </CardText>
          </Card>
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
              attach_money
            </FontIcon>
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
            {this.props.services
              .getArray()
              .map(item =>
                <MenuItem
                  key={item.id}
                  insetChildren
                  checked={
                    this.state.serviceIds &&
                    this.state.serviceIds.indexOf(item.id) > -1
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
            fullWidth
          />
          <TextField
            hintText="Discount"
            floatingLabelText="Discount"
            onChange={this.handleDiscountChange}
            value={this.state.discount}
            fullWidth
          />
          <p>
            <FontIcon className="material-icons" style={iconStyles}>
              schedule
            </FontIcon>
            <span>
              {moment
                .duration(this.state.duration, 'minutes')
                .format('h [hrs], m [min]')}
            </span>
          </p>
          <Slider
            step={5}
            value={this.state.duration}
            min={0}
            max={500}
            onChange={this.handleSliderChange}
          />
          <RaisedButton
            ref={c => {
              this.submitBtn = c;
            }}
            label={this.props.buttonText}
            primary
            fullWidth
            onClick={async () => {
              const inputs = Object.assign({}, this.state);
              delete inputs.contactDS;
              delete inputs.pastAppointments;

              inputs.mobile = inputs.mobileInput || inputs.mobile;
              inputs.name = inputs.nameInput || inputs.name;

              this.props.showLoading();
              this.setState({
                error: false,
              });
              const results = await this.props.post(inputs);
              this.props.hideLoading();

              this.setState({
                notify: true,
              });

              if (results.errors) {
                this.setState({ error: 'Error In Creating Appointment' });
                console.error('Error In Creating Appointment');
              } else {
                this.setState({
                  name: '',
                  duration: 0,
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
                  pastAppointments: [],
                });

                this.nameAC.setState({ searchText: '' });
                this.mobileAC.setState({ searchText: '' });
                setTimeout(() => this.nameAC.focus(), 200);
              }
              setTimeout(() => this.setState({ notify: false }), 2000);
            }}
          />
          <Snackbar
            open={this.state.notify}
            message={
              this.state.error
                ? this.props.errorMessage
                : this.props.successMessage
            }
            bodyStyle={{
              backgroundColor: this.state.error ? '#ce1818' : '#373277',
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
