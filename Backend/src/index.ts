import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { testConnection, pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Probar conexión al iniciar
testConnection();

// RUTA: Obtener todos los pozos
app.get('/api/wells', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pozos');
    res.json(rows);
  } catch (error) {
    console.error('Error en /api/wells:', error);
    res.status(500).json({ error: 'Error al obtener los pozos' });
  }
});

// RUTA: Obtener equipos
app.get('/api/equipment', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bombas');
    res.json(rows);
  } catch (error) {
    console.error('Error en /api/equipment:', error);
    res.status(500).json({ error: 'Error al obtener los equipos' });
  }
});

// RUTA: Simular y guardar
app.post('/api/simulate', async (req, res) => {
  try {
    const { pozo_id, bomba_id, horas_diarias, caudal_extraccion_lpm } = req.body;

    const [bombas]: any = await pool.query('SELECT * FROM bombas WHERE id = ?', [bomba_id]);
    if (bombas.length === 0) {
      return res.status(404).json({ error: 'Bomba no encontrada' });
    }
    const bomba = bombas[0];

    const potencia_kw = Number(bomba.potencia_hp) * 0.746;
    const consumo_kwh_dia = potencia_kw * Number(horas_diarias);
    const tarifa_promedio = 1.00;
    const costo_mensual_usd = consumo_kwh_dia * 30 * tarifa_promedio;

    let estado_alerta = 'Óptimo';
    if (consumo_kwh_dia > 30) estado_alerta = 'Alerta tarifaria';
    if (consumo_kwh_dia > 40) estado_alerta = 'Alerta crítica';

    const [result]: any = await pool.query(
      `INSERT INTO simulaciones 
       (pozo_id, bomba_id, horas_diarias, caudal_extraccion_lpm, consumo_kwh_dia, costo_mensual_usd, eficiencia_hidraulica, estado_alerta) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pozo_id,
        bomba_id,
        horas_diarias,
        caudal_extraccion_lpm,
        consumo_kwh_dia,
        costo_mensual_usd,
        bomba.eficiencia_nominal,
        estado_alerta,
      ]
    );

    res.json({
      id: result.insertId,
      consumo_kwh_dia: consumo_kwh_dia.toFixed(2),
      costo_mensual_usd: costo_mensual_usd.toFixed(2),
      estado_alerta,
      eficiencia_hidraulica: bomba.eficiencia_nominal,
    });
  } catch (error) {
    console.error('Error en simulación:', error);
    res.status(500).json({ error: 'Error al procesar la simulación' });
  }
});

// RUTA: Historial de simulaciones
app.get('/api/simulations', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.horas_diarias,
        s.caudal_extraccion_lpm,
        s.consumo_kwh_dia,
        s.costo_mensual_usd,
        s.eficiencia_hidraulica,
        s.estado_alerta,
        s.fecha_simulacion,
        p.nombre AS pozo_nombre,
        b.marca AS bomba_marca,
        b.modelo AS bomba_modelo
      FROM simulaciones s
      JOIN pozos p ON s.pozo_id = p.id
      JOIN bombas b ON s.bomba_id = b.id
      ORDER BY s.fecha_simulacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error en /api/simulations:', error);
    res.status(500).json({ error: 'Error al obtener simulaciones' });
  }
});

// RUTA: Eliminar una simulación
app.delete('/api/simulations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM simulaciones WHERE id = ?', [id]);
    res.json({ success: true, message: 'Simulación eliminada' });
  } catch (error) {
    console.error('Error al eliminar simulación:', error);
    res.status(500).json({ error: 'Error al eliminar la simulación' });
  }
});

// RUTA raíz
app.get('/', (_req, res) => {
  res.send('Backend de Pozos funcionando. Prueba /api/wells');
});

// RUTA: Crear un nuevo pozo
app.post('/api/wells', async (req, res) => {
  try {
    const { nombre, ubicacion, nivel_estatico_m, nivel_dinamico_m, diametro_pulgadas } = req.body;
    if (!nombre || !ubicacion) {
      return res.status(400).json({ error: 'Nombre y ubicación son obligatorios' });
    }
    const [result]: any = await pool.query(
      `INSERT INTO pozos (nombre, ubicacion, nivel_estatico_m, nivel_dinamico_m, diametro_pulgadas) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, ubicacion, nivel_estatico_m, nivel_dinamico_m, diametro_pulgadas]
    );
    res.status(201).json({ id: result.insertId, nombre, ubicacion });
  } catch (error) {
    console.error('Error al crear pozo:', error);
    res.status(500).json({ error: 'Error al crear el pozo' });
  }
});

// RUTA: Eliminar un pozo
app.delete('/api/wells/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pozos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar pozo:', error);
    res.status(500).json({ error: 'Error al eliminar el pozo' });
  }
});

// RUTA: Crear una nueva bomba
app.post('/api/equipment', async (req, res) => {
  try {
    const { marca, modelo, potencia_hp, caudal_max_lpm, altura_max_m, eficiencia_nominal } = req.body;
    if (!marca || !modelo) {
      return res.status(400).json({ error: 'Marca y modelo son obligatorios' });
    }
    const [result]: any = await pool.query(
      `INSERT INTO bombas (marca, modelo, potencia_hp, caudal_max_lpm, altura_max_m, eficiencia_nominal) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [marca, modelo, potencia_hp, caudal_max_lpm, altura_max_m, eficiencia_nominal]
    );
    res.status(201).json({ id: result.insertId, marca, modelo });
  } catch (error) {
    console.error('Error al crear bomba:', error);
    res.status(500).json({ error: 'Error al crear la bomba' });
  }
});

// RUTA: Eliminar una bomba
app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bombas WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar bomba:', error);
    res.status(500).json({ error: 'Error al eliminar la bomba' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
