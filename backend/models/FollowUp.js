const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      unique: true,
      trim: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },
    followUpDate: {
      type: Date,
      required: true
    },
    followUpType: {
      type: String,
      required: true,
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Planned', 'Completed', 'Missed', 'Cancelled'],
      default: 'Planned'
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

followUpSchema.plugin(paginate);

followUpSchema.pre('save', function buildFollowUpId(next) {
  if (!this.followUpId) {
    this.followUpId = `FUP-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('FollowUp', followUpSchema);
