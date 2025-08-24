// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ✅ Use your real config. databaseURL is required for Realtime DB.
const firebaseConfig = {
  apiKey: "AIzaSyACjYWmB7j3Z-ydwZZZ-15LdrbL9Oh6tT8",
  authDomain: "mult1-ch4t.firebaseapp.com",
  databaseURL: "https://mult1-ch4t-default-rtdb.firebaseio.com",
  projectId: "mult1-ch4t",
  storageBucket: "mult1-ch4t.appspot.com",
  messagingSenderId: "871582973721",
  appId: "1:871582973721:web:5e2e7dd0c9b238e4e8cf88",
  measurementId: "G-R1V49LGN6N"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Helper to make an email safe as a DB key
export const emailKey = (email) =>
  email.toLowerCase().replaceAll(".", ",").replaceAll("@", "_at_");
