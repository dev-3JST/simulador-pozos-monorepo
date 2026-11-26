-- ==========================================
-- SEED INICIAL: ESTRUCTURA DE LA BASE DE DATOS
-- ==========================================

CREATE DATABASE IF NOT EXISTS simulador_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE simulador_db;

-- Tabla 1: Pozos
CREATE TABLE IF NOT EXISTS pozos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    nivel_estatico_m DECIMAL(10,2) NOT NULL,
    nivel_dinamico_m DECIMAL(10,2) NOT NULL,
    diametro_pulgadas DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla 2: Bombas (Catálogo de equipos)
CREATE TABLE IF NOT EXISTS bombas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    potencia_hp DECIMAL(5,2) NOT NULL,
    caudal_max_lpm DECIMAL(10,2) NOT NULL,
    altura_max_m DECIMAL(10,2) NOT NULL,
    eficiencia_nominal DECIMAL(5,2) NOT NULL
);

-- Tabla 3: Simulaciones (Historial de cálculos)
CREATE TABLE IF NOT EXISTS simulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pozo_id INT NOT NULL,
    bomba_id INT NOT NULL,
    horas_diarias DECIMAL(5,2) NOT NULL,
    caudal_extraccion_lpm DECIMAL(10,2) NOT NULL,
    consumo_kwh_dia DECIMAL(10,2) NOT NULL,
    costo_mensual_usd DECIMAL(10,2) NOT NULL,
    eficiencia_hidraulica DECIMAL(5,2) NOT NULL,
    estado_alerta ENUM('Óptimo', 'Alerta tarifaria', 'Nivel estable', 'Alerta crítica') NOT NULL,
    fecha_simulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pozo_id) REFERENCES pozos(id),
    FOREIGN KEY (bomba_id) REFERENCES bombas(id)
);

-- Tabla 4: Tarifas (Tramos tarifarios eléctricos)
CREATE TABLE IF NOT EXISTS tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tramo VARCHAR(50) NOT NULL,
    consumo_min_kwh DECIMAL(10,2) NOT NULL,
    consumo_max_kwh DECIMAL(10,2) NOT NULL,
    precio_kwh_usd DECIMAL(10,4) NOT NULL
);
