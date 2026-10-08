const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const opportunitySchema = new mongoose.Schema(
  {
    opportunityId: {
      type: String,
      unique: true,
      trim: true
    },
    opportunityName: {
      type: String,
      required: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    stage: {
      type: String,
      enum: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      default: 'Qualification'
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expectedCloseDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Won', 'Lost', 'Inactive'],
      default: 'Active'
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

opportunitySchema.plugin(paginate);

opportunitySchema.virtual('weightedValue').get(function weightedValue() {
  return Number(((this.amount || 0) * (this.probability || 0)) / 100);
});

opportunitySchema.set('toJSON', { virtuals: true });

opportunitySchema.pre('save', function buildOpportunityId(next) {
  if (!this.opportunityId) {
    this.opportunityId = `OPP-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
