const AuditLog = require('../models/AuditLog');

const recordAuditLog = async ({ userId = null, action, entityName, recordId = null, oldValue = null, newValue = null, ipAddress = '' }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityName,
      recordId,
      oldValue,
      newValue,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log write failed');
  }
};

module.exports = { recordAuditLog };
