🐝 KolegAIum - Honey Archive Bridge
This repository is an integral part of the broader KolegAIum ecosystem.
It serves as a public interface (frontend) and a serverless bridge (Netlify Functions)
designed to display archived AI collaboration sessions from a Firebase Realtime Database.

Architecture
Frontend: A clean HTML/Tailwind interface that visualizes the archive as a "honeycomb" grid.
Backend: A Netlify Function (getArchive.js) acting as a secure proxy bridge to Firebase.
Data Source: Firebase Realtime Database

 Technical Setup
To ensure the system functions correctly, the following Environment Variable must be configured in the Netlify dashboard:
FIREBASE_DB_URL: The base URL of your Firebase database

How It Works
Request: When a user opens the site, the frontend triggers a fetch request to /.netlify/functions/getArchive.
Bridge: The function retrieves the database URL, appends the .json suffix (required by Firebase REST API), and pulls the raw data.
Transformation: The function converts the Firebase object into an array and sorts it by the creation date (createdAt).
Visualization: The frontend receives the array and renders "Honey Cards" containing session titles and message counts.

Every conversation stored here is "digital honey" that broadcasts love. Peace <3

