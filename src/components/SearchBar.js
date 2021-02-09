import React from "react";
import {
  Button,
  // Col,
  Row,
  FormGroup,
  FormControl,
  FormLabel,
  InputGroup,
  InputLabel
} from "react-bootstrap";
import IconLabel from "components/IconLabel";

const SearchBar = ({searchGene, onSubmit}) => {
  const setSearchType = () => {};

  return (
    <div className="mt-3 d-flex justify-content-center">
      {/* <Row> */}
      {/* <div class="input-group-prepend">
          <ul id="searchBarSelect">
            <li value="human" onclick="setSearchType('human');" class="active">
              human
            </li>
            <li value="mouse" onclick="setSearchType('mouse');">
              mouse
            </li>
          </ul>
        </div>
        <div class="input-group">
          <input
            id="sitesSearchInput"
            class="form-control"
            type="text"
            placeholder="Enter Gene Symbol or Uniprot Accession"
            aria-label="Search"
            aria-describedby="searchIcon"
          >
            <div class="input-group-append">
              <button
                class="btn btn-secondary"
                id="sitesSearchSubmit"
                aria-describedby="searchIcon"
                onclick="searchByGene();"
                style="width:150px"
              >
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div> */}
      {/* </Row> */}
      <InputGroup controlId="searchBar" bsSize="small" className="mb-3">
        <FormLabel id="searchBarSelect">
          <Button variant="link">HUMAN</Button>
          <Button variant="link">MOUSE</Button>
        </FormLabel>
        <FormControl
          id="sitesSearchInput"
          placeholder="Enter Gene Symbol or Uniprot Accession"
          aria-label="Search By Gene"
          aria-describedby="searchIcon"
        />
        <InputGroup.Append>
          <Button
            id="sitesSearchSubmit"
            variant="outline-secondary"
            className="btn btn-secondary"
            aria-describedby="searchIcon"
            onClick={() => {onSubmit()}}
          >
            <IconLabel awesomeIcon="search" label="Search" />
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
};

export default SearchBar;
