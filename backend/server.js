require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Security ─────────────────────────────────────── */
app.use(helmet({ crossOriginResourcePolicy: { policy:'cross-origin' } }));
app.use(cors({
  origin:      [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','OPTIONS'],
}));
app.use(cookieParser());
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));

/* ── Rate limiting ────────────────────────────────── */
app.use('/api/', rateLimit({ windowMs:15*60*1000, max:300, message:{ error:'Too many requests.' } }));
app.use('/api/auth/login',    rateLimit({ windowMs:15*60*1000, max:15 }));
app.use('/api/auth/register', rateLimit({ windowMs:60*60*1000, max:10 }));

/* ── Routes ───────────────────────────────────────── */
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api',        require('./routes/api'));

/* ── Health check ─────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status:'ok', ts: new Date() }));

/* ── Serve frontend in production ─────────────────── */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname,'../frontend')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname,'../frontend/index.html'))
  );
}

/* ── Global error handler ─────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ error:'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🎬  Movie Archive API  →  http://localhost:${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
});
