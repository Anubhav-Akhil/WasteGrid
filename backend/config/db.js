import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_waste');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('Please ensure MongoDB is installed and running locally.');
    console.warn('Command to start MongoDB on Windows: net start MongoDB');
    console.warn('Or customize MONGO_URI in backend/.env');
    console.warn('======================================================\n');
    return false;
  }
};

export default connectDB;
