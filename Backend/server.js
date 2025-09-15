const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Importar rutas
const productRoutes = require('./routes/products');

// Usar rutas
app.use('/api/products', productRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Nexus Tech funcionando correctamente' });
});

// Para Vercel, exportamos la app en lugar de escuchar un puerto
module.exports = app;

// Solo escuchar puerto si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}