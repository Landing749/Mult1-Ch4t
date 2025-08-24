// firebase.js

// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase configuration (from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyACjYWmB7j3Z-ydwZZZ-15LdrbL9Oh6tT8",
  authDomain: "mult1-ch4t.firebaseapp.com",
  databaseURL: "https://mult1-ch4t-default-rtdb.firebaseio.com", // ✅ Added for Realtime DB
  projectId: "mult1-ch4t",
  storageBucket: "mult1-ch4t.appspot.com",
  messagingSenderId: "871582973721",
  appId: "1:871582973721:web:5e2e7dd0c9b238e4e8cf88",
  measurementId: "G-R1V49LGN6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so other files can use them
export const auth = getAuth(app);
export const db = getDatabase(app);
