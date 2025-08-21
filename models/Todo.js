const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titlul este obligatoriu'],
    trim: true,
    maxlength: [200, 'Titlul nu poate depăși 200 de caractere']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrierea nu poate depăși 1000 de caractere']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag-ul nu poate depăși 20 de caractere']
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

// Index pentru căutare eficientă
todoSchema.index({ user: 1, status: 1 });
todoSchema.index({ user: 1, dueDate: 1 });
todoSchema.index({ user: 1, priority: 1 });
todoSchema.index({ user: 1, createdAt: -1 });

// Metodă pentru a marca todo ca completat
todoSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Metodă pentru a marca todo ca în progres
todoSchema.methods.markAsInProgress = function() {
  this.status = 'in_progress';
  this.completedAt = null;
  return this.save();
};

// Metodă pentru a anula todo
todoSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.completedAt = null;
  return this.save();
};

// Metodă pentru a verifica dacă todo este întârziat
todoSchema.methods.isOverdue = function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
};

// Metodă pentru a obține progresul (pentru todo-uri în progres)
todoSchema.methods.getProgress = function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'pending') return 0;
  if (this.status === 'in_progress') return 50;
  return 0;
};

// Metodă pentru a obține durata până la scadență
todoSchema.methods.getTimeUntilDue = function() {
  if (!this.dueDate) return null;
  
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = due - now;
  
  if (diff <= 0) return 'Întârziat';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} zile`;
  if (hours > 0) return `${hours} ore`;
  return 'Mai puțin de o oră';
};

module.exports = mongoose.model('Todo', todoSchema); 