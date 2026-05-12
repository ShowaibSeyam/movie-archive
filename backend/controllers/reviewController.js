const db = require('../config/db');

/* GET /api/movies/:movie_id/reviews */
exports.getReviews = async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*,u.user_name,u.avatar_url FROM review r
     JOIN user u ON u.user_id=r.user_id WHERE r.movie_id=?
     ORDER BY r.created_at DESC`, [req.params.movie_id]
  );
  res.json({ reviews: rows });
};

/* POST /api/movies/:movie_id/reviews */
exports.addReview = async (req, res) => {
  const { review_text, rating } = req.body;
  const { movie_id }            = req.params;
  const user_id                 = req.user.user_id;
  try {
    const [exist] = await db.query(
      'SELECT review_id FROM review WHERE user_id=? AND movie_id=?', [user_id, movie_id]
    );
    if (exist.length) return res.status(409).json({ error:'You have already reviewed this movie.' });

    const [r] = await db.query(
      'INSERT INTO review (user_id,movie_id,review_text,rating) VALUES (?,?,?,?)',
      [user_id, movie_id, review_text, rating]
    );
    const [[review]] = await db.query(
      `SELECT r.*,u.user_name,u.avatar_url FROM review r
       JOIN user u ON u.user_id=r.user_id WHERE r.review_id=?`, [r.insertId]
    );
    res.status(201).json({ message:'Review added.', review });
  } catch (err) { console.error(err); res.status(500).json({ error:'Failed to add review.' }); }
};

/* PUT /api/reviews/:review_id */
exports.updateReview = async (req, res) => {
  const { review_text, rating } = req.body;
  const { review_id }           = req.params;
  try {
    const [[rv]] = await db.query('SELECT * FROM review WHERE review_id=?', [review_id]);
    if (!rv) return res.status(404).json({ error:'Review not found.' });
    if (rv.user_id !== req.user.user_id && req.user.role !== 'admin')
      return res.status(403).json({ error:'Not authorised.' });

    await db.query('UPDATE review SET review_text=?,rating=? WHERE review_id=?',
      [review_text, rating, review_id]);
    res.json({ message:'Review updated.' });
  } catch { res.status(500).json({ error:'Failed.' }); }
};

/* DELETE /api/reviews/:review_id */
exports.deleteReview = async (req, res) => {
  const { review_id } = req.params;
  try {
    const [[rv]] = await db.query('SELECT * FROM review WHERE review_id=?', [review_id]);
    if (!rv) return res.status(404).json({ error:'Review not found.' });
    if (rv.user_id !== req.user.user_id && req.user.role !== 'admin')
      return res.status(403).json({ error:'Not authorised.' });

    await db.query('DELETE FROM review WHERE review_id=?', [review_id]);
    res.json({ message:'Review deleted.' });
  } catch { res.status(500).json({ error:'Failed.' }); }
};
