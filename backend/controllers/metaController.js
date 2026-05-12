const db = require('../config/db');

/* ═══ GENRES ═══════════════════════════════════════════ */
exports.getGenres = async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM genre ORDER BY genre_name');
  res.json({ genres: rows });
};
exports.createGenre = async (req, res) => {
  try {
    const [r] = await db.query('INSERT INTO genre (genre_name) VALUES (?)', [req.body.genre_name]);
    res.status(201).json({ message:'Genre created.', genre_id:r.insertId });
  } catch (e) {
    if (e.code==='ER_DUP_ENTRY') return res.status(409).json({ error:'Genre already exists.' });
    res.status(500).json({ error:'Failed.' });
  }
};
exports.deleteGenre = async (req, res) => {
  await db.query('DELETE FROM genre WHERE genre_id=?', [req.params.id]);
  res.json({ message:'Genre deleted.' });
};

/* ═══ DIRECTORS ═════════════════════════════════════════ */
exports.getDirectors = async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM director ORDER BY director_name');
  res.json({ directors: rows });
};
exports.createDirector = async (req, res) => {
  const { director_name, nationality, bio } = req.body;
  const [r] = await db.query(
    'INSERT INTO director (director_name,nationality,bio) VALUES (?,?,?)',
    [director_name, nationality, bio]
  );
  res.status(201).json({ message:'Director created.', director_id:r.insertId });
};
exports.updateDirector = async (req, res) => {
  const { director_name, nationality, bio } = req.body;
  await db.query(
    'UPDATE director SET director_name=?,nationality=?,bio=? WHERE director_id=?',
    [director_name, nationality, bio, req.params.id]
  );
  res.json({ message:'Director updated.' });
};
exports.deleteDirector = async (req, res) => {
  await db.query('DELETE FROM director WHERE director_id=?', [req.params.id]);
  res.json({ message:'Director deleted.' });
};

/* ═══ ACTORS ════════════════════════════════════════════ */
exports.getActors = async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM actor ORDER BY actor_name');
  res.json({ actors: rows });
};
exports.createActor = async (req, res) => {
  const { actor_name, birth_year, nationality } = req.body;
  const [r] = await db.query(
    'INSERT INTO actor (actor_name,birth_year,nationality) VALUES (?,?,?)',
    [actor_name, birth_year, nationality]
  );
  res.status(201).json({ message:'Actor created.', actor_id:r.insertId });
};
exports.updateActor = async (req, res) => {
  const { actor_name, birth_year, nationality } = req.body;
  await db.query(
    'UPDATE actor SET actor_name=?,birth_year=?,nationality=? WHERE actor_id=?',
    [actor_name, birth_year, nationality, req.params.id]
  );
  res.json({ message:'Actor updated.' });
};
exports.deleteActor = async (req, res) => {
  await db.query('DELETE FROM actor WHERE actor_id=?', [req.params.id]);
  res.json({ message:'Actor deleted.' });
};

/* ═══ WATCHLIST ═════════════════════════════════════════ */
exports.getWatchlist = async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.*,g.genre_name,d.director_name FROM watchlist w
     JOIN movie m ON m.movie_id=w.movie_id
     LEFT JOIN genre g ON g.genre_id=m.genre_id
     LEFT JOIN director d ON d.director_id=m.director_id
     WHERE w.user_id=? ORDER BY w.added_at DESC`, [req.user.user_id]
  );
  res.json({ watchlist: rows });
};
exports.addToWatchlist = async (req, res) => {
  try {
    await db.query('INSERT IGNORE INTO watchlist (user_id,movie_id) VALUES (?,?)',
      [req.user.user_id, req.params.movie_id]);
    res.json({ message:'Added to watchlist.' });
  } catch { res.status(500).json({ error:'Failed.' }); }
};
exports.removeFromWatchlist = async (req, res) => {
  await db.query('DELETE FROM watchlist WHERE user_id=? AND movie_id=?',
    [req.user.user_id, req.params.movie_id]);
  res.json({ message:'Removed from watchlist.' });
};

/* ═══ ADMIN – USERS ════════════════════════════════════ */
exports.getUsers = async (_req, res) => {
  const [rows] = await db.query(
    'SELECT user_id,user_name,email,role,created_at FROM user ORDER BY created_at DESC'
  );
  res.json({ users: rows });
};
exports.deleteUser = async (req, res) => {
  if (req.params.id == req.user.user_id)
    return res.status(400).json({ error:'Cannot delete your own account.' });
  await db.query('DELETE FROM user WHERE user_id=?', [req.params.id]);
  res.json({ message:'User deleted.' });
};
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user','admin'].includes(role)) return res.status(400).json({ error:'Invalid role.' });
  await db.query('UPDATE user SET role=? WHERE user_id=?', [role, req.params.id]);
  res.json({ message:'Role updated.' });
};
