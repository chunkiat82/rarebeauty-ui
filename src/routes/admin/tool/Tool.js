/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable prettier/prettier */
import React from "react";
import PropTypes from "prop-types";
import withStyles from "isomorphic-style-loader/lib/withStyles";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import Toggle from "material-ui/Toggle";
import moment from "moment";

import s from "./Tool.css";

const styles = {
  // root: {
  //   display: "-webkit-flex",
  //   // display: '-webkit-flex',
  //   // display: '-webkit-box',
  //   // display: '-ms-flexbox',
  //   flexWrap: "wrap",
  //   justifyContent: "flex-start"
  // },
  // rootFlex: {
  //   display: "-webkit-flex",
  //   flexWrap: "wrap",
  //   justifyContent: "flex-start"
  // },
  gridList: {
    width: 500,
    height: 300,
    overflowY: "auto"
  },
  white: {
    color: "white"
  },
  chip: {
    margin: 4
  },
  wrapper: {
    display: "flex",
    flexWrap: "wrap"
  },
  toggle: {
    margin: "10px 5px",
    width: 50,
    float: "right",
    clear: "both",
  }
};

const DEFAULT_TOGGLE_STATE = false;

function selectRowColour(value) {
  // #007bff - blue AM
  // #dc3545 - red Noon
  // #28a745 - green PM
  if (value.amp === "A") return "rgb(0, 123, 255, 0.5)";
  if (value.amp === "M") return "rgb(220, 53, 69, 0.5)";
  return "rgb(40, 167, 69, 0.5)";
}

class Home extends React.Component {
  static propTypes = {
    rows: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { filterA: false, filterM: false, filterP: false };
  }

  rows(values) {
    const filters = [];
    if (this.state.filterA) filters.push('A');
    if (this.state.filterM) filters.push('M');
    if (this.state.filterP) filters.push('P');    

    let timeFilter = this.state.number30FilterP || 0;
    timeFilter = this.state.number60FilterP || timeFilter;

    return values
    .filter(value => value.durationInMinutes >= timeFilter)
      .filter(value => {
        if (filters.length === 0) return true;
        const tempStart = moment(value.start);
        const tempEnd = moment(value.end);       
        // console.log(`filters`, filters);
        for (let i = 0; i < filters.length; i += 1) {
          // console.log(`tempEnd`, tempEnd);
          if (filters[i] === 'A' ){
            if (tempStart.isBetween(moment(tempStart).hours(10).minutes(30).seconds(0), moment(tempStart).hours(12).minutes(0).seconds(0), null, '[]') ||
            tempEnd.isBetween(moment(tempStart).hours(10).minutes(30).seconds(0), moment(tempStart).hours(12).minutes(0).seconds(0), null, '[]'))
            return true;
            
          }           
          if (filters[i] === 'M' ){
            if (tempStart.isBetween(moment(tempStart).hours(12).minutes(0).seconds(0), moment(tempStart).hours(17).minutes(0).seconds(0), null, '[]') ||
            tempEnd.isBetween(moment(tempStart).hours(12).minutes(0).seconds(0), moment(tempStart).hours(17).minutes(0).seconds(0), null, '(]'))
            return true;
            if (tempStart.hours() < 12 && tempEnd.hours() > 17) return true;
          } 
          if (filters[i] === 'P' ){
            if (tempStart.isBetween(moment(tempStart).hours(17).minutes(0).seconds(0), moment(tempStart).hours(21).minutes(0).seconds(0), null, '[]') ||
            tempEnd.isBetween(moment(tempStart).hours(17).minutes(0).seconds(0), moment(tempStart).hours(21).minutes(0).seconds(0), null, '(]'))
            return true;
          } 
        }
        return false;
      })      
      .map((value, index) => (
        <TableRow
          style={{ backgroundColor: selectRowColour(value), zIndex: -1 }}
          key={index}
        >
          <TableRowColumn style={{ color: "black", zIndex: 1000 }}>
            {`${moment(value.start).format("DD/MM/YY (ddd)")}`}
            <br />
            {moment(value.start).format("h:mm A")}
            <br />
            {`${moment(value.end).format("h:mm A")} `}
          </TableRowColumn>
          <TableRowColumn style={{ color: "black", zIndex: 1000 }}>
            {`${value.durationInMinutes} Minutes`}
          </TableRowColumn>
        </TableRow>
      ));
  }

