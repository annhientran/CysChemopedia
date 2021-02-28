import _ from "lodash";
import React from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
// import IconLabel from "components/IconLabel";
import GeneAutocomplete from "components/GeneAutocomplete";
import { typeOptions } from "helpers/siteHelper";

const SearchBar = ({ searchTags, searchType, onSelectType, onSubmit }) => {
  const onFieldSubmit = enteredGene => {
    const existingModel = _.find(searchTags, gene => {
      return (
        enteredGene.toUpperCase().indexOf(gene.accession.toUpperCase()) >= 0 &&
        enteredGene.toUpperCase().indexOf(gene.geneSym.toUpperCase()) >= 0
      );
    });

    if (existingModel) onSubmit(existingModel.geneSym);
  };

  const renderTypeButtons = option => {
    return (
      <ToggleButton
        key={`barChart-${option.label}`}
        value={option.value}
        variant="outline-secondary"
        onChange={onSelectType}
      >
        {option.label}
      </ToggleButton>
    );
  };

  return (
    <div
      id="searchBarSelect"
      className="mb-3 mt-3 d-flex justify-content-center"
      width="70%"
    >
      <ToggleButtonGroup
        type="radio"
        name="type"
        onChange={value => onSelectType(value)}
        value={searchType}
      >
        {typeOptions.map(option => renderTypeButtons(option))}
      </ToggleButtonGroup>
      <GeneAutocomplete
        id="sitesSearchInput"
        options={searchTags}
        onSubmit={onFieldSubmit}
        minInputLength={2}
        maxInputLength={10}
        placeholderText="Enter Gene Symbol or Uniprot Accession"
      />
    </div>
  );
};

export default SearchBar;
