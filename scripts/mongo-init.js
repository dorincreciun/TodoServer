// Script de inițializare pentru MongoDB
// Acest script rulează automat când containerul MongoDB pornește pentru prima dată

print('Inițializare MongoDB pentru Todo List API...');

// Conectare la baza de date admin
db = db.getSiblingDB('admin');

// Creează utilizatorul pentru aplicație
db.createUser({
  user: 'todo_user',
  pwd: 'todo_password',
  roles: [
    {
      role: 'readWrite',
      db: 'todo-list'
    }
  ]
});

// Schimbă la baza de date todo-list
db = db.getSiblingDB('todo-list');

// Creează colecțiile cu validare
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'firstName', 'lastName'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        firstName: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        }
      }
    }
  }
});

db.createCollection('todos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'user'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        description: {
          bsonType: 'string',
          maxLength: 1000
        },
        status: {
          enum: ['pending', 'in_progress', 'completed', 'cancelled']
        },
        priority: {
          enum: ['low', 'medium', 'high', 'urgent']
        },
        user: {
          bsonType: 'objectId'
        }
      }
    }
  }
});

// Creează indexuri pentru performanță
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });
db.users.createIndex({ 'createdAt': -1 });

db.todos.createIndex({ 'user': 1, 'status': 1 });
db.todos.createIndex({ 'user': 1, 'dueDate': 1 });
db.todos.createIndex({ 'user': 1, 'priority': 1 });
db.todos.createIndex({ 'user': 1, 'createdAt': -1 });
db.todos.createIndex({ 'tags': 1 });

// Creează utilizator de test (opțional)
db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ6Kz6O', // password123
  firstName: 'Admin',
  lastName: 'User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Creează câteva todo-uri de test
db.todos.insertMany([
  {
    title: 'Configurare proiect',
    description: 'Configurare inițială a proiectului Todo List',
    status: 'completed',
    priority: 'high',
    user: db.users.findOne({ username: 'admin' })._id,
    tags: ['configurare', 'proiect'],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Implementare autentificare',
    description: 'Implementare sistem de autentificare JWT',
    status: 'in_progress',
    priority: 'high',
    user: db.users.findOne({ username: 'admin' })._id,
    tags: ['autentificare', 'jwt', 'securitate'],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Testare API',
    description: 'Testare endpoint-uri API',
    status: 'pending',
    priority: 'medium',
    user: db.users.findOne({ username: 'admin' })._id,
    tags: ['testare', 'api'],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB inițializat cu succes!');
print('Utilizator admin creat: admin@example.com / password123');
print('Colecții create: users, todos');
print('Indexuri create pentru performanță optimă'); 