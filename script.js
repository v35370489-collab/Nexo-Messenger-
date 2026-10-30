import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1JD0SsvSElrK_Gze018EYDG4IRUSG7R4",
  authDomain: "chatconnect-6cfed.firebaseapp.com",
  databaseURL: "https://chatconnect-6cfed-default-rtdb.firebaseio.com",
  projectId: "chatconnect-6cfed",
  storageBucket: "chatconnect-6cfed.firebasestorage.app",
  messagingSenderId: "336602095160",
  appId: "1:336602095160:web:83de2a99ef934df287d0cd",
  measurementId: "G-9SXPBY96DN"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');

function sendMessage() {
  const user = userInput.value.trim() || 'Аноним';
  const text = messageInput.value.trim();

  if (text !== '') {
    push(messagesRef, {
      user: user,
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

onChildAdded(messagesRef, (data) => {
  const msg = data.val();
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg-item';
  
  msgDiv.innerHTML = `
    <div class="msg-user">${msg.user}</div>
    <div class="msg-text">${msg.text}</div>
  `;
  
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
