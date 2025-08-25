const leftSlots = [
  { id: "helmet", img: "media/head.webp" },
  { id: "shoulder", img: "media/shoulder.webp" },
  { id: "back", img: "media/back.webp" },
  { id: "chest", img: "media/chest.webp" },
  { id: "wrist", img: "media/wrist.webp" },
  { id: "hands", img: "media/hands.webp" },
  { id: "waist", img: "media/waist.webp" },
  { id: "legs", img: "media/legs.webp" },
  { id: "feet", img: "media/feet.webp" },
];

const bottomRowSlots = [
  { id: "primary-weapon", img: "media/primary-weapon.webp" },
  { id: "ranged-weapon", img: "media/ranged-weapon.webp" },
  { id: "off-hand", img: "media/off-hand.webp" },
  { id: "off-hand-secondary", img: "media/off-hand.webp" },
];

const rightSlots = [
  { id: "earring", img: "media/earring.webp" },
  { id: "earring2", img: "media/earring.webp" },
  { id: "neck", img: "media/neck.webp" },
  { id: "ring", img: "media/ring.webp" },
  { id: "ring2", img: "media/ring.webp" },
];

function GearEquipper() {
  return (
    <section className="gear-equipper">
      <div className="left-column">
        {leftSlots.map((slot) => (
          <div className="slot" id={slot.id} key={slot.id}>
            <img src={`${import.meta.env.BASE_URL}${slot.img}`} alt={slot.id} />
          </div>
        ))}
      </div>
      <div className="bottom-row">
        {bottomRowSlots.map((slot) => (
          <div className="slot" id={slot.id} key={slot.id}>
            <img src={`${import.meta.env.BASE_URL}${slot.img}`} alt={slot.id} />
          </div>
        ))}
      </div>
      <div className="right-column">
        {rightSlots.map((slot) => (
          <div className="slot" id={slot.id} key={slot.id}>
            <img src={`${import.meta.env.BASE_URL}${slot.img}`} alt={slot.id} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default GearEquipper;
