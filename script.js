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

// Переключение тем (Светлая / Тёмная)
const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggleBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
});

// Навигация и вкладки
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Открытие / закрытие чата
const chatList = document.getElementById('chatList');
const chatRoom = document.getElementById('chatRoom');
const backBtn = document.getElementById('backBtn');

chatList.addEventListener('click', () => {
  chatRoom.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
  chatRoom.classList.add('hidden');
});

// Чат и Firebase
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');

function sendMessage() {
  const user = userInput.value.trim() || 'Аноним';
  const text = messageInput.value.trim();

  if (text !== '') {
    // Если имя содержит [v] или специальный флаг — даем галочку верификации
    const isVerified = user.toLowerCase().includes('nexo') || user.toLowerCase().includes('admin') || user.includes('✔');

    push(messagesRef, {
      user: user,
      text: text,
      verified: isVerified,
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
  
  const verifiedBadge = msg.verified ? ' <span class="verified-badge">✔</span>' : '';
  
  msgDiv.innerHTML = `
    <div class="msg-user">${msg.user}${verifiedBadge}</div>
    <div class="msg-text">${msg.text}</div>
  `;
  
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
