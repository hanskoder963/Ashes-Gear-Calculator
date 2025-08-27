import { useEffect, useMemo, useState } from "react";

function GearList({ slot, selectedSlot }) {
  const [search, setSearch] = useState("");
  const effectiveQuery = useMemo(
    () => (search.trim() ? search.trim() : ""),
    [search]
  );

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set("fields", "id,name,rarity");
    params.set("limit", "50");
    if (slot) params.set("slot", slot);
    if (effectiveQuery) params.set("q", effectiveQuery);

    setStatus("loading");
    fetch(`/api/items?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setStatus("done");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slot, effectiveQuery]);

  return (
    <aside className="gear-list">
      <div className="gear-list-box">
        <input
          className="gear-list-search"
          type="text"
          placeholder={`Search... ${
            selectedSlot ? `(slot: ${selectedSlot})` : ""
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {status === "loading" && (
          <p className="gear-list-status">Loading items...</p>
        )}
        {status === "error" && (
          <p className="gear-list-status" style={{ color: "#ffdddd" }}>
            Error: {error}
          </p>
        )}

        {status === "done" && (
          <ul className="gear-list-items">
            {items.map((it) => (
              <li
                className="gear-list-item"
                key={it.id ?? `${it.name}-${Math.random()}`}
              >
                <span className="gear-item-name">{it.name ?? "(no name)"}</span>
                {typeof it.rarity !== "undefined" ? (
                  <span className="gear-item-meta"> · {it.rarity}</span>
                ) : null}
              </li>
            ))}
            {items.length === 0 && <li className="gear-list-item">No items</li>}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default GearList;
