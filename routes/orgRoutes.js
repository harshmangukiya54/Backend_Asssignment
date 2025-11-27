const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { authMiddleware } = require('../auth');

// Health check moved to app.js; main API routes here
router.post('/org/create', orgController.createOrg);
router.get('/org/get', orgController.getOrg);
router.put('/org/update', orgController.updateOrg);
router.delete('/org/delete', authMiddleware, orgController.deleteOrg);
router.post('/admin/login', orgController.adminLogin);

module.exports = router;
