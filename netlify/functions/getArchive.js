const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Uzimamo URL iz Netlify podešavanja (Environment Variables)
  const dbUrl = process.env.FIREBASE_DB_URL;

  if (!dbUrl) {
    return { statusCode: 500, body: JSON.stringify({ error: "Database URL missing" }) };
  }

  const url = `${dbUrl}/archive.json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ archives: data })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
