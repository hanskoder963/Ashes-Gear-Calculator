import React from "react";
import HeaderLeft from "./HeaderLeft";
import HeaderCenter from "./HeaderCenter";
import HeaderRight from "./HeaderRight";
import GearList from "./GearList";
import GearEquipper from "./GearEquipper";

function GearCalculator() {
  return (
    <div className="gear">
      <div className="header-left">
        <HeaderLeft />
      </div>
      <div className="header-center">
        <HeaderCenter />
      </div>
      <div className="header-right">
        <HeaderRight />
      </div>
      <GearList />
      <GearEquipper />
      {/* presets, and footer will go here */}
    </div>
  );
}

export default GearCalculator;
