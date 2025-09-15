// =======================================================
// CARRITO.JS - Funcionalidad completa del carrito de compras
// =======================================================

// Variables globales
let carrito = [];
const ENVIO_GRATIS_MINIMO = 150000; // $150.000 COP
const COSTO_ENVIO = 15000; // $15.000 COP

// =======================================================
// UTILIDADES GENERALES
// =======================================================

/**
 * Formatea un precio en formato de moneda colombiana
 * @param {number} precio - Precio en USD
 * @returns {string} - Precio formateado en COP
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio * 3800); // Conversión USD a COP
}

/**
 * Muestra una notificación al usuario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error, info)
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
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

// =======================================================
// GESTIÓN DEL CARRITO (localStorage)
// =======================================================

/**
 * Carga el carrito desde localStorage
 */
function cargarCarrito() {
    try {
        const carritoStorage = localStorage.getItem('carrito');
        carrito = carritoStorage ? JSON.parse(carritoStorage) : [];
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        carrito = [];
    }
}

/**
 * Guarda el carrito en localStorage
 */
function guardarCarrito() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
    } catch (error) {
        console.error('Error al guardar carrito:', error);
        mostrarNotificacion('Error al guardar el carrito', 'error');
    }
}

/**
 * Obtiene la cantidad total de productos en el carrito
 * @returns {number} - Cantidad total de productos
 */
function obtenerCantidadTotal() {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Calcula el subtotal del carrito
 * @returns {number} - Subtotal en COP
 */
function calcularSubtotal() {
    return carrito.reduce((total, item) => total + (item.price * item.cantidad * 3800), 0);
}

/**
 * Calcula el costo de envío
 * @param {number} subtotal - Subtotal del pedido
 * @returns {number} - Costo de envío
 */
function calcularEnvio(subtotal) {
    return subtotal >= ENVIO_GRATIS_MINIMO ? 0 : COSTO_ENVIO;
}

// =======================================================
// MANIPULACIÓN DEL CARRITO
// =======================================================

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {string} id - ID del producto
 * @param {number} nuevaCantidad - Nueva cantidad
 */
function actualizarCantidad(id, nuevaCantidad) {
    const producto = carrito.find(item => item.id === id);
    
    if (!producto) {
        mostrarNotificacion('Producto no encontrado en el carrito', 'error');
        return;
    }
    
    if (nuevaCantidad <= 0) {
        eliminarProducto(id);
        return;
    }
    
    if (nuevaCantidad > 10) {
        mostrarNotificacion('Cantidad máxima: 10 unidades', 'error');
        return;
    }
    
    producto.cantidad = nuevaCantidad;
    guardarCarrito();
    renderizarCarrito();
    mostrarNotificacion('Cantidad actualizada', 'success');
}

/**
 * Elimina un producto del carrito
 * @param {string} id - ID del producto a eliminar
 */
function eliminarProducto(id) {
    const index = carrito.findIndex(item => item.id === id);
    
    if (index === -1) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    const producto = carrito[index];
    carrito.splice(index, 1);
    guardarCarrito();
    renderizarCarrito();
    mostrarNotificacion(`${producto.name} eliminado del carrito`, 'success');
}

/**
 * Vacía completamente el carrito
 */
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        mostrarNotificación('Carrito vaciado', 'success');
    }
}

// =======================================================
// RENDERIZADO DE LA INTERFAZ
// =======================================================

/**
 * Actualiza el contador del carrito en la navegación
 */
function actualizarContadorCarrito() {
    const contador = document.getElementById('carrito-count');
    if (!contador) return;
    
    const cantidadTotal = obtenerCantidadTotal();
    
    if (cantidadTotal > 0) {
        contador.textContent = cantidadTotal > 99 ? '99+' : cantidadTotal;
        contador.style.display = 'flex';
    } else {
        contador.style.display = 'none';
    }
}

/**
 * Crea el HTML para un producto del carrito
 * @param {Object} producto - Objeto del producto
 * @returns {string} - HTML del producto
 */
function crearHTMLProducto(producto) {
    const precio = formatearPrecio(producto.price);
    const subtotalProducto = formatearPrecio(producto.price * producto.cantidad);
    
    return `
        <div class="carrito-item" data-id="${producto.id}">
            <img src="${producto.image}" alt="${producto.name}" class="item-imagen" 
                 onerror="this.src='https://via.placeholder.com/120x80/333/fff?text=Sin+Imagen'">
            
            <div class="item-info">
                <h3>${producto.name}</h3>
                <div class="item-precio">
                    ${precio} c/u
                </div>
                <div class="item-subtotal" style="color: var(--primary-orange); font-weight: bold; margin-top: 5px;">
                    Subtotal: ${subtotalProducto}
                </div>
            </div>
            
            <div class="cantidad-controls">
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', -1)" 
                        ${producto.cantidad <= 1 ? 'disabled' : ''}>-</button>
                <input type="number" value="${producto.cantidad}" min="1" max="10" 
                       class="cantidad-input" readonly>
                <button class="btn-cantidad" onclick="cambiarCantidad('${producto.id}', 1)" 
                        ${producto.cantidad >= 10 ? 'disabled' : ''}>+</button>
            </div>
            
            <button class="btn-eliminar" onclick="eliminarProducto('${producto.id}')" 
                    title="Eliminar producto">
                🗑️
            </button>
        </div>
    `;
}

