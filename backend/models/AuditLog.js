const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    auditLogId: {
      type: String,
      unique: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: true
    },
    entityName: {
      type: String,
      required: true
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    createdDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

auditLogSchema.pre('save', function buildAuditLogId(next) {
  if (!this.auditLogId) {
    this.auditLogId = `AUD-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
