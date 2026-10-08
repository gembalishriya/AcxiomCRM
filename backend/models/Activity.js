const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const activitySchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      unique: true,
      trim: true
    },
    activityType: {
      type: String,
      enum: ['Call', 'Meeting', 'Email', 'Task'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    activityDate: {
      type: Date,
      required: true
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['Planned', 'Completed', 'Cancelled'],
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

activitySchema.plugin(paginate);

activitySchema.pre('save', function buildActivityId(next) {
  if (!this.activityId) {
    this.activityId = `ACT-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
