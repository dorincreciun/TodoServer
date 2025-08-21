#!/usr/bin/env node

/**
 * Script pentru resetarea bazei de date
 * Folosit pentru testing și development
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { logInfo, logError } = require('../config/logger');

const resetDatabase = async () => {
  try {
    logInfo('Începere resetare bază de date...', { context: 'Database Reset' });

    // Conectare la baza de date
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-list';
    await mongoose.connect(mongoUri);
    logInfo('Conectat la MongoDB', { context: 'Database Reset' });

    // Obține toate colecțiile
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Șterge toate colecțiile
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      logInfo(`Colecția ${collection.name} a fost ștearsă`, { context: 'Database Reset' });
    }

    logInfo('Baza de date a fost resetată cu succes', { context: 'Database Reset' });

    // Închide conexiunea
    await mongoose.connection.close();
    logInfo('Conexiunea MongoDB închisă', { context: 'Database Reset' });

    process.exit(0);
  } catch (error) {
    logError(error, { context: 'Database Reset' });
    console.error('Eroare la resetarea bazei de date:', error.message);
    process.exit(1);
  }
};

// Rulează scriptul dacă este apelat direct
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
