const { ObjectId } = require('mongodb');
const { connect, createOrgCollection, copyCollection, dropOrgCollection } = require('../db');
const { hashPassword, verifyPassword, createToken } = require('../auth');

class OrgService {
  constructor() {
    // lazy connect when needed
  }

  async createOrg({ organization_name, email, password }) {
    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const existing = await orgs.findOne({ organization_name });
    if (existing) throw { status: 400, message: 'Organization name already exists' };

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

    return { organization_name, collection_name: collectionName, admin_email: email, org_id: orgRes.insertedId.toString() };
  }

  async getOrg({ organization_name }) {
    const db = await connect();
    const orgs = db.collection('organizations');
    const org = await orgs.findOne({ organization_name });
    if (!org) throw { status: 404, message: 'Organization not found' };
    return { organization_name: org.organization_name, collection_name: org.collection_name, org_id: org._id.toString() };
  }

  async updateOrg({ organization_name, new_organization_name, email, password }) {
    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const org = await orgs.findOne({ organization_name });
    if (!org) throw { status: 404, message: 'Organization not found' };

    if (new_organization_name) {
      const exists = await orgs.findOne({ organization_name: new_organization_name });
      if (exists) throw { status: 400, message: 'New organization name already exists' };

      const oldCollection = org.collection_name;
      const newCollection = `org_${new_organization_name}`;
      await createOrgCollection(db, newCollection);
      await copyCollection(db, oldCollection, newCollection);
      await dropOrgCollection(db, oldCollection);

      await orgs.updateOne({ _id: org._id }, { $set: { organization_name: new_organization_name, collection_name: newCollection } });
    }

    if (email || password) {
      const admin = await admins.findOne({ org_id: org._id });
      if (!admin) throw { status: 500, message: 'Admin not found for this org' };
      const update = {};
      if (email) update.email = email;
      if (password) update.password_hash = await hashPassword(password);
      await admins.updateOne({ _id: admin._id }, { $set: update });
    }

    return { detail: 'Organization updated' };
  }

  async deleteOrg({ organization_name }, currentUser) {
    const db = await connect();
    const orgs = db.collection('organizations');
    const admins = db.collection('admins');

    const org = await orgs.findOne({ organization_name });
    if (!org) throw { status: 404, message: 'Organization not found' };

    if (!currentUser || !currentUser.org_id || currentUser.org_id !== org._id.toString()) {
      throw { status: 403, message: 'Forbidden: you are not admin of this organization' };
    }

    await dropOrgCollection(db, org.collection_name);
    await admins.deleteOne({ org_id: org._id });
    await orgs.deleteOne({ _id: org._id });

    return { detail: 'Organization deleted' };
  }

  async adminLogin({ email, password }) {
    const db = await connect();
    const admins = db.collection('admins');
    const admin = await admins.findOne({ email });
    if (!admin) throw { status: 401, message: 'Invalid credentials' };
    const ok = await verifyPassword(password, admin.password_hash);
    if (!ok) throw { status: 401, message: 'Invalid credentials' };
    const token = createToken({ admin_id: admin._id.toString(), org_id: admin.org_id.toString() });
    return { access_token: token, token_type: 'bearer' };
  }
}

module.exports = OrgService;
