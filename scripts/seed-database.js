#!/usr/bin/env node

/**
 * Script pentru popularea bazei de date cu date de test
 * Folosit pentru development și testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../config/logger');

// Importă modelele
const User = require('../models/User');
const Todo = require('../models/Todo');

const seedDatabase = async () => {
  try {
    logInfo('Începere populare bază de date...', { context: 'Database Seed' });

    // Conectare la baza de date
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-list';
    await mongoose.connect(mongoUri);
    logInfo('Conectat la MongoDB', { context: 'Database Seed' });

    // Șterge datele existente
    await User.deleteMany({});
    await Todo.deleteMany({});
    logInfo('Datele existente au fost șterse', { context: 'Database Seed' });

    // Creează utilizatori de test
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: await bcrypt.hash('user123', 12),
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: await bcrypt.hash('user123', 12),
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    logInfo(`${createdUsers.length} utilizatori au fost creați`, { context: 'Database Seed' });

    // Creează todo-uri de test
    const todos = [
      {
        title: 'Configurare proiect',
        description: 'Configurare inițială a proiectului Todo List',
        status: 'completed',
        priority: 'high',
        user: createdUsers[0]._id,
        tags: ['configurare', 'proiect'],
        isPublic: false,
      },
      {
        title: 'Implementare autentificare',
        description: 'Implementare sistem de autentificare JWT',
        status: 'in_progress',
        priority: 'high',
        user: createdUsers[0]._id,
        tags: ['autentificare', 'jwt', 'securitate'],
        isPublic: false,
      },
      {
        title: 'Testare API',
        description: 'Testare endpoint-uri API',
        status: 'pending',
        priority: 'medium',
        user: createdUsers[0]._id,
        tags: ['testare', 'api'],
        isPublic: false,
      },
      {
        title: 'Dezvoltare frontend',
        description: 'Crearea interfeței utilizator',
        status: 'pending',
        priority: 'medium',
        user: createdUsers[1]._id,
        tags: ['frontend', 'ui', 'ux'],
        isPublic: true,
      },
      {
        title: 'Optimizare performanță',
        description: 'Optimizarea performanței aplicației',
        status: 'pending',
        priority: 'low',
        user: createdUsers[1]._id,
        tags: ['performanță', 'optimizare'],
        isPublic: false,
      },
      {
        title: 'Documentație API',
        description: 'Scrierea documentației pentru API',
        status: 'completed',
        priority: 'medium',
        user: createdUsers[2]._id,
        tags: ['documentație', 'api'],
        isPublic: true,
      },
      {
        title: 'Deployment producție',
        description: 'Deployment-ul aplicației pe serverul de producție',
        status: 'pending',
        priority: 'high',
        user: createdUsers[2]._id,
        tags: ['deployment', 'producție'],
        isPublic: false,
      },
    ];

    const createdTodos = await Todo.insertMany(todos);
    logInfo(`${createdTodos.length} todo-uri au fost create`, { context: 'Database Seed' });

    logInfo('Baza de date a fost populată cu succes', { context: 'Database Seed' });

    // Afișează informații despre datele create
    console.log('\n=== Date create ===');
    console.log(`Utilizatori: ${createdUsers.length}`);
    console.log(`Todo-uri: ${createdTodos.length}`);
    console.log('\n=== Credențiale de test ===');
    console.log('Admin: admin@example.com / admin123');
    console.log('User 1: user1@example.com / user123');
    console.log('User 2: user2@example.com / user123');

    // Închide conexiunea
    await mongoose.connection.close();
    logInfo('Conexiunea MongoDB închisă', { context: 'Database Seed' });

    process.exit(0);
  } catch (error) {
    logError(error, { context: 'Database Seed' });
    console.error('Eroare la popularea bazei de date:', error.message);
    process.exit(1);
  }
};

// Rulează scriptul dacă este apelat direct
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
