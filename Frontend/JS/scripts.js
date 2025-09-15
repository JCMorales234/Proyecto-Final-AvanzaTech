document.addEventListener('DOMContentLoaded', () => {
    // Detectar automáticamente el entorno
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api'; // En Vercel, las rutas API son relativas

    // --- UTILIDADES ---
    function formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format((Number(precio) || 0) * 3800);
    }

    async function obtenerProductos(categoria) {
        try {
            const url = categoria
                ? `${API_BASE_URL}/products?category=${encodeURIComponent(categoria)}&featured=true` 
                : `${API_BASE_URL}/products?featured=true`;
            const resp = await fetch(url);
            const datos = await resp.json();
            if (!datos || !datos.success) throw new Error(datos?.message || 'Fallo de API');
            return Array.isArray(datos.data) ? datos.data : [];
        } catch (e) {
            console.error('Error cargando productos:', e);
            return [];
        }
    }

    // --- CLASE CAROUSEL ---
    class Carousel {
        constructor(tipo) {
            this.tipo = tipo;
            this.container = document.getElementById(`carrousel-${this.tipo}`);
            this.motor = document.getElementById(`motor-${this.tipo}`);
            
            if (!this.container || !this.motor) {
                console.error(`Elementos del carrusel no encontrados para el tipo: ${tipo}`);
                return;
            }

            this.state = {
                items: [],
                indice: 0,
                visibles: 1,
                pasoPx: 320,
                moviendose: false,
                intervalo: null,
            };

            this.debouncedResize = null;
            this.setupEventListeners();
        }

        setupEventListeners() {
            window.addEventListener('resize', () => {
                clearTimeout(this.debouncedResize);
                this.debouncedResize = setTimeout(() => this.reinit(), 250);
            });
            
            window.addEventListener('beforeunload', () => this.pausarAuto());
        }

        tarjetaProducto(producto) {
            const id = producto._id || producto.id || '';
            const img = producto.image || producto.img || '';
            const nombre = producto.name || producto.title || 'Producto';
            const precio = formatearPrecio(producto.price || producto.precio || 0);
            return `
                <div class="item-carrousel" data-id="${id}">
                    <div class="producto-imagen-container">
                        <img src="${img}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/280x180/333/fff?text=Sin+Imagen'" />
                    </div>
                    <div class="producto-contenido"><h4>${nombre}</h4><div class="precio">${precio}</div></div>
                    <div class="producto-acciones"><button class="btn-ver-detalles" data-id="${id}">Ver Detalles</button></div>
                </div>
            `;
        }

        render() {
            this.motor.innerHTML = this.state.items.map(p => this.tarjetaProducto(p)).join('');
        }

        medir() {
            const itemEjemplo = this.motor.querySelector('.item-carrousel');
            if (!itemEjemplo) {
                this.state.visibles = 1;
                this.state.pasoPx = 320;
                return;
            }
            const w = itemEjemplo.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(this.motor).columnGap || '0');
            this.state.pasoPx = w + gap;

            const anchoVisible = this.container.clientWidth;
            this.state.visibles = Math.max(1, Math.floor(anchoVisible / this.state.pasoPx));
        }

        aplicarTransform() {
            this.motor.style.transform = `translateX(-${this.state.indice * this.state.pasoPx}px)`;
        }

        actualizarBotones() {
            const wrapper = this.container.closest('.carrousel-wrapper');
            if (!wrapper) return;
            const btnIzq = wrapper.querySelector('.btn-izquierda-carrousel');
            const btnDer = wrapper.querySelector('.btn-derecha-carrousel');
            if (!btnIzq || !btnDer) return;

            const { indice, items, visibles } = this.state;
            const deshabilitar = items.length <= visibles;
            const maxIndice = Math.max(0, items.length - visibles);

            btnIzq.disabled = deshabilitar || indice <= 0;
            btnDer.disabled = deshabilitar || indice >= maxIndice;
        }

        init(items) {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.remove();

            if (!items || items.length === 0) {
                this.motor.innerHTML = `<div class="error">No hay ${this.tipo} para mostrar.</div>`;
                this.state.items = [];
                this.actualizarBotones();
                return;
            }

            this.state.items = [...items];
            this.state.indice = 0;
            
            this.render();
            this.medir();
            this.aplicarTransform();
            this.actualizarBotones();
            this.iniciarAuto();
        }
        
        reinit() {
            if (this.state.items.length > 0) {
                this.pausarAuto();
                this.init(this.state.items);
            }
        }

        move(dir) {
            if (this.state.moviendose || this.state.items.length <= this.state.visibles) return;

            this.pausarAuto();
            this.state.moviendose = true;

            const { indice, items, visibles } = this.state;
            const maxIndice = Math.max(0, items.length - visibles);
            
            let nuevoIndice = indice + dir;
            
            // Limitar el índice a los bordes
            nuevoIndice = Math.max(0, Math.min(nuevoIndice, maxIndice));

            if (nuevoIndice === this.state.indice) {
                this.state.moviendose = false;
                this.reanudarAuto();
                return;
            }

            this.state.indice = nuevoIndice;
            this.aplicarTransform();
            this.actualizarBotones();

            setTimeout(() => {
                this.state.moviendose = false;
                this.reanudarAuto();
            }, 500);
        }

        iniciarAuto() {
            this.pausarAuto();
            this.state.intervalo = setInterval(() => {
                const { items, visibles } = this.state;
                if (items.length <= visibles) return;

                const maxIndice = Math.max(0, items.length - visibles);

                if (this.state.indice >= maxIndice) {
                    this.state.indice = 0; // Reiniciar al llegar al final
                } else {
                    this.state.indice++; // Avanzar
                }
                
                this.aplicarTransform();
                this.actualizarBotones();

            }, 4000);
        }

        pausarAuto() {
            if (this.state.intervalo) clearInterval(this.state.intervalo);
        }

        reanudarAuto() {
            // No reanudar si el usuario acaba de interactuar
            setTimeout(() => this.iniciarAuto(), 5000); // Aumentar tiempo de espera
        }
    }

    // --- INICIALIZACIÓN DE LA PÁGINA ---
    async function inicializarPagina() {
        const carousels = {};

        const [laptops, todos] = await Promise.all([
            obtenerProductos('laptops'),
            obtenerProductos(),
        ]);
        const accesorios = todos.filter(p => (p.category || '').toLowerCase() !== 'laptops');

        carousels['laptops'] = new Carousel('laptops');
        carousels['laptops'].init(laptops);

        carousels['accesorios'] = new Carousel('accesorios');
        carousels['accesorios'].init(accesorios);

        // Listener global para todos los eventos de click
        document.body.addEventListener('click', (e) => {
            // Navegación de carrusel
            const btn = e.target.closest('button.btn-carrousel[data-tipo]');
            if (btn) {
                const tipo = btn.dataset.tipo;
                const carousel = carousels[tipo];
                if (carousel) {
                    const dir = btn.classList.contains('btn-izquierda-carrousel') ? -1 : 1;
                    carousel.move(dir);
                }
                return;
            }

            // Navegación a detalles de producto
            const card = e.target.closest('.item-carrousel[data-id], .btn-ver-detalles[data-id]');
            if (card && card.dataset.id) {
                window.location.href = `details.html?id=${encodeURIComponent(card.dataset.id)}`;
            }
        });
    }

    inicializarPagina();
});
