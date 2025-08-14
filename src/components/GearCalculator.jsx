import React from "react";
import GearHeader from "./GearHeader";
import GearList from "./GearList";
import GearEquipper from "./GearEquipper";

function GearCalculator() {
  return (
    <div className="gear">
      <GearHeader />
      <GearList />
      <GearEquipper />
      {/* presets, and footer will go here */}
    </div>
  );
}

export default GearCalculator;
