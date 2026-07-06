import express from 'express';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuarioRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/usuarios', usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Hello, World!`);
});

