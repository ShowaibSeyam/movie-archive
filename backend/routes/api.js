const router = require('express').Router();
const rCtrl  = require('../controllers/reviewController');
const mCtrl  = require('../controllers/metaController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/* Reviews */
router.put('/reviews/:review_id',    authenticate, rCtrl.updateReview);
router.delete('/reviews/:review_id', authenticate, rCtrl.deleteReview);

/* Genres */
router.get('/genres',            mCtrl.getGenres);
router.post('/genres',           authenticate, requireAdmin, mCtrl.createGenre);
router.delete('/genres/:id',     authenticate, requireAdmin, mCtrl.deleteGenre);

/* Directors */
router.get('/directors',         mCtrl.getDirectors);
router.post('/directors',        authenticate, requireAdmin, mCtrl.createDirector);
router.put('/directors/:id',     authenticate, requireAdmin, mCtrl.updateDirector);
router.delete('/directors/:id',  authenticate, requireAdmin, mCtrl.deleteDirector);

/* Actors */
router.get('/actors',            mCtrl.getActors);
router.post('/actors',           authenticate, requireAdmin, mCtrl.createActor);
router.put('/actors/:id',        authenticate, requireAdmin, mCtrl.updateActor);
router.delete('/actors/:id',     authenticate, requireAdmin, mCtrl.deleteActor);

/* Watchlist */
router.get('/watchlist',              authenticate, mCtrl.getWatchlist);
router.post('/watchlist/:movie_id',   authenticate, mCtrl.addToWatchlist);
router.delete('/watchlist/:movie_id', authenticate, mCtrl.removeFromWatchlist);

/* Admin: users */
router.get('/admin/users',           authenticate, requireAdmin, mCtrl.getUsers);
router.delete('/admin/users/:id',    authenticate, requireAdmin, mCtrl.deleteUser);
router.put('/admin/users/:id/role',  authenticate, requireAdmin, mCtrl.updateUserRole);

module.exports = router;
