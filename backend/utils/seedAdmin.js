const User = require('../models/User');
const { hashPassword } = require('./password');

async function ensureDefaultAdminUser() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@acxiomcrm.local').toLowerCase().trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@1234';

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    return existingAdmin;
  }

  const adminUser = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email,
    passwordHash: await hashPassword(password),
    role: 'Admin',
    isActive: true,
    createdBy: null
  });

  console.log(`Default admin account created: ${email} / ${password}`);
  return adminUser;
}

module.exports = { ensureDefaultAdminUser };
