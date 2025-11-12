// ----- DOM helpers -----
const $ = (s) => document.querySelector(s);

const titleInput = $('#title');
const descInput  = $('#description');
const addBtn     = $('#add-btn');
const popup      = $('#popup');
const taskList   = $('#task-list');

// ----- API base (change to '/api/todos' if using a dev proxy) -----
const API_BASE = 'http://localhost:5000/api/todos';

// ----- Popup controls -----
function openWindow() {
  popup.style.display = 'flex';
  popup.setAttribute('aria-hidden', 'false');
}
function closeWindow() {
  popup.style.display = 'none';
  popup.setAttribute('aria-hidden', 'true');
}
window.openWindow = openWindow;
window.closeWindow = closeWindow;

// ----- API helpers -----
async function listTodos() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

async function createTodo(title, description) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Create failed: ${res.status} ${msg}`);
  }
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
}

// ----- Rendering -----
function taskItemTemplate(todo) {
  const wrapper = document.createElement('div');
  wrapper.className = 'task-item';
  wrapper.dataset.id = todo._id;

  const h3 = document.createElement('h3');
  h3.textContent = todo.title;

  const p = document.createElement('p');
  p.textContent = todo.description;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete-btn';
  del.textContent = 'Delete';

  wrapper.append(h3, p, del);
  return wrapper;
}

function renderTasks(todos) {
  taskList.innerHTML = '';
  if (!todos.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add one!';
    taskList.appendChild(empty);
    return;
  }
  todos.forEach((t) => taskList.appendChild(taskItemTemplate(t)));
}

async function refreshTasks({ open = false } = {}) {
  try {
    const todos = await listTodos();
    renderTasks(todos);
    if (open) openWindow();
  } catch (err) {
    console.error(err);
    alert('Failed to load tasks. Ensure backend is running on http://localhost:5000');
  }
}

// ----- Events -----
addBtn.addEventListener('click', async () => {
  const t = titleInput.value.trim();
  const d = descInput.value.trim();
  if (!t || !d) {
    alert('Enter both title and task description');
    return;
  }

  try {
    addBtn.disabled = true;
    await createTodo(t, d);
    titleInput.value = '';
    descInput.value = '';
    await refreshTasks({ open: true });
  } catch (err) {
    console.error(err);
    alert('Failed to add task.');
  } finally {
    addBtn.disabled = false;
  }
});

// Refresh when clicking 📝
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('#tasks-btn');
  if (btn) {
    await refreshTasks({ open: true });
  }
});

// Delete (event delegation)
taskList.addEventListener('click', async (e) => {
  if (e.target.closest('.delete-btn')) {
    const card = e.target.closest('.task-item');
    const id = card?.dataset?.id;
    if (!id) return card?.remove();
    try {
      e.target.disabled = true;
      await deleteTodo(id);
      card.remove();
      if (!taskList.children.length) renderTasks([]);
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
      e.target.disabled = false;
    }
  }
});

// Keyboard: Escape closes popup, Enter→Desc, Ctrl+Enter submits
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popup.style.display === 'flex') closeWindow();
});
titleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); descInput.focus(); }
});
descInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addBtn.click(); }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => { refreshTasks(); });