  render() {
    return (
      <div style={styles.root}>
        <Table>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>
                <Toggle
                  label="Morning <12pm"
                  defaultToggled={DEFAULT_TOGGLE_STATE}
                  style={styles.toggle}
                  thumbStyle={{ backgroundColor: "rgb(0, 123, 255, 0.4)" }}
                  trackStyle={{ backgroundColor: "rgb(0, 123, 255, 0.4)" }}
                  thumbSwitchedStyle={{
                    backgroundColor: "rgb(0, 123, 255, 0.8)"
                  }}
                  trackSwitchedStyle={{
                    backgroundColor: "rgb(0, 123, 255, 0.8)"
                  }}
                  onToggle={(_, checked) => {
                    this.setState({ filterA: checked });
                  }}
                />

                <Toggle
                  label="Afternoon >12pm <5pm"
                  defaultToggled={DEFAULT_TOGGLE_STATE}
                  style={styles.toggle}
                  thumbStyle={{ backgroundColor: "rgb(220, 53, 69, 0.4)" }}
                  trackStyle={{ backgroundColor: "rgb(220, 53, 69, 0.4)" }}
                  thumbSwitchedStyle={{
                    backgroundColor: "rgb(220, 53, 69, 0.8)"
                  }}
                  trackSwitchedStyle={{
                    backgroundColor: "rgb(220, 53, 69, 0.8)"
                  }}
                  onToggle={(_, checked) => {
                    this.setState({ filterM: checked });
                  }}
                />
                <Toggle
                  label="Evening >=5pm"
                  defaultToggled={DEFAULT_TOGGLE_STATE}
                  style={styles.toggle}
                  thumbStyle={{ backgroundColor: "rgb(40, 167, 69, 0.4)" }}
                  trackStyle={{ backgroundColor: "rgb(40, 167, 69, 0.4)" }}
                  thumbSwitchedStyle={{
                    backgroundColor: "rgb(40, 167, 69, 0.8)"
                  }}
                  trackSwitchedStyle={{
                    backgroundColor: "rgb(40, 167, 69, 0.8)"
                  }}
                  onToggle={(_, checked) => {
                    this.setState({ filterP: checked });
                  }}
                />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Toggle
                  label=">30Min"
                  defaultToggled={DEFAULT_TOGGLE_STATE}
                  style={styles.toggle}
                  thumbStyle={{ backgroundColor: "rgb(191,74,168, 0.4)" }}
                  trackStyle={{ backgroundColor: "rgb(191,74,168, 0.4)" }}
                  thumbSwitchedStyle={{
                    backgroundColor: "rgb(191,74,168, 0.8)"
                  }}
                  trackSwitchedStyle={{
                    backgroundColor: "rgb(191,74,168, 0.8)"
                  }}
                  onToggle={(_, checked) => {
                    this.setState({ number30FilterP: checked ? 30 : 0 });
                  }}
                />
                <Toggle
                  label=">60Min"
                  defaultToggled={DEFAULT_TOGGLE_STATE}
                  style={styles.toggle}
                  thumbStyle={{ backgroundColor: "rgb(247, 136, 47, 0.4)" }}
                  trackStyle={{ backgroundColor: "rgb(247, 136, 47, 0.4)" }}
                  thumbSwitchedStyle={{
                    backgroundColor: "rgb(247, 136, 47, 0.8)"
                  }}
                  trackSwitchedStyle={{
                    backgroundColor: "rgb(247, 136, 47, 0.8)"
                  }}
                  onToggle={(_, checked) => {
                    this.setState({ number60FilterP: checked ? 60 : 0 });
                  }}
                />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.rows(this.props.rows, this.state.filter)}
          </TableBody>
        </Table>
      </div>
    );
  }
}
export default withStyles(s)(Home);