/**
 * Renderiza todo el carrito en la interfaz
 */
function renderizarCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const listaProductos = document.getElementById('lista-productos-carrito');
    
    if (!carritoVacio || !carritoContenido || !listaProductos) {
        console.error('Elementos del carrito no encontrados');
        return;
    }
    
    if (carrito.length === 0) {
        // Mostrar carrito vacío
        carritoVacio.style.display = 'block';
        carritoContenido.style.display = 'none';
    } else {
        // Mostrar carrito con productos
        carritoVacio.style.display = 'none';
        carritoContenido.style.display = 'grid';
        
        // Renderizar lista de productos
        listaProductos.innerHTML = carrito.map(producto => crearHTMLProducto(producto)).join('');
        
        // Actualizar resumen
        actualizarResumen();
    }
    
    // Actualizar contador
    actualizarContadorCarrito();
}

/**
 * Actualiza el resumen del pedido
 */
function actualizarResumen() {
    const cantidadTotal = obtenerCantidadTotal();
    const subtotal = calcularSubtotal();
    const costoEnvio = calcularEnvio(subtotal);
    const total = subtotal + costoEnvio;
    
    // Actualizar elementos del DOM
    const elementos = {
        'total-productos': cantidadTotal,
        'subtotal': formatearPrecio(subtotal / 3800), // Convertir de vuelta a USD para el formato
        'costo-envio': costoEnvio === 0 ? 'Gratis' : formatearPrecio(costoEnvio / 3800),
        'descuento': '$0', // Por ahora sin descuentos
        'total-final': formatearPrecio(total / 3800)
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
    
    // Habilitar/deshabilitar botón de compra
    const btnProcesar = document.getElementById('btn-procesar-compra');
    if (btnProcesar) {
        btnProcesar.disabled = carrito.length === 0;
    }
}

// =======================================================
// EVENT HANDLERS
// =======================================================

/**
 * Cambia la cantidad de un producto
 * @param {string} id - ID del producto
 * @param {number} cambio - Cambio en la cantidad (+1 o -1)
 */
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);
    if (!producto) return;
    
    const nuevaCantidad = producto.cantidad + cambio;
    actualizarCantidad(id, nuevaCantidad);
}

/**
 * Procesa la compra
 */
function procesarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    const cantidadTotal = obtenerCantidadTotal();
    const total = calcularSubtotal() + calcularEnvio(calcularSubtotal());
    
    // Simular procesamiento de compra
    const btnProcesar = document.getElementById('btn-procesar-compra');
    btnProcesar.disabled = true;
    btnProcesar.textContent = 'Procesando...';
    
    setTimeout(() => {
        // Simular éxito de la compra
        mostrarNotificacion(
            `¡Compra realizada con éxito! Total: ${formatearPrecio(total / 3800)} - ${cantidadTotal} productos`,
            'success'
        );
        
        // Vaciar carrito después de la compra
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        
        // Restaurar botón
        btnProcesar.disabled = false;
        btnProcesar.textContent = '💳 Procesar Compra';
        
        // Opcional: redirigir a página de confirmación
        // setTimeout(() => {
        //     window.location.href = 'confirmacion.html';
        // }, 2000);
        
    }, 2000); // Simular 2 segundos de procesamiento
}

// =======================================================
// INICIALIZACIÓN
// =======================================================

/**
 * Inicializa la página del carrito
 */
function inicializarCarrito() {
    cargarCarrito();
    renderizarCarrito();
    
    // Event listener para el botón de procesar compra
    const btnProcesar = document.getElementById('btn-procesar-compra');
    if (btnProcesar) {
        btnProcesar.addEventListener('click', procesarCompra);
    }
    
    console.log('Carrito inicializado correctamente');
}

// =======================================================
// FUNCIONES GLOBALES (para uso desde otras páginas)
// =======================================================

/**
 * Función global para agregar producto al carrito desde otras páginas
 * @param {Object} producto - Producto a agregar
 * @param {number} cantidad - Cantidad a agregar
 */
window.agregarAlCarritoGlobal = function(producto, cantidad = 1) {
    cargarCarrito();
    
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            image: producto.image,
            cantidad: cantidad
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
};

/**
 * Función global para obtener el estado del carrito
 */
window.obtenerEstadoCarrito = function() {
    cargarCarrito();
    return {
        productos: carrito,
        cantidadTotal: obtenerCantidadTotal(),
        subtotal: calcularSubtotal()
    };
};

// =======================================================
// INICIALIZACIÓN AUTOMÁTICA
// =======================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarCarrito);

// Actualizar contador cuando se carga la página (para otras páginas)
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);

// Escuchar cambios en localStorage para sincronizar entre pestañas
window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') {
        cargarCarrito();
        if (document.getElementById('carrito-contenido')) {
            renderizarCarrito();
        } else {
            actualizarContadorCarrito();
        }
    }
});