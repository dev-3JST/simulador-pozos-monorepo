import type { Pozo, Bomba } from '../types';

const API_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Pozos
  getPozos: () => fetchJSON<Pozo[]>(`${API_URL}/wells`),
  crearPozo: (datos: any) =>
    fetchJSON(`${API_URL}/wells`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }),
  eliminarPozo: (id: number) =>
    fetchJSON(`${API_URL}/wells/${id}`, { method: 'DELETE' }),

  // Bombas
  getBombas: () => fetchJSON<Bomba[]>(`${API_URL}/equipment`),
  crearBomba: (datos: any) =>
    fetchJSON(`${API_URL}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }),
  eliminarBomba: (id: number) =>
    fetchJSON(`${API_URL}/equipment/${id}`, { method: 'DELETE' }),

  // Simulaciones
  getSimulaciones: () => fetchJSON<any[]>(`${API_URL}/simulations`),
  simular: (datos: any) =>
    fetchJSON(`${API_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }),
  eliminarSimulacion: (id: number) =>
    fetchJSON(`${API_URL}/simulations/${id}`, { method: 'DELETE' }),
};
