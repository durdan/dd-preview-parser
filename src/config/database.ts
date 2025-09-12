import mongoose from 'mongoose';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diagram-app';
  
  return {
    uri,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  };
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const config = getDatabaseConfig();
    await mongoose.connect(config.uri, config.options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});