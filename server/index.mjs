// server/index.mjs
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const DATA_FILE = path.resolve("data", "ashescodex_items.json");

const app = express();

let DATA = [];
let READY = false;

async function loadData() {
  try {
    const buf = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(buf);
    if (Array.isArray(parsed)) {
      DATA = parsed;
      READY = true;
      console.log(`Loaded ${DATA.length} items from ${DATA_FILE}`);
    } else {
      throw new Error("Data file is not an array");
    }
  } catch (e) {
    READY = false;
    console.warn(`Could not load ${DATA_FILE}. Run "npm run dump:ashes".`);
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, datasetLoaded: READY, count: DATA.length });
});

app.get("/api/items", (req, res) => {
  if (!READY) {
    return res
      .status(503)
      .json({ error: 'Dataset not loaded. Run "npm run dump:ashes" first.' });
  }

  const q = (req.query.q || "").toString().toLowerCase().trim();
  const slotParam = (req.query.slot || "").toString().toLowerCase().trim();
  const fieldsParam = (req.query.fields || "").toString().trim();
  const limitParam = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 500)
    : 50;

  // Slot filtering (more precise than q)
  const aliasMap = {
    head: ["Head", "Helmet", "Helm"],
    shoulder: ["Shoulder", "Shoulders"],
    back: ["Back", "Cape", "Cloak"],
    chest: ["Chest", "Torso", "Body"],
    wrist: ["Wrist", "Wrists"],
    hands: ["Hands", "Gloves"],
    waist: ["Waist", "Belt"],
    legs: ["Legs", "Pants"],
    feet: ["Feet", "Boots"],
    neck: ["Neck", "Necklace", "Amulet"],
    ring: ["Ring", "Finger"],
    earring: ["Earring", "Earrings"],
    // weapons can be extended later if needed
    "primary-weapon": ["Primary", "MainHand", "Weapon"],
    "ranged-weapon": ["Ranged", "Bow", "Wand"],
    "off-hand": ["OffHand", "Shield", "Tome"],
  };

  const hasSlot = (item, slotKey) => {
    if (!item || typeof item !== "object") return false;
    if (!slotKey) return true;
    const aliases = aliasMap[slotKey] || [slotKey];

    // equipSlots check
    const equip = Array.isArray(item.equipSlots) ? item.equipSlots : [];
    const equipLc = equip.map((s) => s && s.toString().toLowerCase());
    for (const a of aliases) {
      const aLc = a.toLowerCase();
      if (equipLc.includes(aLc)) return true;
    }

    // gameplayTags check (prefer slot.* tags)
    const tags = item.gameplayTags?.gameplayTags || [];
    const tagNamesLc = tags.map((t) => t?.tagName?.toString().toLowerCase());
    for (const a of aliases) {
      const cap = a.charAt(0).toUpperCase() + a.slice(1);
      const candidates = [
        `slot.${a.toLowerCase()}`,
        `slot.${cap.toLowerCase()}`,
        `slot.${cap}`.toLowerCase(),
      ];
      if (tagNamesLc.some((t) => candidates.includes(t))) return true;
    }

    // displayIcon path heuristic
    const icon = item.displayIcon?.toString().toLowerCase();
    if (icon) {
      for (const a of aliases) {
        const needle = `/${a.toLowerCase()}/`;
        if (icon.includes(needle)) return true;
      }
    }

    return false;
  };

  // Start from full dataset then apply filters in order: slot -> q -> fields -> limit
  let filtered = DATA;
  if (slotParam) {
    filtered = filtered.filter((item) => hasSlot(item, slotParam));
  }

  // Filter by q (search common string fields; fallback: any string field)
  if (q) {
    filtered = filtered.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const keys = ["name", "description", "type", "rarity", "category"];
      for (const k of keys) {
        const v = item[k];
        if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
      }
      // Fallback: scan any string field
      for (const v of Object.values(item)) {
        if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  // Select fields
  let selected = filtered;
  let fields = null;
  if (fieldsParam) {
    fields = fieldsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    selected = filtered.map((item) => {
      const out = {};
      for (const f of fields) {
        if (f in item) out[f] = item[f];
      }
      return out;
    });
  }

  res.json({
    items: selected.slice(0, limit),
    meta: {
      total: selected.length,
      limit,
      q: q || null,
      slot: slotParam || null,
      fields: fields || null,
    },
  });
});

app.listen(PORT, async () => {
  await loadData();
  console.log(`API listening on http://localhost:${PORT}`);
});
