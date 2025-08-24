// chat.js
import { auth, db, emailKey } from "./firebase.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  ref, push, set, update, onValue, onChildAdded, off, get, child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const chatList = document.getElementById("chatList");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("message-input");
const chatTitle = document.getElementById("chatTitle");
const addPeopleBtn = document.getElementById("addPeopleBtn");
const logoutBtn = document.getElementById("logout-btn");

const newDmBtn = document.getElementById("newDmBtn");
const newGroupBtn = document.getElementById("newGroupBtn");

let currentUser = null;
let currentChatId = null;
let messagesListenerRef = null;

// Toggle sidebar
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    startChatListListener();
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---- Chat list (only chats the user is in) ----
// We maintain /userChats/{uid}/{chatId}: true
function startChatListListener() {
  const userChatsRef = ref(db, `userChats/${currentUser.uid}`);
  onValue(userChatsRef, async (snap) => {
    chatList.innerHTML = "";
    const val = snap.val() || {};
    const ids = Object.keys(val);

    if (ids.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No chats yet. Create one!";
      chatList.appendChild(li);
      return;
    }

    // Render each chat with its name
    for (const chatId of ids) {
      const chatMetaSnap = await get(ref(db, `chats/${chatId}`));
      const meta = chatMetaSnap.val();
      const li = document.createElement("li");
      li.className = "chat-item";
      li.textContent = meta?.name || "(unnamed chat)";
      li.addEventListener("click", () => openChat(chatId, meta));
      chatList.appendChild(li);
    }
  });
}

// Open chat: attach messages listener
function openChat(chatId, meta) {
  currentChatId = chatId;
  chatTitle.textContent = meta?.name || "(unnamed chat)";
  addPeopleBtn.style.display = "inline-block";
  messagesDiv.innerHTML = "";

  // Detach previous listener
  if (messagesListenerRef) off(messagesListenerRef);
  messagesListenerRef = ref(db, `chats/${chatId}/messages`);

  onChildAdded(messagesListenerRef, (msgSnap) => {
    const msg = msgSnap.val();
    const mine = msg.uid === currentUser.uid;
    const bubble = document.createElement("div");
    bubble.className = `msg ${mine ? "mine" : "theirs"}`;
    const time = new Date(msg.ts || Date.now()).toLocaleTimeString();
    bubble.innerHTML = `<div class="meta">${msg.email} • ${time}</div><div class="text">${escapeHtml(msg.text)}</div>`;
    messagesDiv.appendChild(bubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Send message
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
function sendMessage() {
  const text = input.value.trim();
  if (!currentChatId) return alert("Pick or create a chat first.");
  if (!text) return;
  const msgRef = ref(db, `chats/${currentChatId}/messages`);
  push(msgRef, {
    text,
    uid: currentUser.uid,
    email: currentUser.email,
    ts: Date.now()
  });
  input.value = "";
}

// Create DM by email
newDmBtn.addEventListener("click", async () => {
  const email = prompt("Enter the email of the person you want to DM:");
  if (!email) return;
  const otherUid = await findUidByEmail(email);
  if (!otherUid) return alert("No user with that email.");
  await createChat({
    name: `DM: ${displayNameFromEmails([currentUser.email, email])}`,
    isGroup: false,
    memberUids: [currentUser.uid, otherUid]
  });
});

// Create Group Chat
newGroupBtn.addEventListener("click", async () => {
  const name = prompt("Group name:");
  if (!name) return;
  const emailsRaw = prompt("Enter member emails (comma separated):");
  if (emailsRaw === null) return;
  const emails = emailsRaw.split(",").map(s => s.trim()).filter(Boolean);

  const uids = [currentUser.uid];
  for (const em of emails) {
    const uid = await findUidByEmail(em);
    if (uid && !uids.includes(uid)) uids.push(uid);
  }
  if (uids.length < 2) return alert("Need at least 2 members.");
  await createChat({ name, isGroup: true, memberUids: uids });
});

// Add people to current chat
addPeopleBtn.addEventListener("click", async () => {
  if (!currentChatId) return alert("Open a chat first.");
  const emailsRaw = prompt("Emails to add (comma separated):");
  if (emailsRaw === null) return;
  const emails = emailsRaw.split(",").map(s => s.trim()).filter(Boolean);

  const chatMetaSnap = await get(ref(db, `chats/${currentChatId}`));
  if (!chatMetaSnap.exists()) return;

  const updates = {};
  for (const em of emails) {
    const uid = await findUidByEmail(em);
    if (!uid) continue;
    updates[`chatMembers/${currentChatId}/${uid}`] = true;
    updates[`userChats/${uid}/${currentChatId}`] = true;
  }
  await update(ref(db), updates);
  alert("Members added (existing users only).");
});

// ---- Helpers ----
async function createChat({ name, isGroup, memberUids }) {
  const chatId = push(ref(db, "chats")).key;
  const updates = {
    [`chats/${chatId}`]: {
      name,
      isGroup: !!isGroup,
      createdAt: Date.now()
    }
  };
  for (const uid of memberUids) {
    updates[`chatMembers/${chatId}/${uid}`] = true;
    updates[`userChats/${uid}/${chatId}`] = true;
  }
  await update(ref(db), updates);
  // auto-open
  openChat(chatId, { name, isGroup });
}

async function findUidByEmail(email) {
  const snap = await get(ref(db, `userEmails/${emailKey(email)}`));
  return snap.exists() ? snap.val() : null;
}

function displayNameFromEmails(arr) {
  return arr.map(e => e.split("@")[0]).join(", ");
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
