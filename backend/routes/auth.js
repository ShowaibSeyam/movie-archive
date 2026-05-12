const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register',
  body('user_name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min:8 }).matches(/[A-Z]/).matches(/[0-9]/),
  ctrl.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  ctrl.login
);

router.get('/me',          authenticate, ctrl.getMe);
router.put('/profile',     authenticate, ctrl.updateProfile);
router.put('/password',    authenticate, ctrl.changePassword);

module.exports = router;
