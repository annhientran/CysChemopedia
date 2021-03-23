import _ from "lodash";
import React, { Component } from "react";
import Select, { Option } from "rc-select";
// import { makeEvent } from "libs/form";
import "styles/rc-select.css";

class GeneAutocomplete extends Component {
  componentDidUpdate(prevProps) {
    const diff = _.difference(this.props.options, prevProps.options);

    if (_.size(diff) > 0) {
      this.setState({ optionsList: this.renderOptions(this.props.options) });
    }
  }

  renderOptions = options => {
    if (!options || !options.length) return [];

    return options.map(type => {
      const { entry, label, geneSym } = type;
      const params = { value: label, entry: entry, geneSym: geneSym };

      return <Option key={label} {...params}>{`Uniprot Accession: ${entry} — Gene: ${geneSym}`}</Option>;
    });
  };

  customFilterOption = (inputValue, option) => {
    const { entry, value } = option.props;

    return entry.includes(inputValue) || value.includes(inputValue);
  };

  sorterByPos = (optA, optB) => {
    const { value } = this.state;
    const posOptA =
      optA.entry.indexOf(value) >= 0
        ? optA.entry.indexOf(value)
        : optA.value.indexOf(value);
    const posOptB =
      optB.entry.indexOf(value) >= 0
        ? optB.entry.indexOf(value)
        : optB.value.indexOf(value);

    return posOptA > posOptB ? 1 : posOptA === posOptB ? 0 : -1;
  };

  onKeyDown = e => {
    if (e.keyCode === 13) this.onSubmitHandler(this.state.value);
  };

  // pre-populate options by default
  state = {
    openBox: false,
    value: "",
    optionsList: this.renderOptions(this.props.options)
  };

  onChangeHandler = value => {
    this.setState({ value: value.toUpperCase() });
    this.onFieldFocus(value);
  };

  onSubmitHandler = (value, option) => {
    this.setState({ value: value });
    this.setState({ openBox: false });
    this.props.onSubmit(value);
  };

  onFieldFocus = value => {
    this.setState({
      openBox:
        value.length > this.props.minInputLength &&
        value.length < this.props.maxInputLength
    });
  };

  render() {
    return (
      <Select
        value={this.state.value}
        // defaultValue="gene"
        // onChange={this.onChangeHandler}
        onSelect={this.onSubmitHandler}
        onSearch={this.onChangeHandler}
        onInputKeyDown={this.onKeyDown}
        // filterOption={this.customFilterOption}
        // filterSort={this.sorterByPos}
        onFocus={() => this.onFieldFocus(this.state.value)}
        onBlur={() => this.setState({ openBox: false })}
        open={this.state.openBox}
        // optionFilterProp="label"
        // optionLabelProp="children"
        placeholder={this.props.placeholderText}
        notFoundContent="No results found"
        filterOption={true}
        // optionLabelProp="label"
        optionFilterProp="value"
        dropdownMenuStyle={{ maxHeight: 200, overflowX: "hidden" }}
        combobox
        backfill={true}
        showSearch
        showArrow
        allowClear
        // {...this.props.customOptions}
      >
        {this.state.optionsList}
      </Select>
    );
  }
}

export default GeneAutocomplete;
