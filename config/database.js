const mongoose = require('mongoose');
const { logError, logInfo } = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-list';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: process.env.MONGODB_OPTIONS_RETRY_WRITES === 'true',
      w: process.env.MONGODB_OPTIONS_W || 'majority',
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority', j: true },
    };

    await mongoose.connect(mongoURI, options);

    logInfo('MongoDB conectat cu succes', {
      uri: mongoURI.replace(/\/\/.*@/, '//***:***@'), // Ascunde credențialele în loguri
      options: {
        maxPoolSize: options.maxPoolSize,
        retryWrites: options.retryWrites,
        w: options.w,
      },
    });

    // Event listeners pentru monitoring
    mongoose.connection.on('connected', () => {
      logInfo('Mongoose conectat la MongoDB', { context: 'Database' });
    });

    mongoose.connection.on('error', (err) => {
      logError(err, { context: 'Mongoose Connection Error' });
    });

    mongoose.connection.on('disconnected', () => {
      logInfo('Mongoose deconectat de la MongoDB', { context: 'Database' });
    });

    mongoose.connection.on('reconnected', () => {
      logInfo('Mongoose reconectat la MongoDB', { context: 'Database' });
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logInfo('Mongoose conexiune închisă prin SIGINT', { context: 'Database' });
        process.exit(0);
      } catch (err) {
        logError(err, { context: 'Database Shutdown' });
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        logInfo('Mongoose conexiune închisă prin SIGTERM', { context: 'Database' });
        process.exit(0);
      } catch (err) {
        logError(err, { context: 'Database Shutdown' });
        process.exit(1);
      }
    });

    return mongoose.connection;
  } catch (error) {
    logError(error, { context: 'Database Connection' });
    process.exit(1);
  }
};

// Funcție pentru verificarea stării conexiunii
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return {
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
};

// Funcție pentru închiderea conexiunii
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logInfo('MongoDB deconectat cu succes', { context: 'Database' });
  } catch (error) {
    logError(error, { context: 'Database Disconnect' });
    throw error;
  }
};

// Funcție pentru resetarea bazei de date (doar pentru testing)
const resetDatabase = async () => {
  if (process.env.NODE_ENV === 'test') {
    try {
      await mongoose.connection.dropDatabase();
      logInfo('Baza de date resetată pentru testing', { context: 'Database' });
    } catch (error) {
      logError(error, { context: 'Database Reset' });
      throw error;
    }
  } else {
    throw new Error('Reset database permis doar în mediu de test');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  resetDatabase,
}; 