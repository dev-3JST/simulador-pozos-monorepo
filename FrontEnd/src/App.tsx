import { useEffect, useState } from 'react';
import { api } from './services/api';
import type { Pozo, Bomba } from './types';
import { OceanBackground } from './OceanBackground';
import './App.css';

type Vista = 'simulador' | 'catalogo' | 'historial';

function App() {
  const [vista, setVista] = useState<Vista>('simulador');

  const [pozos, setPozos] = useState<Pozo[]>([]);
  const [bombas, setBombas] = useState<Bomba[]>([]);
  const [simulaciones, setSimulaciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const [pozoSel, setPozoSel] = useState('');
  const [bombaSel, setBombaSel] = useState('');
  const [horas, setHoras] = useState('12');
  const [caudal, setCaudal] = useState('80');
  const [resultado, setResultado] = useState<any>(null);
  const [calculando, setCalculando] = useState(false);

  const [nuevoPozo, setNuevoPozo] = useState({
    nombre: '', ubicacion: '', nivel_estatico_m: '50',
    nivel_dinamico_m: '65', diametro_pulgadas: '6',
  });
  const [nuevaBomba, setNuevaBomba] = useState({
    marca: '', modelo: '', potencia_hp: '3',
    caudal_max_lpm: '80', altura_max_m: '120', eficiencia_nominal: '75',
  });

  const cargarTodo = async () => {
    try {
      const [p, b, s] = await Promise.all([
        api.getPozos(), api.getBombas(), api.getSimulaciones(),
      ]);
      setPozos(p);
      setBombas(b);
      setSimulaciones(s);
      if (p.length > 0 && !pozoSel) setPozoSel(p[0].id.toString());
      if (b.length > 0 && !bombaSel) setBombaSel(b[0].id.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []); // eslint-disable-line

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    setResultado(null);
    try {
      const res = await api.simular({
        pozo_id: Number(pozoSel),
        bomba_id: Number(bombaSel),
        horas_diarias: Number(horas),
        caudal_extraccion_lpm: Number(caudal),
      });
      setResultado(res);
      setSimulaciones(await api.getSimulaciones());
    } catch {
      alert('Error al calcular la simulación');
    } finally {
      setCalculando(false);
    }
  };

  const handleCrearPozo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crearPozo({
        ...nuevoPozo,
        nivel_estatico_m: Number(nuevoPozo.nivel_estatico_m),
        nivel_dinamico_m: Number(nuevoPozo.nivel_dinamico_m),
        diametro_pulgadas: Number(nuevoPozo.diametro_pulgadas),
      });
      setNuevoPozo({ nombre: '', ubicacion: '', nivel_estatico_m: '50', nivel_dinamico_m: '65', diametro_pulgadas: '6' });
      setPozos(await api.getPozos());
      alert('Pozo creado correctamente');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCrearBomba = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crearBomba({
        ...nuevaBomba,
        potencia_hp: Number(nuevaBomba.potencia_hp),
        caudal_max_lpm: Number(nuevaBomba.caudal_max_lpm),
        altura_max_m: Number(nuevaBomba.altura_max_m),
        eficiencia_nominal: Number(nuevaBomba.eficiencia_nominal),
      });
      setNuevaBomba({ marca: '', modelo: '', potencia_hp: '3', caudal_max_lpm: '80', altura_max_m: '120', eficiencia_nominal: '75' });
      setBombas(await api.getBombas());
      alert('Bomba creada correctamente');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminarPozo = async (id: number) => {
    if (!confirm('¿Eliminar este pozo?')) return;
    try {
      await api.eliminarPozo(id);
      setPozos(await api.getPozos());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminarBomba = async (id: number) => {
    if (!confirm('¿Eliminar esta bomba?')) return;
    try {
      await api.eliminarBomba(id);
      setBombas(await api.getBombas());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminarSimulacion = async (id: number) => {
    if (!confirm('¿Eliminar esta simulación?')) return;
    try {
      await api.eliminarSimulacion(id);
      setSimulaciones((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('No se pudo eliminar');
    }
  };

  const getAlertaClase = (estado: string) => {
    if (estado === 'Óptimo') return 'result-box success';
    if (estado === 'Alerta tarifaria') return 'result-box warning';
    return 'result-box danger';
  };

  const formatFecha = (f: string) => new Date(f).toLocaleString('es-BO');

  if (cargando) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="loading error">Error: {error}</div>;

  return (
    <>
      <OceanBackground />
      <div className="app-container">
        <header className="app-header">
          <h1>💧 Simulador de Pozos de Agua</h1>
          <p>Cálculo de precios, rendimiento energético y alertas preventivas</p>
        </header>

        <nav className="app-nav">
          <button className={vista === 'simulador' ? 'nav-btn active' : 'nav-btn'} onClick={() => setVista('simulador')}>
            Simulador
          </button>
          <button className={vista === 'catalogo' ? 'nav-btn active' : 'nav-btn'} onClick={() => setVista('catalogo')}>
            Catálogo
          </button>
          <button className={vista === 'historial' ? 'nav-btn active' : 'nav-btn'} onClick={() => setVista('historial')}>
            Historial ({simulaciones.length})
          </button>
        </nav>

        {vista === 'simulador' && (
          <div className="main-grid">
            <div className="card">
              <h2>Ingreso de Datos</h2>
              <form onSubmit={handleSimular}>
                <div className="form-group">
                  <label>Pozo</label>
                  <select value={pozoSel} onChange={(e) => setPozoSel(e.target.value)}>
                    {pozos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} — {p.ubicacion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Bomba</label>
                  <select value={bombaSel} onChange={(e) => setBombaSel(e.target.value)}>
                    {bombas.map((b) => (
                      <option key={b.id} value={b.id}>{b.marca} {b.modelo} — {b.potencia_hp} HP</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Horas diarias</label>
                  <input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} min="1" max="24" />
                </div>
                <div className="form-group">
                  <label>Caudal (LPM)</label>
                  <input type="number" value={caudal} onChange={(e) => setCaudal(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" disabled={calculando}>
                  {calculando ? 'Calculando...' : 'Calcular Simulación'}
                </button>
              </form>
            </div>

            <div className="card">
              <h2>Resultados</h2>
              {resultado ? (
                <div className={getAlertaClase(resultado.estado_alerta)}>
                  <h3>{resultado.estado_alerta}</h3>
                  <div className="result-row"><span>Consumo diario</span><strong>{resultado.consumo_kwh_dia} kWh</strong></div>
                  <div className="result-row"><span>Costo mensual</span><strong>${resultado.costo_mensual_usd} USD</strong></div>
                  <div className="result-row"><span>Eficiencia</span><strong>{resultado.eficiencia_hidraulica}%</strong></div>
                  <p className="note">* Con carro cisterna sería aprox. 86x más caro.</p>
                </div>
              ) : (
                <p className="result-empty">Completa los datos y presiona "Calcular Simulación".</p>
              )}
            </div>
          </div>
        )}

        {vista === 'catalogo' && (
          <>
            <div className="main-grid">
              <div className="card">
                <h2>➕ Registrar nuevo pozo</h2>
                <form onSubmit={handleCrearPozo}>
                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={nuevoPozo.nombre} onChange={(e) => setNuevoPozo({ ...nuevoPozo, nombre: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Ubicación</label>
                    <input value={nuevoPozo.ubicacion} onChange={(e) => setNuevoPozo({ ...nuevoPozo, ubicacion: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Nivel estático (m)</label>
                    <input type="number" value={nuevoPozo.nivel_estatico_m} onChange={(e) => setNuevoPozo({ ...nuevoPozo, nivel_estatico_m: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Nivel dinámico (m)</label>
                    <input type="number" value={nuevoPozo.nivel_dinamico_m} onChange={(e) => setNuevoPozo({ ...nuevoPozo, nivel_dinamico_m: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Diámetro (pulgadas)</label>
                    <input type="number" value={nuevoPozo.diametro_pulgadas} onChange={(e) => setNuevoPozo({ ...nuevoPozo, diametro_pulgadas: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary">Registrar Pozo</button>
                </form>
              </div>

              <div className="card">
                <h2>➕ Registrar nueva bomba</h2>
                <form onSubmit={handleCrearBomba}>
                  <div className="form-group">
                    <label>Marca</label>
                    <input value={nuevaBomba.marca} onChange={(e) => setNuevaBomba({ ...nuevaBomba, marca: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input value={nuevaBomba.modelo} onChange={(e) => setNuevaBomba({ ...nuevaBomba, modelo: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Potencia (HP)</label>
                    <input type="number" step="0.1" value={nuevaBomba.potencia_hp} onChange={(e) => setNuevaBomba({ ...nuevaBomba, potencia_hp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Caudal máx (LPM)</label>
                    <input type="number" value={nuevaBomba.caudal_max_lpm} onChange={(e) => setNuevaBomba({ ...nuevaBomba, caudal_max_lpm: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Altura máx (m)</label>
                    <input type="number" value={nuevaBomba.altura_max_m} onChange={(e) => setNuevaBomba({ ...nuevaBomba, altura_max_m: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Eficiencia (%)</label>
                    <input type="number" step="0.1" value={nuevaBomba.eficiencia_nominal} onChange={(e) => setNuevaBomba({ ...nuevaBomba, eficiencia_nominal: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary">Registrar Bomba</button>
                </form>
              </div>
            </div>

            <section className="table-section">
              <h2>Pozos registrados ({pozos.length})</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Ubicación</th><th>Nivel est.</th><th>Nivel din.</th><th>Diámetro</th><th></th></tr>
                  </thead>
                  <tbody>
                    {pozos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td>{p.ubicacion}</td>
                        <td>{p.nivel_estatico_m} m</td>
                        <td>{p.nivel_dinamico_m} m</td>
                        <td>{p.diametro_pulgadas}"</td>
                        <td><button className="btn-delete" onClick={() => handleEliminarPozo(p.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="table-section">
              <h2>Bombas registradas ({bombas.length})</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Marca</th><th>Modelo</th><th>HP</th><th>Caudal máx</th><th>Altura máx</th><th>Eficiencia</th><th></th></tr>
                  </thead>
                  <tbody>
                    {bombas.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.marca}</td>
                        <td>{b.modelo}</td>
                        <td>{b.potencia_hp}</td>
                        <td>{b.caudal_max_lpm} LPM</td>
                        <td>{b.altura_max_m} m</td>
                        <td>{b.eficiencia_nominal}%</td>
                        <td><button className="btn-delete" onClick={() => handleEliminarBomba(b.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {vista === 'historial' && (
          <section className="table-section">
            <h2>Historial de Simulaciones ({simulaciones.length})</h2>
            {simulaciones.length === 0 ? (
              <p className="result-empty">Aún no hay simulaciones registradas.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Fecha</th><th>Pozo</th><th>Bomba</th><th>Horas</th><th>kWh/día</th><th>Costo/mes</th><th>Alerta</th><th></th></tr>
                  </thead>
                  <tbody>
                    {simulaciones.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{formatFecha(s.fecha_simulacion)}</td>
                        <td>{s.pozo_nombre}</td>
                        <td>{s.bomba_marca} {s.bomba_modelo}</td>
                        <td>{s.horas_diarias}</td>
                        <td>{s.consumo_kwh_dia}</td>
                        <td>${s.costo_mensual_usd}</td>
                        <td>
                          <span className={`badge ${s.estado_alerta.toLowerCase().replace(/\s/g, '-')}`}>
                            {s.estado_alerta}
                          </span>
                        </td>
                        <td><button className="btn-delete" onClick={() => handleEliminarSimulacion(s.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default App;
