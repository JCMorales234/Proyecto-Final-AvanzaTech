const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productController');

const router = express.Router();

// Rutas principales para tu frontend
router.get('/', getAllProducts);           // GET /api/products - Para carrousel y catálogo
router.get('/search', searchProducts);     // GET /api/products/search?q=laptop - Para búsquedas
router.get('/:id', getProductById);        // GET /api/products/123 - Para página de detalles

// Rutas administrativas (para agregar/editar productos)
router.post('/', createProduct);           // POST /api/products - Crear producto
router.put('/:id', updateProduct);         // PUT /api/products/123 - Actualizar producto
router.delete('/:id', deleteProduct);      // DELETE /api/products/123 - Eliminar producto

module.exports = router;