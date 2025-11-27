const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validateRequest = require('../middleware/validate');
const orgController = require('../controllers/orgController');
const { authMiddleware } = require('../auth');

// POST /org/create
router.post(
	'/org/create',
	[
		check('organization_name').isString().notEmpty(),
		check('email').isEmail(),
		check('password').isLength({ min: 6 }),
	],
	validateRequest,
	orgController.createOrg
);

// GET /org/get
router.get('/org/get', [check('organization_name').optional().isString()], validateRequest, orgController.getOrg);

// PUT /org/update
router.put(
	'/org/update',
	[check('organization_name').isString().notEmpty(), check('new_organization_name').optional().isString()],
	validateRequest,
	orgController.updateOrg
);

// DELETE /org/delete (protected)
router.delete('/org/delete', authMiddleware, [check('organization_name').isString().notEmpty()], validateRequest, orgController.deleteOrg);

// POST /admin/login
router.post('/admin/login', [check('email').isEmail(), check('password').isString().notEmpty()], validateRequest, orgController.adminLogin);

module.exports = router;
