require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ---- Config ----
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todos_db';

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ---- DB ----
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ---- Model ----
const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Todo = mongoose.model('Todo', todoSchema);

// ---- Health & Root ----
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Todo API is running', routes: ['/health', '/api/todos'] });
});
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ---- Todos routes ----
app.get('/api/todos', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) { next(err); }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
    const todo = await Todo.create({ title: title.trim(), description: description.trim() });
    res.status(201).json(todo);
  } catch (err) { next(err); }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid todo id.' });

    const deleted = await Todo.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Todo not found.' });
    res.json({ message: 'Todo deleted', id });
  } catch (err) { next(err); }
});

// ---- 404 & Error ----
app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method }));
app.use((err, req, res, next) => {
  console.error('💥', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ---- Start ----
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
