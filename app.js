const $ = (s) => document.querySelector(s);

const titleInput = $('#title');
const descInput  = $('#description');
const addBtn     = $('#add-btn');
const popup      = $('#popup');
const taskList   = $('#task-list');

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

addBtn.addEventListener('click', () => {
  const t = titleInput.value.trim();
  const d = descInput.value.trim();
  if (!t || !d) {
    alert('Enter both title and task description');
    return;
  }

  const item = document.createElement('div');
  item.className = 'task-item';

  const h3 = document.createElement('h3');
  h3.textContent = t;

  const p = document.createElement('p');
  p.textContent = d;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete-btn';
  del.textContent = 'Delete';

  item.append(h3, p, del);
  taskList.appendChild(item);


  titleInput.value = '';
  descInput.value = '';


  if (popup.style.display === 'none' || !popup.style.display) openWindow();
});


taskList.addEventListener('click', (e) => {
  if (e.target.closest('.delete-btn')) {
    const card = e.target.closest('.task-item');
    if (card) card.remove();
  }
});


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popup.style.display === 'flex') closeWindow();
});
