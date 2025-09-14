const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['read', 'write', 'admin'],
    required: true
  }
}, { _id: false });

const diagramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: [permissionSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
diagramSchema.index({ owner: 1 });
diagramSchema.index({ 'permissions.user': 1 });
diagramSchema.index({ isPublic: 1 });
diagramSchema.index({ owner: 1, createdAt: -1 });

// Update timestamp on save
diagramSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Diagram', diagramSchema);