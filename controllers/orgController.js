const { ObjectId } = require('mongodb');
const { connect, createOrgCollection, copyCollection, dropOrgCollection } = require('../db');
const { hashPassword, verifyPassword, createToken } = require('../auth');

async function createOrg(req, res) {
  try {
    const { organization_name, email, password } = req.body;
    if (!organization_name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const existing = await orgs.findOne({ organization_name });
    if (existing) return res.status(400).json({ error: 'Organization name already exists' });

    const collectionName = `org_${organization_name}`;
    await createOrgCollection(db, collectionName);

    const orgDoc = { organization_name, collection_name: collectionName, created_at: new Date() };
    const orgRes = await orgs.insertOne(orgDoc);

    const adminDoc = {
      email,
      password_hash: await hashPassword(password),
      org_id: orgRes.insertedId,
      created_at: new Date(),
    };
    const adminRes = await admins.insertOne(adminDoc);

    await orgs.updateOne({ _id: orgRes.insertedId }, { $set: { admin_id: adminRes.insertedId } });

    return res.json({ organization_name, collection_name: collectionName, admin_email: email, org_id: orgRes.insertedId.toString() });
  } catch (err) {
    console.error('createOrg error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOrg(req, res) {
  try {
    const { organization_name } = req.query;
    if (!organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const db = await connect();
    const orgs = db.collection('organizations');
    const org = await orgs.findOne({ organization_name });
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    return res.json({ organization_name: org.organization_name, collection_name: org.collection_name, org_id: org._id.toString() });
  } catch (err) {
    console.error('getOrg error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateOrg(req, res) {
  try {
    const { organization_name, new_organization_name, email, password } = req.body;
    if (!organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const org = await orgs.findOne({ organization_name });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    if (new_organization_name) {
      const exists = await orgs.findOne({ organization_name: new_organization_name });
      if (exists) return res.status(400).json({ error: 'New organization name already exists' });

      const oldCollection = org.collection_name;
      const newCollection = `org_${new_organization_name}`;
      await createOrgCollection(db, newCollection);
      await copyCollection(db, oldCollection, newCollection);
      await dropOrgCollection(db, oldCollection);

      await orgs.updateOne({ _id: org._id }, { $set: { organization_name: new_organization_name, collection_name: newCollection } });
    }

    if (email || password) {
      const admin = await admins.findOne({ org_id: org._id });
      if (!admin) return res.status(500).json({ error: 'Admin not found for this org' });
      const update = {};
      if (email) update.email = email;
      if (password) update.password_hash = await hashPassword(password);
      await admins.updateOne({ _id: admin._id }, { $set: update });
    }

    return res.json({ detail: 'Organization updated' });
  } catch (err) {
    console.error('updateOrg error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteOrg(req, res) {
  try {
    const { organization_name } = req.body;
    if (!organization_name) return res.status(400).json({ error: 'organization_name is required' });
    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const org = await orgs.findOne({ organization_name });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    // only admin of that org may delete
    if (!req.user || !req.user.org_id || req.user.org_id !== org._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: you are not admin of this organization' });
    }

    await dropOrgCollection(db, org.collection_name);
    await admins.deleteOne({ org_id: org._id });
    await orgs.deleteOne({ _id: org._id });

    return res.json({ detail: 'Organization deleted' });
  } catch (err) {
    console.error('deleteOrg error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const db = await connect();
    const admins = db.collection('admins');

    const admin = await admins.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken({ admin_id: admin._id.toString(), org_id: admin.org_id.toString() });
    return res.json({ access_token: token, token_type: 'bearer' });
  } catch (err) {
    console.error('adminLogin error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createOrg,
  getOrg,
  updateOrg,
  deleteOrg,
  adminLogin,
};
