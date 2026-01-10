import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.FIREBASE_DATABASE_URL,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",          // ili tvoj domen
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // CORS pre‑flight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const snap = await get(ref(db, "archive"));
    if (!snap.exists()) {
      return new Response(JSON.stringify({ archives: [] }), {
        status: 200,
        headers
      });
    }

    const archives = [];
    snap.forEach(child => archives.push({ key: child.key, ...child.val() }));
    archives.sort((a, b) => b.createdAt - a.createdAt);

    return new Response(JSON.stringify({ archives }), {
      status: 200,
      headers
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Failed to fetch archives" }),
      { status: 500, headers }
    );
  }
};
