import React, { useMemo, useState } from "react";
import HeaderLeft from "./HeaderLeft";
import HeaderCenter from "./HeaderCenter";
import HeaderRight from "./HeaderRight";
import GearList from "./GearList";
import GearEquipper from "./GearEquipper";
import GearPresets from "./GearPresets";

function GearCalculator() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Normalize some slot ids to backend slot keys
  const slotKeyMap = useMemo(
    () => ({
      helmet: "head",
      shoulder: "shoulder",
      back: "back",
      chest: "chest",
      wrist: "wrist",
      hands: "hands",
      waist: "waist",
      legs: "legs",
      feet: "feet",
      earring: "earring",
      earring2: "earring",
      neck: "neck",
      ring: "ring",
      ring2: "ring",
      "primary-weapon": "primary-weapon",
      "ranged-weapon": "ranged-weapon",
      "off-hand": "off-hand",
      "off-hand-secondary": "off-hand",
    }),
    []
  );

  const slotParam = selectedSlot
    ? slotKeyMap[selectedSlot] || selectedSlot
    : "";

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
      <GearList slot={slotParam} selectedSlot={selectedSlot} />
      <GearEquipper onSlotClick={setSelectedSlot} />
      <GearPresets />
      {/* footer will go here */}
    </div>
  );
}

export default GearCalculator;
