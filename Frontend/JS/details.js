// Configuración de la API - Detecta automáticamente el entorno
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api'; // En Vercel, las rutas API son relativas

// Variables globales
let productoActual = null;
let cantidadSeleccionada = 1;

// Función para obtener el ID del producto desde la URL
function obtenerIdProducto() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Función para obtener producto por ID
async function obtenerProductoPorId(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Error al cargar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Función para formatear precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio * 3800); // Conversión aproximada USD a COP
}

// Función para mostrar el producto
function mostrarProducto(producto) {
    productoActual = producto;
    
    // Actualizar elementos del DOM
    document.getElementById('producto-img').src = producto.image;
    document.getElementById('producto-img').alt = producto.name;
    document.getElementById('producto-titulo').textContent = producto.name;
    document.getElementById('producto-precio-valor').textContent = formatearPrecio(producto.price);
    document.getElementById('producto-descripcion-texto').textContent = producto.description;
    
    // Actualizar título de la página
    document.title = `${producto.name} - NexusTech`;
    
    // Mostrar especificaciones si existen
    if (producto.specifications && Object.keys(producto.specifications).length > 0) {
        const specsGrid = document.querySelector('.specs-grid');
        specsGrid.innerHTML = '';
        
        Object.entries(producto.specifications).forEach(([key, value]) => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <strong>${key}:</strong>
                <span>${value}</span>
            `;
            specsGrid.appendChild(specItem);
        });
    } else {
        // Si no hay especificaciones, crear algunas básicas basadas en la descripción
        const specsGrid = document.querySelector('.specs-grid');
        specsGrid.innerHTML = `
            <div class="spec-item">
                <strong>Categoría:</strong>
                <span>${producto.category || 'Tecnología'}</span>
            </div>
            <div class="spec-item">
                <strong>Estado:</strong>
                <span>Nuevo</span>
            </div>
            <div class="spec-item">
                <strong>Garantía:</strong>
                <span>1 año</span>
            </div>
        `;
    }
    
    // Mostrar el producto y ocultar loading
    document.querySelector('.loading-details').style.display = 'none';
    document.getElementById('producto-detalle').style.display = 'flex';
}

// Función para mostrar error
function mostrarError() {
    document.querySelector('.loading-details').style.display = 'none';
    document.getElementById('error-producto').style.display = 'block';
}

// Función para cambiar cantidad
function cambiarCantidad(incremento) {
    const cantidadInput = document.getElementById('cantidad');
    const nuevaCantidad = cantidadSeleccionada + incremento;
    
    if (nuevaCantidad >= 1 && nuevaCantidad <= 10) {
        cantidadSeleccionada = nuevaCantidad;
        cantidadInput.value = cantidadSeleccionada;
    }
}

// Función para agregar al carrito
function agregarAlCarrito() {
    if (!productoActual) return;
    
    // Obtener carrito actual del localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Buscar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === productoActual._id);
    
    if (productoExistente) {
        // Si existe, actualizar cantidad
        productoExistente.cantidad += cantidadSeleccionada;
    } else {
        // Si no existe, agregarlo
        carrito.push({
            id: productoActual._id,
            name: productoActual.name,
            price: productoActual.price,
            image: productoActual.image,
            cantidad: cantidadSeleccionada
        });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Mostrar confirmación
    mostrarNotificacion('Producto agregado al carrito correctamente', 'success');
    
    // Resetear cantidad
    cantidadSeleccionada = 1;
    document.getElementById('cantidad').value = 1;
}

// Función para comprar ahora
function comprarAhora() {
    // Primero agregar al carrito
    agregarAlCarrito();
    
    // Luego redirigir a la página de compra
    setTimeout(() => {
        window.location.href = 'buy.html';
    }, 1000);
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar notificación
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Función para manejar errores de imagen
function manejarErrorImagen(img) {
    img.src = 'https://via.placeholder.com/600x400/333/fff?text=Imagen+No+Disponible';
}

// Inicializar página
async function inicializarPagina() {
    const productId = obtenerIdProducto();
    
    if (!productId) {
        mostrarError();
        return;
    }
    
    const producto = await obtenerProductoPorId(productId);
    
    if (producto) {
        mostrarProducto(producto);
    } else {
        mostrarError();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', inicializarPagina);

// Manejar error de imagen
document.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById('producto-img');
    img.onerror = () => manejarErrorImagen(img);
});