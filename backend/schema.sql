-- ===================================================================
-- Laboratorio #2 - Caso 5: Tienda online con inventario, cupones y envíos
-- Base de datos: SQLite con llaves foráneas y restricciones
-- ===================================================================

PRAGMA foreign_keys = ON;

-- Limpieza de tablas previas (en orden inverso de dependencias)
DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS cupones;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS productos;

-- 1. Tabla de Productos
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria TEXT NOT NULL
);

-- 2. Tabla de Clientes
CREATE TABLE clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    ciudad TEXT NOT NULL
);

-- 3. Tabla de Cupones
CREATE TABLE cupones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    porcentaje REAL NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    vigente_hasta TEXT NOT NULL, -- Formato YYYY-MM-DD
    usos_maximos INTEGER NOT NULL CHECK (usos_maximos > 0)
);

-- 4. Tabla de Órdenes
CREATE TABLE ordenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    cupon_id INTEGER REFERENCES cupones(id),
    estado TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'pagada', 'enviada', 'entregada', 'cancelada')),
    fecha TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    subtotal REAL NOT NULL CHECK (subtotal >= 0),
    descuento REAL NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    envio REAL NOT NULL DEFAULT 0 CHECK (envio >= 0),
    total REAL NOT NULL CHECK (total >= 0)
);

-- 5. Tabla de Items de Orden
CREATE TABLE orden_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario REAL NOT NULL CHECK (precio_unitario > 0)
);

-- ===================================================================
-- DATOS SEMILLA (SEEDS)
-- ===================================================================

-- Productos tecnológicos
INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
('Teclado Mecánico RGB Pro', 'Switches mecánicos táctiles, retroiluminación RGB configurable y chasis de aluminio.', 45000, 15, 'Periféricos'),
('Mouse Inalámbrico Ergonómico', 'Sensor óptico de alta precisión 16000 DPI, diseño ergonómico para largas sesiones.', 28000, 20, 'Periféricos'),
('Monitor Curvo 27" 165Hz', 'Panel VA FHD con curvatura 1500R, tasa de refresco 165Hz y 1ms de respuesta.', 165000, 8, 'Monitores'),
('Laptop Gamer Nitro 16', 'Procesador Intel i7 13th Gen, 16GB DDR5, SSD 1TB NVMe y GPU RTX 4060.', 795000, 5, 'Computadoras'),
('Auriculares Gaming 7.1', 'Sonido envolvente 7.1 virtual, micrófono con cancelación de ruido y almohadillas viscoelásticas.', 38000, 12, 'Audio'),
('Silla Ergonómica Pro Gamer', 'Soporte lumbar ajustable 3D, reposabrazos 4D y mecanismo de inclinación hasta 165°.', 145000, 6, 'Mobiliario'),
('SSD NVMe 1TB Gen4', 'Velocidad de lectura secuencial de hasta 7000 MB/s con disipador de grafeno integrado.', 55000, 25, 'Componentes'),
('Webcam 4K Ultra HD', 'Resolución 4K a 30fps con autofoco inteligente, sensor HDR y micrófonos duales integrados.', 48000, 10, 'Accesorios');

-- Clientes en distintas ciudades
INSERT INTO clientes (nombre, email, ciudad) VALUES
('Mauricio Vargas', 'mauricio@techstore.cr', 'San José'),
('Valeria Solano', 'valeria@techstore.cr', 'Heredia'),
('Carlos Mendoza', 'carlos@techstore.cr', 'Alajuela'),
('Sofía Navarro', 'sofia@techstore.cr', 'Cartago'),
('Esteban Romero', 'esteban@techstore.cr', 'Puntarenas'),
('Mariana Castro', 'mariana@techstore.cr', 'Liberia');

-- Cupones de descuento
INSERT INTO cupones (codigo, porcentaje, vigente_hasta, usos_maximos) VALUES
('TECH10', 10, '2026-12-31', 50),
('SUPER20', 20, '2026-12-31', 10),
('GAMER15', 15, '2026-12-31', 25),
('EXPIRED50', 50, '2023-01-01', 5),    -- Para pruebas de error 409 (vencido)
('LIMITADO1', 10, '2026-12-31', 1);    -- Para pruebas de usos máximos agotados

-- Órdenes históricas para alimentar métricas iniciales
-- Orden 1: Entregada (Cliente 1: Mauricio, sin cupón, subtotal > 30000 -> envio gratis)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(1, 1, NULL, 'entregada', '2026-10-15 10:30:00', 73000, 0, 0, 73000);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 45000),
(1, 2, 1, 28000);

-- Orden 2: Pagada (Cliente 2: Valeria, con cupón TECH10, subtotal 165000, descuento 16500, envio gratis)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(2, 2, 1, 'pagada', '2026-10-18 14:15:00', 165000, 16500, 0, 148500);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(2, 3, 1, 165000);

-- Orden 3: Entregada (Cliente 3: Carlos Mendoza, Alajuela, producto barato 28000 + envio 2500)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(3, 3, NULL, 'entregada', '2026-10-19 11:00:00', 28000, 0, 2500, 30500);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(3, 2, 1, 28000);

-- Orden 4: Cancelada (Cliente 4: Sofía Navarro, con cupón SUPER20)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(4, 4, 2, 'cancelada', '2026-10-20 09:00:00', 45000, 9000, 2500, 38500);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(4, 1, 1, 45000);
