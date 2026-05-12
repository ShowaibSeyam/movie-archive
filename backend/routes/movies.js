const router = require('express').Router();
const { body } = require('express-validator');
const mCtrl = require('../controllers/movieController');
const rCtrl = require('../controllers/reviewController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/* Movies */
router.get('/featured',     mCtrl.getFeatured);
router.get('/',             mCtrl.getMovies);
router.get('/:id',          mCtrl.getMovieById);
router.post('/',            authenticate, requireAdmin,
  body('title').trim().notEmpty(),
  body('release_year').isInt({ min:1888, max:new Date().getFullYear()+5 }),
  mCtrl.createMovie
);
router.put('/:id',          authenticate, requireAdmin, mCtrl.updateMovie);
router.delete('/:id',       authenticate, requireAdmin, mCtrl.deleteMovie);

/* Reviews (nested) */
router.get('/:movie_id/reviews',   rCtrl.getReviews);
router.post('/:movie_id/reviews',
  authenticate,
  body('rating').isInt({ min:1, max:10 }),
  body('review_text').optional().isLength({ max:2000 }),
  rCtrl.addReview
);

module.exports = router;
