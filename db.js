import mongoose from 'mongoose';

const cached = globalThis._mongooseConn || (globalThis._mongooseConn = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in environment variables');

    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log('MongoDB connected:', mongooseInstance.connection.host);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
