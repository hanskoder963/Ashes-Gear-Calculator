import { useEffect, useState } from "react";
import "./App.css";
import "./styles/main.css";
import GearCalculator from "./components/GearCalculator";

function ItemsPreview() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "/api/items?fields=id,name,rarity&limit=50";
    setStatus("loading");
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setItems(data.items || []);
        setStatus("done");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("error");
      });
  }, []);

  if (status === "loading") return <p>Loading items...</p>;
  if (status === "error") return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ margin: "1rem 0" }}>
      <h2>Items (first 50: id, name, rarity)</h2>
      <ul
        style={{
          maxHeight: 300,
          overflow: "auto",
          border: "1px solid #333",
          padding: "0.5rem",
        }}
      >
        {items.map((it) => (
          <li key={it.id ?? `${it.name}-${Math.random()}`}>
            <strong>{it.name ?? "(no name)"}</strong>
            {typeof it.rarity !== "undefined"
              ? ` — rarity: ${it.rarity}`
              : null}
            {typeof it.id !== "undefined" ? ` — id: ${it.id}` : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <ItemsPreview />
      <GearCalculator />
    </div>
  );
}
