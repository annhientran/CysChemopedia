import React from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import IconLabel from "components/IconLabel";

const ProgramMenu = () => {
  const renderLink = navItem => {
    if (!navItem.url) {
      return (
        <NavDropdown
          title={
            <IconLabel
              awesomeIcon={navItem.awesomeIcon}
              label={navItem.title}
            />
          }
          key={navItem.id}
        >
          {navItem.content.map((el, i) => {
            return (
              <NavDropdown.Item to={el.url} key={`${i}-${el.id}`}>
                <Nav.Link eventKey={el.id}>
                  <IconLabel
                    awesomeIcon={el.awesomeIcon}
                    iconText={el.iconText}
                    label={el.title}
                  />
                </Nav.Link>
              </NavDropdown.Item>
            );
          })}
        </NavDropdown>
      );
    }

    return (
      <Link key={navItem.id} to={navItem.url} className="nav-link">
        <IconLabel awesomeIcon={navItem.awesomeIcon} label={navItem.title} />
      </Link>
    );
  };

  const getNavList = () => {
    const externalLinks = [
      {
        id: "PMD",
        title: "PubMed",
        iconText: "PMD",
        url: "https://pubmed.ncbi.nlm.nih.gov/"
      },
      {
        id: "UN",
        title: "Uniprot",
        iconText: "UN",
        url: "https://www.uniprot.org/"
      },
      {
        id: "PD",
        title: "Protein Databank",
        iconText: "PD",
        url: "http://www.rcsb.org/"
      },
      {
        id: "PS",
        title: "PhosphoSite +",
        iconText: "PS",
        url: "https://www.phosphosite.org/homeAction.action"
      },
      {
        id: "BP",
        title: "BioPlex",
        iconText: "BP",
        url: "https://bioplex.hms.harvard.edu/explorer/index.php"
      }
    ];

    // show just home menu
    const nav = [
      { id: "home", awesomeIcon: "home", title: "Home", url: "/" },
      {
        id: "sites",
        awesomeIcon: "dna",
        title: "Sites",
        url: "/sites/"
      },
      {
        id: "upload",
        awesomeIcon: "upload",
        title: "Upload",
        url: "/download"
      },
      {
        id: "help",
        awesomeIcon: "question",
        title: "Help",
        url: "/help"
      },
      {
        id: "external-link",
        awesomeIcon: "external-link-alt",
        title: "External",
        content: externalLinks
      }
    ];

    return nav;
  };

  return (
    <Nav className="ml-auto">
      {getNavList().map(navItem => renderLink(navItem))}
    </Nav>
  );
};

export default ProgramMenu;
