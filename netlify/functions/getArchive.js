// netlify/functions/getArchive.js
export const handler = async (event, context) => {
  const dbUrl = process.env.FIREBASE_DB_URL;   // ili FIREBASE_DATABASE_URL – kako god postaviš varijablu

  if (!dbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Firebase URL nije konfigurisan u Environment Variables." })
    };
  }

  // CORS pre‑flight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  try {
    const base = dbUrl.replace(/\/+$/, "");
    const url = base.endsWith(".json") ? base : `${base}/archive.json`;

    // Netlify‑runtime već ima fetch; fallback na node‑fetch za starije runtimes
    const _fetch = globalThis.fetch ?? (await import("node-fetch")).default;

    const response = await _fetch(url);
    if (!response.ok) {
      const txt = await response.text();
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Firebase returned ${response.status}: ${txt}` })
      };
    }

    const rawData = await response.json();               // { "-Mxyz": {...}, "-Mabc": {...} }

    // Pretvori objekt u niz [{key,…value}]
    const archives = rawData
      ? Object.entries(rawData).map(([key, value]) => ({ key, ...value }))
      : [];

    // Sortiraj po createdAt (najnovije prvo) – opciono
    archives.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ archives })
    };
  } catch (err) {
    console.error("Fetch error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Greška pri preuzimanju: " + (err.message || err) })
    };
  }
};
