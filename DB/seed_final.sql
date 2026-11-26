-- ==========================================
-- SEED FINAL: DATOS DE PRUEBA DEL PROYECTO
-- ==========================================

USE simulador_db;

-- Insertar Pozos
INSERT INTO pozos (nombre, ubicacion, nivel_estatico_m, nivel_dinamico_m, diametro_pulgadas) VALUES
('Pozo Norte-01', 'Sector Rural Norte', 50.00, 65.00, 6.00),
('Pozo Sur-02', 'Finca La Esperanza', 40.00, 65.00, 8.00);

-- Insertar Catálogo de Bombas
INSERT INTO bombas (marca, modelo, potencia_hp, caudal_max_lpm, altura_max_m, eficiencia_nominal) VALUES
('Grundfos', 'SP 5A-15', 3.00, 80.00, 120.00, 78.50),
('Franklin', '4ST 3.0', 3.00, 95.00, 110.00, 70.00),
('Pedrollo', '4SR 2.5', 2.00, 70.00, 80.00, 75.00);

-- Insertar Tarifas Eléctricas (Tramos)
INSERT INTO tarifas (nombre_tramo, consumo_min_kwh, consumo_max_kwh, precio_kwh_usd) VALUES
('Tramo 1 - Básico', 0.00, 100.00, 0.12),
('Tramo 2 - Medio', 100.01, 300.00, 0.18),
('Tramo 3 - Alto', 300.01, 99999.00, 0.25);

-- Insertar Simulaciones (Datos de la presentación)
INSERT INTO simulaciones (pozo_id, bomba_id, horas_diarias, caudal_extraccion_lpm, consumo_kwh_dia, costo_mensual_usd, eficiencia_hidraulica, estado_alerta) VALUES
(1, 1, 12.00, 80.00, 22.20, 66.60, 78.50, 'Óptimo'),
(2, 1, 8.00, 60.00, 15.00, 45.00, 76.00, 'Nivel estable'),
(1, 2, 14.00, 95.00, 35.00, 120.00, 70.00, 'Alerta tarifaria'),
(1, 3, 10.00, 70.00, 18.00, 54.00, 75.00, 'Óptimo');
