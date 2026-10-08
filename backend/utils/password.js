const bcrypt = require('bcryptjs');

const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isStrongPassword = (password) => passwordPolicyRegex.test(password || '');

const hashPassword = async (password) => bcrypt.hash(password, 12);

const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let result = '';
  for (let index = 0; index < 14; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

module.exports = {
  isStrongPassword,
  hashPassword,
  comparePassword,
  generateTemporaryPassword
};
