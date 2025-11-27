const OrgService = require('../services/orgService');

const service = new OrgService();

async function createOrg(req, res) {
  try {
    const payload = req.body;
    if (!payload.organization_name || !payload.email || !payload.password) return res.status(400).json({ error: 'Missing fields' });
    const result = await service.createOrg(payload);
    return res.json(result);
  } catch (err) {
    console.error('createOrg error', err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

async function getOrg(req, res) {
  try {
    const { organization_name } = req.query;
    if (!organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const result = await service.getOrg({ organization_name });
    return res.json(result);
  } catch (err) {
    console.error('getOrg error', err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

async function updateOrg(req, res) {
  try {
    const payload = req.body;
    if (!payload.organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const result = await service.updateOrg(payload);
    return res.json(result);
  } catch (err) {
    console.error('updateOrg error', err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

async function deleteOrg(req, res) {
  try {
    const payload = req.body;
    if (!payload.organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const result = await service.deleteOrg(payload, req.user);
    return res.json(result);
  } catch (err) {
    console.error('deleteOrg error', err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

async function adminLogin(req, res) {
  try {
    const payload = req.body;
    if (!payload.email || !payload.password) return res.status(400).json({ error: 'Missing fields' });
    const result = await service.adminLogin(payload);
    return res.json(result);
  } catch (err) {
    console.error('adminLogin error', err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}

module.exports = {
  createOrg,
  getOrg,
  updateOrg,
  deleteOrg,
  adminLogin,
};
