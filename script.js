/* ===== 1. Firebase config — подключение к твоему проекту chatconnect-6cfed ===== */
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

// Проверка работы Firebase
const DEMO = firebaseConfig.apiKey.startsWith("YOUR") || typeof firebase === "undefined";
const db = DEMO ? null : (firebase.initializeApp(firebaseConfig), firebase.database());

/* ===== Утилиты ===== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = ts => ts ? new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '';

/* ===== Верификация: флаг verified или "Admin"/"Nexo" в имени ===== */
const VER = '<svg class="vb" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2f9bff"/><path d="M7 12.5l3.3 3.3L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const isVer = o => !!o.verified || /admin|nexo/i.test(o.name || '');
const nameHtml = o => esc(o.name) + (isVer(o) ? VER : '');

/* ===== Данные чатов ===== */
const CHATS = [
  { id: 'nexo', name: 'Nexo Official', type: 'channel', hello: 'Добро пожаловать в Nexo! 🚀' },
  { id: 'support', name: 'Admin Support', type: 'private', hello: 'Здравствуйте! Чем можем помочь?' },
  { id: 'general', name: 'Общий чат', type: 'group', hello: 'Пишите сюда всё, что хотите 💬' },
  { id: 'anna', name: 'Анна', type: 'private', hello: 'Привет! Как дела?' },
  { id: 'dev', name: 'Dev Team', type: 'group', hello: 'Релиз в пятницу 🔥' },
  { id: 'news', name: 'Новости', type: 'channel', hello: 'Свежие новости каждый день' }
];

let uid = localStorage.getItem('uid') || (localStorage.setItem('uid', uid = 'u' + Math.random().toString(36).slice(2, 10)), uid);
let me = load('me', { name: 'Гость' + Math.floor(Math.random() * 900 + 100), status: 'На связи', avatar: '' });
let tab = 'all', cur = null;
const cache = {};

/* ===== Аватарки ===== */
function av(name, img, cls = '') {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360;
  return img
    ? `<div class="av ${cls}" style="background-image:url(${img})"></div>`
    : `<div class="av ${cls}" style="background:linear-gradient(135deg,hsl(${h} 75% 60%),hsl(${(h + 40) % 360} 75% 45%))">${esc((name.trim()[0] || '?').toUpperCase())}</div>`;
}

/* ===== Сообщения: приём ===== */
function onMsg(chatId, key, m) {
  const box = cache[chatId] || (cache[chatId] = new Map());
  if (box.has(key)) return;
  box.set(key, m);
  if (cur === chatId) addBubble(m);
  renderLists();
}
const lastOf = id => { const c = cache[id]; return c && c.size ? [...c.values()].sort((a, b) => a.ts - b.ts).pop() : null };

if (DEMO) {
  CHATS.forEach(c => {
    onMsg(c.id, 'seed', { name: c.name, uid: 'bot', text: c.hello, ts: Date.now() - 36e5 });
    load('msgs_' + c.id, []).forEach(m => onMsg(c.id, m.key, m));
  });
  window.addEventListener('storage', e => {
    if (e.key && e.key.startsWith('msgs_')) load(e.key, []).forEach(m => onMsg(e.key.slice(5), m.key, m));
  });
} else {
  CHATS.forEach(c => db.ref('chats/' + c.id + '/messages').limitToLast(100)
    .on('child_added', s => onMsg(c.id, s.key, s.val())));
}

/* ===== Сообщения: отправка (кнопка и Enter) ===== */
function send() {
  const text = $('#input').value.trim();
  if (!text || !cur) return;
  $('#input').value = '';
  const m = { uid, name: me.name, text: text.slice(0, 2000), ts: Date.now() };
  if (DEMO) {
    const key = Date.now() + '_' + uid, arr = load('msgs_' + cur, []);
    arr.push({ ...m, key }); save('msgs_' + cur, arr); onMsg(cur, key, m);
  } else {
    db.ref('chats/' + cur + '/messages').push({ ...m, ts: firebase.database.ServerValue.TIMESTAMP });
  }
}
$('#send').onclick = send;
$('#input').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

