// chat.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // redirect if not logged in
  }
});

// Send message
document.getElementById("send-btn").addEventListener("click", () => {
  const msg = document.getElementById("message-input").value;
  if (msg.trim() === "") return;

  const messagesRef = ref(db, "messages");

  push(messagesRef, {
    text: msg,
    user: auth.currentUser.email,
    timestamp: Date.now()
  });

  document.getElementById("message-input").value = "";
});

// Display messages in realtime
const messagesRef = ref(db, "messages");
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  const messagesDiv = document.getElementById("messages");

  const msgEl = document.createElement("div");
  msgEl.textContent = `${data.user}: ${data.text}`;
  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
