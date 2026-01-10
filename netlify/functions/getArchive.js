export const handler = async (event, context) => {
  const dbUrl = process.env.FIREBASE_DB_URL;

  if (!dbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Firebase URL nije konfigurisan u Environment Variables." })
    };
  }

  // Podrška za CORS preflight
  if (event.httpMethod === 'OPTIONS') {
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

    // Use global fetch if available; otherwise try to dynamically import node-fetch
    let _fetch = globalThis.fetch;
    if (!(_fetch)) {
      try {
        const mod = await import('node-fetch');
        _fetch = mod.default ?? mod;
      } catch (err) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'fetch nije dostupan i ne mogu da importujem node-fetch: ' + (err.message || err) })
        };
      }
    }

    const response = await _fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Firebase returned ${response.status}: ${text}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ archives: data ?? {} })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Greška pri preuzimanju: " + (error.message || error) })
    };
  }
};