/* ===== Рендер списков ===== */
function renderLists() {
  const q = $('#search').value.toLowerCase();
  const items = CHATS.filter(c => (tab === 'all' || c.type === tab) && c.name.toLowerCase().includes(q))
    .map(c => ({ c, l: lastOf(c.id) })).sort((a, b) => (b.l?.ts || 0) - (a.l?.ts || 0));
  $('#chat-list').innerHTML = items.map(({ c, l }) =>
    `<div class="row glass" data-id="${c.id}">${av(c.name)}<div class="info"><b>${nameHtml(c)}</b>
    <p>${l ? esc((l.uid === uid ? 'Вы: ' : '') + l.text) : 'Нет сообщений'}</p></div><time>${l ? fmt(l.ts) : ''}</time></div>`
  ).join('') || '<p class="empty">Ничего не найдено</p>';
  $('#contact-list').innerHTML = CHATS.filter(c => c.type === 'private').map(c =>
    `<div class="row glass" data-id="${c.id}">${av(c.name)}<div class="info"><b>${nameHtml(c)}</b><p>${isVer(c) ? 'Проверенный аккаунт' : 'был(а) недавно'}</p></div></div>`
  ).join('');
}
function renderMe() {
  $('#me-av').innerHTML = av(me.name, me.avatar, 'big');
  $('#me-title').innerHTML = nameHtml(me);
  $('#me-sub').textContent = me.status;
  $('#in-name').value = me.name; $('#in-status').value = me.status;
}

/* ===== Окно чата ===== */
function addBubble(m) {
  const mine = m.uid === uid, c = CHATS.find(x => x.id === cur);
  const d = document.createElement('div');
  d.className = 'msg ' + (mine ? 'me' : 'other');
  d.innerHTML = (!mine && c.type !== 'private' ? `<small class="who">${nameHtml(m)}</small>` : '') + '<span></span><time>' + fmt(m.ts) + '</time>';
  d.querySelector('span').textContent = m.text;
  const box = $('#messages');
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}
function openChat(id) {
  const c = CHATS.find(x => x.id === id); if (!c) return;
  cur = id;
  $('#c-av').innerHTML = av(c.name, '', 'sm');
  $('#c-name').innerHTML = nameHtml(c);
  $('#c-sub').textContent = { private: 'в сети', group: 'группа', channel: 'канал' }[c.type];
  $('#messages').innerHTML = '';
  [...(cache[id]?.values() || [])].sort((a, b) => a.ts - b.ts).forEach(addBubble);
  $('#chat').classList.add('open');
  setTimeout(() => $('#input').focus(), 350);
}
$('#back').onclick = () => { $('#chat').classList.remove('open'); cur = null; $('#input').blur(); };
['#chat-list', '#contact-list'].forEach(s => $(s).addEventListener('click', e => {
  const r = e.target.closest('.row'); if (r) openChat(r.dataset.id);
}));

/* ===== Вкладки, поиск, навигация ===== */
$('#tabs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  tab = b.dataset.f; $$('#tabs button').forEach(x => x.classList.toggle('on', x === b)); renderLists();
};
$('#search').oninput = renderLists;
$('#nav').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#nav button').forEach(x => x.classList.toggle('on', x === b));
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + b.dataset.s));
};

/* ===== Профиль (localStorage) ===== */
$('#save').onclick = () => {
  me.name = $('#in-name').value.trim() || me.name;
  me.status = $('#in-status').value.trim();
  save('me', me); renderMe();
  $('#save').textContent = 'Сохранено ✓'; setTimeout(() => $('#save').textContent = 'Сохранить', 1500);
};
$('#file').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height), cv = document.createElement('canvas');
      cv.width = cv.height = 160;
      cv.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
      me.avatar = cv.toDataURL('image/jpeg', .85); save('me', me); renderMe();
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(f);
};
$('#reset').onclick = () => { if (confirm('Сбросить профиль?')) { localStorage.removeItem('me'); location.reload(); } };

/* ===== Тема ===== */
function setTheme(t) { document.documentElement.dataset.theme = t; save('theme', t); }
setTheme(load('theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
$$('[data-theme-toggle]').forEach(b => b.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

/* ===== Старт ===== */
$('#mode').textContent = DEMO ? 'Демо (localStorage)' : 'Firebase Realtime DB';
renderLists(); renderMe();
