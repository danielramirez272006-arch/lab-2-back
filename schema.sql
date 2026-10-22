-- ===================================================================
-- Laboratorio #2 - Caso 5: Tienda online de Estuches de Teléfonos (Tessel Cases)
-- Base de datos: SQLite con llaves foráneas y restricciones
-- ===================================================================

PRAGMA foreign_keys = ON;

-- Limpieza de tablas previas (en orden inverso de dependencias)
DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS cupones;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS productos;

-- 1. Tabla de Productos (Estuches y Protectores de Teléfonos)
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
-- DATOS SEMILLA (SEEDS): CATÁLOGO DE ESTUCHES DE TELÉFONOS
-- ===================================================================

INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
('Estuche Tessel MagSafe Cuero Nórdico', 'Cuero curtido vegetal de grano entero, compatible con carga magnética MagSafe y botones de aluminio mecanizado.', 28000, 15, 'MagSafe'),
('Estuche Tessel Armor Anticaídas 3M', 'Chasis bicapa de policarbonato con esquinas de amortiguación militar MIL-STD-810G y borde biselado para pantalla.', 22000, 20, 'Rugged'),
('Estuche Tessel Madera de Nogal & Titanio', 'Madera de nogal natural seleccionada a mano con chasis perimetral de aleación de titanio y textura cepillada.', 36000, 8, 'Madera & Metal'),
('Estuche Tessel Ultra-Slim Fibra de Carbono', 'Tejido aeroespacial de fibra de aramida 600D de solo 0.6mm de espesor, peso pluma y acabado mate antihuellas.', 32000, 5, 'Fibra de Carbono'),
('Estuche Tessel Silicona Soft-Touch', 'Silicona líquida con recubrimiento oleofóbico sedoso, forro interior de microfibra aterciopelada y agarre anti-deslizante.', 16000, 25, 'Silicona'),
('Estuche Tessel Cristal Transparente HD', 'Policarbonato óptico alemán con tecnología anti-amarilleo UV de 24 meses y borde amortiguador en las esquinas.', 18000, 18, 'Transparente'),
('Estuche Tessel Billetera Folio Magnética', 'Tapa abatible con 3 ranuras para tarjetas bancarias, protección de blindaje RFID y soporte horizontal para video.', 29000, 12, 'Billetera Folio'),
('Estuche Tessel Edición Especial Terrazzo', 'Compuesto de terrazo mineral pulido con partículas de cuarzo genuino y anillo MagSafe en cobalto anodizado.', 34000, 10, 'Edición Especial');

-- Clientes en distintas ciudades de Costa Rica
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
-- Orden 1: Entregada (Cliente 1: Mauricio, subtotal 50.000 >= 30.000 -> envio gratis)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(1, 1, NULL, 'entregada', '2026-10-15 10:30:00', 50000, 0, 0, 50000);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 28000),
(1, 2, 1, 22000);

-- Orden 2: Pagada (Cliente 2: Valeria, con cupón TECH10, subtotal 36000, desc 3600 -> envio gratis)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(2, 2, 1, 'pagada', '2026-10-18 14:15:00', 36000, 3600, 0, 32400);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(2, 3, 1, 36000);

-- Orden 3: Entregada (Cliente 3: Carlos Mendoza, Alajuela, producto 22000 < 30000 + envio 2500)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(3, 3, NULL, 'entregada', '2026-10-19 11:00:00', 22000, 0, 2500, 24500);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(3, 2, 1, 22000);

-- Orden 4: Cancelada (Cliente 4: Sofía Navarro, con cupón SUPER20)
INSERT INTO ordenes (id, cliente_id, cupon_id, estado, fecha, subtotal, descuento, envio, total) VALUES
(4, 4, 2, 'cancelada', '2026-10-20 09:00:00', 28000, 5600, 2500, 24900);
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(4, 1, 1, 28000);
