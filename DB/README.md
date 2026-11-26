# Base de Datos — Simulador de Pozos de Agua

## Requisitos
- MySQL 8.x instalado.

## Estructura
La base de datos `simulador_db` contiene 4 tablas normalizadas:
- `pozos`: registros de pozos (niveles estático/dinámico, diámetro).
- `bombas`: catálogo de bombas sumergibles (marca, modelo, HP, eficiencia).
- `tarifas`: tramos tarifarios eléctricos (kWh).
- `simulaciones`: historial de cálculos (consumo, costo, alertas).

## Cómo levantar la base de datos (desde cero)

```bash
# 1. Crear estructura (tablas y base de datos)
mysql -u simulador_user -p < seed_inicial.sql

# 2. Insertar datos de prueba
mysql -u simulador_user -p simulador_db < seed_final.sql
