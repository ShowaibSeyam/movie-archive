const db = require('../config/db');
const { validationResult } = require('express-validator');

/* GET /api/movies  — search · filter · sort · paginate */
exports.getMovies = async (req, res) => {
  try {
    const { search='', genre_id='', year='', sort='rating', order='DESC', page=1, limit=12 } = req.query;
    const offset   = (Math.max(1, +page) - 1) * Math.min(+limit, 50);
    const lim      = Math.min(Math.max(+limit, 1), 50);
    const allowed  = ['rating','release_year','title','created_at'];
    const safeSort = allowed.includes(sort) ? `m.${sort}` : 'm.rating';
    const safeOrd  = order.toUpperCase()==='ASC' ? 'ASC' : 'DESC';

    let where = [], params = [];
    if (search)   { where.push('(m.title LIKE ? OR d.director_name LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
    if (genre_id) { where.push('m.genre_id=?');     params.push(genre_id); }
    if (year)     { where.push('m.release_year=?'); params.push(year); }
    const W = where.length ? 'WHERE '+where.join(' AND ') : '';

    const [movies] = await db.query(
      `SELECT m.*,g.genre_name,d.director_name,
              (SELECT COUNT(*) FROM review r WHERE r.movie_id=m.movie_id) AS review_count
       FROM movie m
       LEFT JOIN genre    g ON g.genre_id=m.genre_id
       LEFT JOIN director d ON d.director_id=m.director_id
       ${W} ORDER BY ${safeSort} ${safeOrd} LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );
    const [[{total}]] = await db.query(
      `SELECT COUNT(*) AS total FROM movie m
       LEFT JOIN director d ON d.director_id=m.director_id ${W}`, params
    );
    res.json({ movies, pagination: { total, page:+page, limit:lim, totalPages:Math.ceil(total/lim) } });
  } catch (err) { console.error(err); res.status(500).json({ error:'Failed to fetch movies.' }); }
};

/* GET /api/movies/featured */
exports.getFeatured = async (_req, res) => {
  try {
    const [movies] = await db.query(
      `SELECT m.*,g.genre_name,d.director_name FROM movie m
       LEFT JOIN genre g ON g.genre_id=m.genre_id
       LEFT JOIN director d ON d.director_id=m.director_id
       ORDER BY m.rating DESC LIMIT 6`
    );
    res.json({ movies });
  } catch { res.status(500).json({ error:'Failed.' }); }
};

/* GET /api/movies/:id */
exports.getMovieById = async (req, res) => {
  try {
    const [[movie]] = await db.query(
      `SELECT m.*,g.genre_name,
              d.director_name,d.nationality AS director_nationality,d.bio AS director_bio
       FROM movie m
       LEFT JOIN genre g ON g.genre_id=m.genre_id
       LEFT JOIN director d ON d.director_id=m.director_id
       WHERE m.movie_id=?`, [req.params.id]
    );
    if (!movie) return res.status(404).json({ error:'Movie not found.' });

    const [cast]    = await db.query(
      `SELECT a.*,mc.role_name FROM movie_cast mc
       JOIN actor a ON a.actor_id=mc.actor_id WHERE mc.movie_id=?`, [req.params.id]
    );
    const [reviews] = await db.query(
      `SELECT r.*,u.user_name,u.avatar_url FROM review r
       JOIN user u ON u.user_id=r.user_id WHERE r.movie_id=?
       ORDER BY r.created_at DESC`, [req.params.id]
    );
    res.json({ ...movie, cast, reviews });
  } catch (err) { console.error(err); res.status(500).json({ error:'Failed.' }); }
};

/* POST /api/movies  (admin) */
exports.createMovie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });

  const { title,release_year,genre_id,director_id,description,poster_url,duration_min,language,cast } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO movie (title,release_year,genre_id,director_id,description,poster_url,duration_min,language)
       VALUES (?,?,?,?,?,?,?,?)`,
      [title,release_year,genre_id||null,director_id||null,description,poster_url,duration_min,language]
    );
    if (Array.isArray(cast) && cast.length) {
      const rows = cast.map(c=>[r.insertId, c.actor_id, c.role_name||null]);
      await db.query('INSERT IGNORE INTO movie_cast (movie_id,actor_id,role_name) VALUES ?',[rows]);
    }
    res.status(201).json({ message:'Movie created.', movie_id:r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error:'Failed to create movie.' }); }
};

/* PUT /api/movies/:id  (admin) */
exports.updateMovie = async (req, res) => {
  const { title,release_year,genre_id,director_id,description,poster_url,duration_min,language } = req.body;
  try {
    const [r] = await db.query(
      `UPDATE movie SET title=?,release_year=?,genre_id=?,director_id=?,
       description=?,poster_url=?,duration_min=?,language=? WHERE movie_id=?`,
      [title,release_year,genre_id||null,director_id||null,description,poster_url,duration_min,language,req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error:'Movie not found.' });
    res.json({ message:'Movie updated.' });
  } catch { res.status(500).json({ error:'Failed.' }); }
};

/* DELETE /api/movies/:id  (admin) */
exports.deleteMovie = async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM movie WHERE movie_id=?',[req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error:'Movie not found.' });
    res.json({ message:'Movie deleted.' });
  } catch { res.status(500).json({ error:'Failed.' }); }
};
