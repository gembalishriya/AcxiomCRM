const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      unique: true,
      trim: true
    },
    leadCode: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },
    leadName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      trim: true,
      default: 'Unknown'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
      default: 'New'
    },
    expectedValue: {
      type: Number,
      default: 0,
      min: 0
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
    convertedCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    convertedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
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

leadSchema.plugin(paginate);

leadSchema.pre('save', function buildLeadId(next) {
  if (!this.leadId) {
    this.leadId = `LED-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
