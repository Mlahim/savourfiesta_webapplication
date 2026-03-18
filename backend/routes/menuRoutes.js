const router = require('express').Router();
const menuController = require('../controllers/menuController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/userRole');
const upload = require('../middleware/multer');

// PUBLIC
router.get('/', menuController.getAllMenu);
router.get('/:id', menuController.getOneItem);

// ADMIN
router.post(
  '/',
  auth,
  role('admin'),
  upload.single('image'),
  menuController.addItems
);

router.put(
  '/:id',
  auth,
  role('admin'),
  upload.single('image'),
  menuController.updateItem
);

router.put(
  '/:id/availability',
  auth,
  role('admin'),
  menuController.toggleAvailability
);

router.put(
  '/:id/price',
  auth,
  role('admin'),
  menuController.updatePrice
);

router.delete(
  '/:id',
  auth,
  role('admin'),
  menuController.deleteItem
);

module.exports = router;
