// scripts/dump_ashescodex.mjs
import fs from "node:fs/promises";
import path from "node:path";

const API_URL = "https://api.ashescodex.com/items";
const PER_PAGE = 100;
const DATA_DIR = path.resolve("data");
const OUTPUT_FILE = path.join(DATA_DIR, "ashescodex_items.json");
const TEMP_FILE = path.join(DATA_DIR, "ashescodex_items.tmp.json");

const MAX_BACKOFF_MS = 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseRetryAfter(header) {
  if (!header) return 0;
  const asInt = Number(header);
  if (!Number.isNaN(asInt)) return Math.max(0, asInt) * 1000;
  const asDate = Date.parse(header);
  if (!Number.isNaN(asDate)) {
    const diff = asDate - Date.now();
    return Math.max(0, diff);
  }
  return 0;
}

async function safeWriteJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(TEMP_FILE, json, "utf8");
  await fs.rename(TEMP_FILE, filePath);
}

async function fetchPage(page, attempt = 0) {
  const url = `${API_URL}?per_page=${PER_PAGE}&page=${page}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (res.status === 429) {
    const retryAfter = parseRetryAfter(res.headers.get("retry-after")) || 5000;
    console.log(
      `429 rate limited. Waiting ${Math.round(
        retryAfter / 1000
      )}s then retrying page ${page}...`
    );
    await sleep(retryAfter);
    return fetchPage(page, attempt);
  }

  if (!res.ok) {
    if (res.status >= 500 && attempt < 5) {
      const backoff = Math.min(2 ** attempt * 1000, MAX_BACKOFF_MS);
      console.log(
        `HTTP ${res.status} for page ${page}. Retrying in ${Math.round(
          backoff / 1000
        )}s...`
      );
      await sleep(backoff);
      return fetchPage(page, attempt + 1);
    }
    throw new Error(
      `Failed to fetch page ${page}: ${res.status} ${res.statusText}`
    );
  }

  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  let existing = [];
  try {
    const buf = await fs.readFile(OUTPUT_FILE, "utf8");
    existing = JSON.parse(buf);
    if (!Array.isArray(existing)) existing = [];
  } catch {
    // no-op
  }

  const byId = new Map();
  for (const it of existing) {
    if (it && typeof it === "object" && "id" in it) byId.set(it.id, it);
  }

  let page = Math.floor(existing.length / PER_PAGE) + 1;
  if (page < 1) page = 1;

  console.log(
    `Starting dump. Resuming at page ${page}. Already have ${byId.size} items.`
  );

  let totalNew = 0;
  while (true) {
    const items = await fetchPage(page);
    if (!items || items.length === 0) {
      console.log(`No items on page ${page}. Assuming end of pagination.`);
      break;
    }

    let addedThisPage = 0;
    for (const it of items) {
      const key =
        it && typeof it === "object" && "id" in it
          ? it.id
          : `${page}:${addedThisPage}:${Math.random()}`;
      if (!byId.has(key)) {
        byId.set(key, it);
        addedThisPage++;
      }
    }

    totalNew += addedThisPage;
    console.log(
      `Page ${page}: fetched ${items.length}, added ${addedThisPage}. Total=${byId.size}`
    );

    if (page % 5 === 0) {
      await safeWriteJson(OUTPUT_FILE, Array.from(byId.values()));
      console.log(`Progress saved (${byId.size} items).`);
    }

    if (addedThisPage === 0 && items.length < PER_PAGE) {
      console.log(`Zero new and short page. Ending.`);
      break;
    }

    page++;
  }

  await safeWriteJson(OUTPUT_FILE, Array.from(byId.values()));
  console.log(
    `Done. Wrote ${byId.size} total items to ${OUTPUT_FILE}. New this run: ${totalNew}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
