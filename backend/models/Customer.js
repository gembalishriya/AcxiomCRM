const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      trim: true
    },
    customerCode: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Deactivated'],
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

customerSchema.plugin(paginate);

customerSchema.pre('save', function buildCustomerId(next) {
  if (!this.customerId) {
    this.customerId = `CUS-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
