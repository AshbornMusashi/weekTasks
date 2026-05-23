'use strict';

const $ = id => document.getElementById(id);
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function isoWeekKey() {
  const d    = new Date();
  const tmp  = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const year = tmp.getUTCFullYear();
  const week = Math.ceil((((tmp - new Date(Date.UTC(year,0,1))) / 86400000) + 1) / 7);
  return `${year}-W${String(week).padStart(2,'0')}`;
}

function weekDisplay() {
  const d   = new Date();
  const wn  = isoWeekKey().split('-W')[1];
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const dt  = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  return `WEEK ${wn}  ·  ${day} ${dt}`;
}

/* ── Storage ──────────────────────────────────── */
const TASKS_KEY = 'wt_tasks';
const WEEK_KEY  = 'wt_week';

function load(k)    { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

/* ── Weekly reset ─────────────────────────────── */
function checkWeeklyReset() {
  const stored = load(WEEK_KEY);
  const now    = isoWeekKey();
  if (stored !== now) {
    save(TASKS_KEY, []);
    save(WEEK_KEY,  now);
  }
}


let tasks = [];

function loadTasks()  { tasks = load(TASKS_KEY) || []; }
function saveTasks()  { save(TASKS_KEY, tasks); }


function render() {
  const todo  = tasks.filter(t => t.col === 'todo');
  const done  = tasks.filter(t => t.col === 'done');
  const total = tasks.length;
  const pct   = total ? Math.round((done.length / total) * 100) : 0;

  $('bar-fill').style.width   = pct + '%';
  $('bar-pct').textContent    = pct + '%';
  $('stat-done').textContent  = done.length;
  $('stat-total').textContent = total;
  $('count-todo').textContent = todo.length;
  $('count-done').textContent = done.length;

  renderList('list-todo', todo);
  renderList('list-done', done);
}

function renderList(listId, items) {
  const ul = $(listId);
  ul.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.className   = 'empty-hint';
    li.textContent = 'Drop tasks here';
    ul.appendChild(li);
    return;
  }

  items.forEach(task => {
    const li = document.createElement('li');
    li.className  = 'task-item';
    li.dataset.id = task.id;
    li.innerHTML  = `
      <span class="drag-handle">⠿</span>
      <span class="bullet"></span>
      <span class="task-text">${esc(task.text)}</span>
      <button class="delete-btn" data-id="${task.id}" title="Remove">✕</button>
    `;
    // stop delete button from triggering drag
    li.querySelector('.delete-btn').addEventListener('pointerdown', e => e.stopPropagation());
    li.querySelector('.delete-btn').addEventListener('click', e => {
      tasks = tasks.filter(t => t.id !== e.currentTarget.dataset.id);
      saveTasks(); render();
    });
    ul.appendChild(li);
  });
}


function addTask() {
  const input = $('new-task-input');
  const text  = input.value.trim();
  if (!text) return;
  tasks.push({ id: uid(), text, col: 'todo' });
  input.value = '';
  saveTasks(); render();
  input.focus();
}

$('add-btn').addEventListener('click', addTask);
$('new-task-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

const ghost     = $('drag-ghost');
const ghostText = $('ghost-text');

const THRESHOLD = 6; // px movement before drag activates

let drag = null;
/
function colAtPoint(x, y) {
  for (const col of document.querySelectorAll('.col')) {
    const r = col.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return col;
  }
  return null;
}


function insertBefore(list, y) {
  for (const item of list.querySelectorAll('.task-item:not(.is-dragging)')) {
    const r = item.getBoundingClientRect();
    if (y < r.top + r.height / 2) return item;
  }
  return null; // → append
}
function movePlaceholder(col, y) {
  const list   = col.querySelector('.task-list');
  const ph     = drag.placeholder;
  const before = insertBefore(list, y);

  if (before) {
    if (ph.nextElementSibling !== before) list.insertBefore(ph, before);
  } else {
    if (list.lastElementChild !== ph) list.appendChild(ph);
  }
}

function clearDragOver() {
  document.querySelectorAll('.col.drag-over').forEach(c => c.classList.remove('drag-over'));
}

/* ── pointerdown ── */
document.addEventListener('pointerdown', e => {
  const item = e.target.closest('.task-item');
  if (!item) return;

  const rect = item.getBoundingClientRect();
  drag = {
    taskId:  item.dataset.id,
    el:      item,
    startX:  e.clientX,
    startY:  e.clientY,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    active:  false,
    placeholder: null,
    currentCol:  null,
  };


  item.setPointerCapture(e.pointerId);
}, { passive: true });


document.addEventListener('pointermove', e => {
  if (!drag) return;

  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  if (!drag.active) {
    if (Math.hypot(dx, dy) < THRESHOLD) return;
    drag.active = true;

    /* build placeholder */
    drag.placeholder = document.createElement('li');
    drag.placeholder.className = 'drop-placeholder';

    /* set ghost label */
    const task = tasks.find(t => t.id === drag.taskId);
    ghostText.textContent = task ? task.text : '';
    ghost.style.width = drag.el.offsetWidth + 'px';

    drag.el.classList.add('is-dragging');
    ghost.classList.add('visible');
  }

  /* reposition ghost exactly under finger/cursor */
  ghost.style.transform =
    `translate(${e.clientX - drag.offsetX}px, ${e.clientY - drag.offsetY}px) rotate(1.5deg)`;

  /* find target column */
  const col = colAtPoint(e.clientX, e.clientY);

  if (col) {
    const colId = col.dataset.col;
    if (drag.currentCol !== colId) {
      clearDragOver();
      col.classList.add('drag-over');
      drag.currentCol = colId;
    }
    movePlaceholder(col, e.clientY);
  } else {
    clearDragOver();
    drag.currentCol = null;
    if (drag.placeholder.parentNode) drag.placeholder.parentNode.removeChild(drag.placeholder);
  }
}, { passive: true });

/* ── pointerup (commit) ── */
document.addEventListener('pointerup', e => {
  if (!drag) return;

  ghost.classList.remove('visible');
  clearDragOver();

  if (drag.placeholder?.parentNode) drag.placeholder.parentNode.removeChild(drag.placeholder);
  drag.el.classList.remove('is-dragging');

  if (drag.active && drag.currentCol) {
    const task = tasks.find(t => t.id === drag.taskId);
    if (task && task.col !== drag.currentCol) {
      task.col = drag.currentCol;
      saveTasks();
    }
    render();
  }

  drag = null;
}, { passive: true });


document.addEventListener('pointercancel', () => {
  if (!drag) return;
  ghost.classList.remove('visible');
  clearDragOver();
  if (drag.placeholder?.parentNode) drag.placeholder.parentNode.removeChild(drag.placeholder);
  drag.el.classList.remove('is-dragging');
  drag = null;
});


document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drag?.active) {
    ghost.classList.remove('visible');
    clearDragOver();
    if (drag.placeholder?.parentNode) drag.placeholder.parentNode.removeChild(drag.placeholder);
    drag.el.classList.remove('is-dragging');
    drag = null;
  }
});


document.addEventListener('touchmove', e => {
  if (drag?.active) e.preventDefault();
}, { passive: false });


checkWeeklyReset();
loadTasks();
$('week-label').textContent = weekDisplay();
render();
$('new-task-input').focus();
