// index.js
import { auth, db, emailKey } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  ref, set, update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// If already logged in → go to chat
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "chat.html";
});

// Sign Up
document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  if (!email || !password) return alert("Enter email and password.");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create user profile & email index
    await update(ref(db), {
      [`users/${uid}`]: { email, createdAt: Date.now() },
      [`userEmails/${emailKey(email)}`]: uid
    });

    window.location.href = "chat.html";
  } catch (e) {
    alert(e.message);
  }
});

// Login
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return alert("Enter email and password.");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "chat.html";
  } catch (e) {
    alert(e.message);
  }
});
