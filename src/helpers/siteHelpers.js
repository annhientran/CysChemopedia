import _ from "lodash";
import { csv } from "d3";

const fastaPath = {
  human: "assets/data/mockdata/HumanFasta.csv",
  mouse: "assets/data/mockdata/MouseFasta.csv"
};
const cellPath = {
  human: "assets/data/mockdata/HumanCellData.csv",
  mouse: "assets/data/mockdata/MouseCellData.csv"
};
const compoundListPath = "assets/data/mockdata/Compounds.csv";

function buildFastaDatabase(type) {
  csv(fastaPath[type], value => {
    const reviewed = _.filter(value, ["Status", "reviewed"]);
    const allFastaData = _.sortBy(reviewed, ["Entry", "Gene names (primary)"]);

    return Promise.resolve(allFastaData);
  });
}

function buildCellDatabase(type) {
  csv(cellPath[type], value => {
    const allCellData = _.sortBy(value, ["uniprot_accession", "gene_symbol"]);

    return Promise.resolve(allCellData);
  });
}

function fetchCompoundList() {
  let compoundLabels = {
    human: [],
    mouse: []
  };
  csv(compoundListPath, value => {
    value.forEach(compound =>
      compoundLabels[compound.type].push(compound.name)
    );

    return Promise.resolve(compoundLabels);
  });
}
