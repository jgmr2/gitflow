import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 5100;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  });
