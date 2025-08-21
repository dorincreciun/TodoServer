const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username-ul este obligatoriu'],
    unique: true,
    trim: true,
    minlength: [3, 'Username-ul trebuie să aibă cel puțin 3 caractere'],
    maxlength: [30, 'Username-ul nu poate depăși 30 de caractere']
  },
  email: {
    type: String,
    required: [true, 'Email-ul este obligatoriu'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vă rugăm introduceți un email valid']
  },
  password: {
    type: String,
    required: [true, 'Parola este obligatorie'],
    minlength: [6, 'Parola trebuie să aibă cel puțin 6 caractere']
  },
  firstName: {
    type: String,
    required: [true, 'Prenumele este obligatoriu'],
    trim: true,
    maxlength: [50, 'Prenumele nu poate depăși 50 de caractere']
  },
  lastName: {
    type: String,
    required: [true, 'Numele este obligatoriu'],
    trim: true,
    maxlength: [50, 'Numele nu poate depăși 50 de caractere']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash parola înainte de salvare
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodă pentru compararea parolelor
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Metodă pentru a obține numele complet
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Metodă pentru a obține datele publice (fără parolă)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 