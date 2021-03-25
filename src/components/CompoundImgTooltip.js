import React from "react";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import IconLabel from "components/IconLabel";

const CompoundImgTooltip = ({ compound, placement, width, height }) => {

  return (
    <OverlayTrigger
      key={compound}
      placement={placement}
      overlay={
        <Tooltip id={`tooltip-${compound}`}>
          <img
            src={`/images/${compound}.jpg`}
            width={width}
            height={height}
            alt={`${compound}`}
          />
        </Tooltip>
      }
    >
      <Button variant="secondary">
        <a href={`/images/${compound}.jpg`} download>
          <IconLabel
            awesomeIcon="file-image" //"sync"
            label={`Download ${compound} Image`}
          />
        </a>
      </Button>
    </OverlayTrigger>
  );
};

export default CompoundImgTooltip;
