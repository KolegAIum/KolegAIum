// Netlify Serverless Function
// Ovaj fajl ide u: netlify/functions/getArchive.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase config iz Netlify Environment Variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async (req, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // Čitaj arhivu iz Firebase
    const archiveRef = ref(db, 'archive');
    const snapshot = await get(archiveRef);

    if (!snapshot.exists()) {
      return new Response(
        JSON.stringify({ archives: [] }), 
        { status: 200, headers }
      );
    }

    // Konvertuj Firebase podatke u niz
    const archives = [];
    snapshot.forEach(child => {
      archives.push({
        key: child.key,
        ...child.val()
      });
    });

    // Sortiraj po datumu (najnovije prvo)
    archives.sort((a, b) => b.createdAt - a.createdAt);

    return new Response(
      JSON.stringify({ archives }), 
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Firebase error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch archives' }), 
      { status: 500, headers }
    );
  }
};
