const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB para poblar datos'))
  .catch(err => console.error('❌ Error:', err));

// Importar modelo (asegúrate de tener la ruta correcta)
const Product = require('../models/Product');

// Productos para Nexus Tech - Enfoque en laptops y accesorios
const sampleProducts = [
  // === LAPTOPS (Para carrousel de portátiles) ===
  {
    name: "MacBook Pro M3 14\"",
    description: "Laptop profesional con chip M3, 16GB RAM, 512GB SSD, pantalla Liquid Retina XDR",
    price: 3499.99,
    category: "laptops",
    stock: 8,
    featured: true,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
  },
  {
    name: "ASUS ROG Strix G15",
    description: "Laptop gaming AMD Ryzen 7, RTX 4060, 16GB RAM, 1TB SSD, pantalla 144Hz",
    price: 2299.99,
    category: "laptops",
    stock: 15,
    featured: true,
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400"
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Ultrabook premium Intel i7-13700H, 16GB LPDDR5, 512GB SSD, pantalla OLED 4K",
    price: 2799.99,
    category: "laptops",
    stock: 12,
    featured: true,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400"
  },
  {
    name: "HP Pavilion Gaming",
    description: "Laptop gaming económica AMD Ryzen 5, GTX 1650, 8GB RAM, 256GB SSD + 1TB HDD",
    price: 1199.99,
    category: "laptops",
    stock: 25,
    featured: true,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    description: "Laptop empresarial Intel i7, 16GB RAM, 1TB SSD, certificación militar, ultra liviana",
    price: 2899.99,
    category: "laptops",
    stock: 10,
    featured: true,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400"
  },
  {
    name: "MSI Creator Z16",
    description: "Laptop para creadores Intel i7, RTX 4070, 32GB RAM, 1TB SSD, pantalla táctil 4K",
    price: 3299.99,
    category: "laptops",
    stock: 7,
    featured: true,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400"
  },
  {
    name: "Acer Nitro 5",
    description: "Laptop gaming accesible Intel i5, RTX 3050, 16GB RAM, 512GB SSD, excelente relación precio-rendimiento",
    price: 1599.99,
    category: "laptops",
    stock: 30,
    featured: true,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400"
  },
  {
    name: "Surface Laptop Studio",
    description: "Laptop 2-en-1 Microsoft Intel i7, RTX A2000, 32GB RAM, 1TB SSD, pantalla táctil",
    price: 2799.99,
    category: "laptops",
    stock: 9,
    featured: true,
    image: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=400"
  },

  // === ACCESORIOS (Para carrousel de accesorios) ===
  {
    name: "Teclado Mecánico Razer BlackWidow V4",
    description: "Teclado mecánico gaming switches Green, RGB Chroma, reposamanos magnético",
    price: 189.99,
    category: "teclados",
    stock: 45,
    featured: true,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"
  },
  {
    name: "Mouse Logitech MX Master 3S",
    description: "Mouse inalámbrico profesional, sensor 8K DPI, batería 70 días, diseño ergonómico",
    price: 129.99,
    category: "mouse",
    stock: 60,
    featured: true,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"
  },
  {
    name: "Monitor LG 27\" 4K UltraFine",
    description: "Monitor 4K IPS 27 pulgadas, HDR400, USB-C, ideal para MacBook y profesionales",
    price: 649.99,
    category: "monitores",
    stock: 20,
    featured: true,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"
  },
  {
    name: "Audífonos Sony WH-1000XM5",
    description: "Audífonos inalámbricos con cancelación de ruido líder en la industria, 30h batería",
    price: 399.99,
    category: "audifonos",
    stock: 35,
    featured: true,
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
  },
  {
    name: "Webcam Logitech Brio 4K",
    description: "Webcam 4K Ultra HD con HDR, enfoque automático, corrección de luz, ideal streaming",
    price: 199.99,
    category: "accesorios",
    stock: 40,
    featured: true,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"
  },
  {
    name: "Hub USB-C 7 en 1",
    description: "Hub multipuerto USB-C con HDMI 4K, USB 3.0, lector SD, carga PD 100W",
    price: 79.99,
    category: "accesorios",
    stock: 50,
    featured: true,
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400"
  },
  {
    name: "Base Refrigerante RGB",
    description: "Base refrigerante para laptop con 5 ventiladores RGB, ajustable, hasta 17 pulgadas",
    price: 89.99,
    category: "accesorios",
    stock: 30,
    featured: true,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400"
  },
  {
    name: "SSD Externo Samsung T7 2TB",
    description: "SSD portable USB 3.2, velocidades hasta 1050 MB/s, resistente a golpes",
    price: 289.99,
    category: "componentes",
    stock: 25,
    featured: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  }
];

// Función para poblar la base de datos
const seedDatabase = async () => {
  try {
    // Limpiar productos existentes (opcional)
    await Product.deleteMany({});
    console.log('🗑️ Productos anteriores eliminados');

    // Insertar nuevos productos
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ ${products.length} productos creados exitosamente`);
    
    console.log('\n📦 Productos creados:');
    products.forEach(product => {
      console.log(`- ${product.name} - $${product.price} (${product.category})`);
    });

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
};

// Ejecutar el script
seedDatabase();